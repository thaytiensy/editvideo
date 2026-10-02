import os
import sys
import time
import uuid
import json
import shutil
import asyncio
import threading
import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any

# Ensure CPU only
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["ONNXRUNTIME_EXECUTION_PROVIDERS"] = "CPUExecutionProvider"

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import base64

# Try importing insightface
import insightface
from insightface.app import FaceAnalysis

app = FastAPI(title="FaceSwap Pro Video Editor Backend", version="2.0.0")

# Enable CORS for local Next.js/Vite frontend and Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories setup
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
EXPORT_DIR = BASE_DIR / "exports"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")

# Locate FFmpeg
def find_ffmpeg() -> str:
    possible_paths = [
        BASE_DIR / "tools" / "ffmpeg.exe",
        BASE_DIR.parent / "tools" / "ffmpeg.exe",
        Path("d:/sy lam ai cv online/editvideo doimat/tools/ffmpeg.exe"),
        Path("C:/ffmpeg/bin/ffmpeg.exe"),
    ]
    for p in possible_paths:
        if p.exists():
            return str(p.resolve())
    # Fallback to system PATH
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    return "ffmpeg"

FFMPEG_PATH = find_ffmpeg()
print(f"[*] Configured FFmpeg at: {FFMPEG_PATH}")

# Locate models
def find_models_dir() -> Path:
    possible_paths = [
        BASE_DIR / "models",
        BASE_DIR.parent / "models",
        Path("d:/sy lam ai cv online/editvideo doimat/models"),
    ]
    for p in possible_paths:
        if (p / "inswapper_128.onnx").exists():
            return p
    return BASE_DIR / "models"

MODELS_DIR = find_models_dir()
SWAPPER_PATH = MODELS_DIR / "inswapper_128.onnx"
print(f"[*] Using Models directory: {MODELS_DIR}")
print(f"[*] Using Swapper path: {SWAPPER_PATH}")

# Global model holders
face_analyzer: Optional[FaceAnalysis] = None
face_swapper: Optional[Any] = None
model_lock = threading.Lock()

def init_models():
    global face_analyzer, face_swapper
    with model_lock:
        if face_analyzer is None:
            print("[*] Loading FaceAnalysis (buffalo_l, CPU)...")
            try:
                # Buffalo_l root is MODELS_DIR
                face_analyzer = FaceAnalysis(name="buffalo_l", root=str(MODELS_DIR), providers=["CPUExecutionProvider"])
                face_analyzer.prepare(ctx_id=0, det_size=(320, 320))
                print("[OK] FaceAnalysis loaded.")
            except Exception as e:
                print(f"[!] Error loading FaceAnalysis: {e}")

        if face_swapper is None and SWAPPER_PATH.exists():
            print("[*] Loading INSWAPPER model (CPU)...")
            try:
                face_swapper = insightface.model_zoo.get_model(str(SWAPPER_PATH), providers=["CPUExecutionProvider"])
                print("[OK] INSWAPPER loaded.")
            except Exception as e:
                print(f"[!] Error loading INSWAPPER: {e}")

# Run init in background or on start
threading.Thread(target=init_models, daemon=True).start()

# In-memory jobs tracking
jobs_db: Dict[str, Dict[str, Any]] = {}
cancelled_jobs = set()

# Helper functions
def image_to_base64_jpeg(img_bgr: np.ndarray, quality: int = 85) -> str:
    _, buffer = cv2.imencode(".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

def crop_face(img: np.ndarray, bbox: List[float], pad_ratio: float = 0.25) -> np.ndarray:
    h, w = img.shape[:2]
    x1, y1, x2, y2 = bbox
    bw = x2 - x1
    bh = y2 - y1
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    side = max(bw, bh) * (1 + pad_ratio)
    nx1 = max(0, int(cx - side / 2))
    ny1 = max(0, int(cy - side / 2))
    nx2 = min(w, int(cx + side / 2))
    ny2 = min(h, int(cy + side / 2))
    return img[ny1:ny2, nx1:nx2]

def compute_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    if emb1 is None or emb2 is None:
        return 0.0
    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(emb1, emb2) / (norm1 * norm2))

# Request Schemas
class DetectFacesRequest(BaseModel):
    file_path: str
    timestamp: Optional[float] = 0.0

class SwapPreviewRequest(BaseModel):
    source_image_path: str
    target_image_path: Optional[str] = None
    target_video_path: Optional[str] = None
    timestamp: Optional[float] = 0.0
    target_face_index: Optional[int] = 0

class ExportVideoRequest(BaseModel):
    video_path: str
    source_image_path: str
    target_face_index: Optional[int] = -1 # -1 means swap all faces detected, or index of target face
    time_start: Optional[float] = 0.0
    time_end: Optional[float] = None
    resolution: Optional[str] = "1080p" # 720p, 1080p, 2k, 4k, 8k
    unify_character: Optional[bool] = True

# API Endpoints
@app.get("/api/health")
def health():
    return {
        "status": "online",
        "cpu_only": True,
        "models_dir": str(MODELS_DIR),
        "analyzer_ready": face_analyzer is not None,
        "swapper_ready": face_swapper is not None,
        "ffmpeg_path": FFMPEG_PATH,
        "ffmpeg_exists": os.path.exists(FFMPEG_PATH)
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_ext = Path(file.filename).suffix.lower()
        unique_name = f"{uuid.uuid4().hex[:10]}_{file.filename}"
        dest_path = UPLOAD_DIR / unique_name

        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Inspect file
        is_video = file_ext in [".mp4", ".mov", ".avi", ".mkv", ".webm"]
        is_image = file_ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]

        info = {
            "file_id": unique_name,
            "filename": file.filename,
            "file_path": str(dest_path.resolve()),
            "url": f"/uploads/{unique_name}",
            "type": "video" if is_video else ("image" if is_image else "other"),
            "width": 0,
            "height": 0,
            "duration": 0.0,
            "fps": 30.0,
            "frame_count": 0,
            "thumbnail": ""
        }

        if is_image:
            img = cv2.imread(str(dest_path))
            if img is not None:
                h, w = img.shape[:2]
                info["width"] = w
                info["height"] = h
                thumb = cv2.resize(img, (min(320, w), int(h * min(320, w) / w)))
                info["thumbnail"] = image_to_base64_jpeg(thumb, 70)
        elif is_video:
            cap = cv2.VideoCapture(str(dest_path))
            if cap.isOpened():
                info["width"] = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                info["height"] = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                info["fps"] = float(cap.get(cv2.CAP_PROP_FPS)) or 30.0
                info["frame_count"] = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                if info["fps"] > 0:
                    info["duration"] = round(info["frame_count"] / info["fps"], 2)
                ret, frame = cap.read()
                if ret and frame is not None:
                    h, w = frame.shape[:2]
                    thumb = cv2.resize(frame, (min(320, w), int(h * min(320, w) / w)))
                    info["thumbnail"] = image_to_base64_jpeg(thumb, 70)
                cap.release()

        return JSONResponse(status_code=200, content=info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect-faces")
def detect_faces(req: DetectFacesRequest):
    init_models()
    if face_analyzer is None:
        raise HTTPException(status_code=503, detail="Face detection model is still initializing. Please retry in a few seconds.")

    file_path = Path(req.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    is_video = file_path.suffix.lower() in [".mp4", ".mov", ".avi", ".mkv", ".webm"]
    frame = None

    if is_video:
        cap = cv2.VideoCapture(str(file_path))
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Cannot read video file")
        
        target_frame_num = int(req.timestamp * (cap.get(cv2.CAP_PROP_FPS) or 30.0))
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, target_frame_num))
        ret, frame = cap.read()
        cap.release()
        if not ret or frame is None:
            raise HTTPException(status_code=400, detail="Could not extract frame at given timestamp")
    else:
        frame = cv2.imread(str(file_path))
        if frame is None:
            raise HTTPException(status_code=400, detail="Cannot read image file")

    h, w = frame.shape[:2]

    # Run face detection
    with model_lock:
        faces = face_analyzer.get(frame)

    result_faces = []
    # Sort faces left-to-right
    faces = sorted(faces, key=lambda f: f.bbox[0])

    for idx, face in enumerate(faces):
        bbox = [float(x) for x in face.bbox]
        # Crop face thumbnail
        crop = crop_face(frame, bbox)
        crop_thumb = ""
        if crop.size > 0:
            crop_thumb = image_to_base64_jpeg(cv2.resize(crop, (128, 128)), quality=85)

        landmarks = []
        if hasattr(face, "kps") and face.kps is not None:
            landmarks = [[float(p[0]), float(p[1])] for p in face.kps]

        result_faces.append({
            "index": idx,
            "bbox": bbox, # [x1, y1, x2, y2]
            "normalized_bbox": [bbox[0]/w, bbox[1]/h, bbox[2]/w, bbox[3]/h],
            "landmarks": landmarks,
            "det_score": float(face.det_score) if hasattr(face, "det_score") else 1.0,
            "gender": "M" if (hasattr(face, "gender") and face.gender == 1) else "F",
            "age": int(face.age) if hasattr(face, "age") else 25,
            "thumbnail": crop_thumb
        })

    # Generate frame preview with bounding boxes
    preview_thumb = image_to_base64_jpeg(frame, quality=80)

    return {
        "face_count": len(result_faces),
        "faces": result_faces,
        "width": w,
        "height": h,
        "frame_preview": preview_thumb
    }

@app.post("/api/swap-preview")
def swap_preview(req: SwapPreviewRequest):
    init_models()
    if face_analyzer is None or face_swapper is None:
        raise HTTPException(status_code=503, detail="Models are initializing. Please wait.")

    source_path = Path(req.source_image_path)
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Source image not found")

    source_img = cv2.imread(str(source_path))
    if source_img is None:
        raise HTTPException(status_code=400, detail="Invalid source image")

    with model_lock:
        source_faces = face_analyzer.get(source_img)

    if not source_faces:
        raise HTTPException(status_code=400, detail="No face detected in source replacement image")

    source_face = source_faces[0]

    # Target frame extraction
    target_frame = None
    if req.target_video_path:
        v_path = Path(req.target_video_path)
        if not v_path.exists():
            raise HTTPException(status_code=404, detail="Target video not found")
        cap = cv2.VideoCapture(str(v_path))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_idx = int(req.timestamp * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, frame_idx))
        ret, target_frame = cap.read()
        cap.release()
    elif req.target_image_path:
        t_path = Path(req.target_image_path)
        if not t_path.exists():
            raise HTTPException(status_code=404, detail="Target image not found")
        target_frame = cv2.imread(str(t_path))

    if target_frame is None:
        raise HTTPException(status_code=400, detail="Could not load target frame")

    with model_lock:
        target_faces = face_analyzer.get(target_frame)

    if not target_faces:
        raise HTTPException(status_code=400, detail="No face detected in target frame")

    target_faces = sorted(target_faces, key=lambda f: f.bbox[0])
    selected_idx = req.target_face_index if (req.target_face_index is not None and req.target_face_index < len(target_faces)) else 0
    chosen_face = target_faces[selected_idx]

    # Perform swap
    with model_lock:
        swapped_frame = face_swapper.get(target_frame, chosen_face, source_face, paste_back=True)

    result_b64 = image_to_base64_jpeg(swapped_frame, quality=85)
    return {
        "status": "success",
        "swapped_image": result_b64,
        "target_face_index": selected_idx
    }

# Background worker for full video export
def run_video_export(job_id: str, req: ExportVideoRequest):
    try:
        init_models()
        jobs_db[job_id]["status"] = "processing"
        jobs_db[job_id]["progress"] = 1.0

        v_path = Path(req.video_path)
        s_path = Path(req.source_image_path)

        if not v_path.exists() or not s_path.exists():
            jobs_db[job_id]["status"] = "failed"
            jobs_db[job_id]["error"] = "Input files do not exist"
            return

        # Read source face
        src_img = cv2.imread(str(s_path))
        with model_lock:
            src_faces = face_analyzer.get(src_img)
        if not src_faces:
            jobs_db[job_id]["status"] = "failed"
            jobs_db[job_id]["error"] = "No face found in source image"
            return
        source_face = src_faces[0]

        cap = cv2.VideoCapture(str(v_path))
        orig_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # Resolution map
        res_map = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "2k": (2560, 1440),
            "4k": (3840, 2160),
            "8k": (7680, 4320)
        }
        target_res = res_map.get(req.resolution.lower() if req.resolution else "1080p", (orig_width, orig_height))
        out_w, out_h = target_res

        # In/Out frame boundaries
        start_sec = req.time_start or 0.0
        start_frame = max(0, int(start_sec * orig_fps))
        end_frame = total_video_frames
        if req.time_end is not None and req.time_end > start_sec:
            end_frame = min(total_video_frames, int(req.time_end * orig_fps))

        frames_to_process = max(1, end_frame - start_frame)
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        # Target reference embedding for tracking/unifying character across scenes
        target_ref_embedding = None
        if req.target_face_index is not None and req.target_face_index >= 0:
            # Detect reference face from start frame
            ret, first_frame = cap.read()
            if ret and first_frame is not None:
                with model_lock:
                    ff_faces = face_analyzer.get(first_frame)
                ff_faces = sorted(ff_faces, key=lambda f: f.bbox[0])
                if req.target_face_index < len(ff_faces):
                    target_ref_embedding = ff_faces[req.target_face_index].embedding
            cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        # Setup temp raw video path
        temp_raw_video = EXPORT_DIR / f"temp_{job_id}.mp4"
        final_output = EXPORT_DIR / f"export_{job_id}_{req.resolution or '1080p'}.mp4"

        # OpenCV VideoWriter for swapped frames (we write in original frame size or target size)
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(str(temp_raw_video), fourcc, orig_fps, (orig_width, orig_height))

        processed_count = 0
        start_time_stamp = time.time()

        while processed_count < frames_to_process:
            if job_id in cancelled_jobs:
                cap.release()
                writer.release()
                if temp_raw_video.exists():
                    temp_raw_video.unlink()
                jobs_db[job_id]["status"] = "cancelled"
                return

            ret, frame = cap.read()
            if not ret or frame is None:
                break

            # Face swap
            with model_lock:
                frame_faces = face_analyzer.get(frame)

            if frame_faces:
                # Decide which faces to swap
                if req.target_face_index == -1:
                    # Swap ALL detected faces
                    for f in frame_faces:
                        with model_lock:
                            frame = face_swapper.get(frame, f, source_face, paste_back=True)
                elif target_ref_embedding is not None and req.unify_character:
                    # Match by cosine similarity to reference face
                    best_face = None
                    best_sim = -1.0
                    for f in frame_faces:
                        sim = compute_similarity(f.embedding, target_ref_embedding)
                        if sim > best_sim:
                            best_sim = sim
                            best_face = f
                    # Threshold for same character
                    if best_face is not None and best_sim > 0.35:
                        with model_lock:
                            frame = face_swapper.get(frame, best_face, source_face, paste_back=True)
                else:
                    # Fallback to index if available
                    frame_faces = sorted(frame_faces, key=lambda f: f.bbox[0])
                    idx = req.target_face_index or 0
                    if idx < len(frame_faces):
                        with model_lock:
                            frame = face_swapper.get(frame, frame_faces[idx], source_face, paste_back=True)

            writer.write(frame)
            processed_count += 1

            # Update stats every 5 frames
            if processed_count % 5 == 0 or processed_count == frames_to_process:
                elapsed = time.time() - start_time_stamp
                current_fps = processed_count / max(0.1, elapsed)
                rem_frames = frames_to_process - processed_count
                eta = rem_frames / max(0.1, current_fps)
                pct = round((processed_count / frames_to_process) * 90.0, 1) # up to 90% for swap, 10% for ffmpeg
                jobs_db[job_id]["progress"] = pct
                jobs_db[job_id]["current_frame"] = processed_count
                jobs_db[job_id]["total_frames"] = frames_to_process
                jobs_db[job_id]["fps"] = round(current_fps, 1)
                jobs_db[job_id]["eta_seconds"] = int(eta)

        cap.release()
        writer.release()

        # Step 2: FFmpeg remux audio & upscale/render final resolution
        jobs_db[job_id]["progress"] = 92.0
        jobs_db[job_id]["stage"] = "Muxing audio & encoding final resolution with FFmpeg..."

        # Calculate duration
        clip_duration = (end_frame - start_frame) / orig_fps

        # Construct FFmpeg command
        # Re-encode to requested resolution and copy original audio sliced at start_sec
        scale_filter = f"scale={out_w}:{out_h}:flags=lanczos" if (out_w != orig_width or out_h != orig_height) else "null"

        ffmpeg_cmd = [
            FFMPEG_PATH,
            "-y",
            "-i", str(temp_raw_video),
            "-ss", str(start_sec),
            "-t", str(clip_duration),
            "-i", str(v_path),
            "-vf", scale_filter,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            "-map", "0:v:0",
            "-map", "1:a:0?",
            "-shortest",
            str(final_output)
        ]

        print(f"[*] Running FFmpeg: {' '.join(ffmpeg_cmd)}")
        proc = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Cleanup temp raw video
        if temp_raw_video.exists():
            temp_raw_video.unlink()

        if proc.returncode != 0:
            print(f"[!] FFmpeg warning/error: {proc.stderr.decode('utf-8', errors='ignore')[:300]}")
            # If failed with audio mapping, try simple copy without audio mapping
            fallback_cmd = [
                FFMPEG_PATH, "-y",
                "-i", str(temp_raw_video),
                "-vf", scale_filter,
                "-c:v", "libx264", "-preset", "ultrafast",
                str(final_output)
            ]
            subprocess.run(fallback_cmd)

        jobs_db[job_id]["progress"] = 100.0
        jobs_db[job_id]["status"] = "completed"
        jobs_db[job_id]["output_file"] = final_output.name
        jobs_db[job_id]["download_url"] = f"/exports/{final_output.name}"
        jobs_db[job_id]["resolution"] = f"{out_w}x{out_h}"
        print(f"[OK] Export completed for job {job_id}: {final_output.name}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        jobs_db[job_id]["status"] = "failed"
        jobs_db[job_id]["error"] = str(e)

@app.post("/api/export-video")
def export_video(req: ExportVideoRequest, background_tasks: BackgroundTasks):
    job_id = uuid.uuid4().hex[:12]
    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0.0,
        "current_frame": 0,
        "total_frames": 0,
        "fps": 0.0,
        "eta_seconds": 0,
        "output_file": "",
        "download_url": "",
        "error": None
    }
    background_tasks.add_task(run_video_export, job_id, req)
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs_db[job_id]

@app.post("/api/jobs/{job_id}/cancel")
def cancel_job(job_id: str):
    if job_id in jobs_db:
        cancelled_jobs.add(job_id)
        jobs_db[job_id]["status"] = "cancelling"
        return {"status": "cancelling"}
    raise HTTPException(status_code=404, detail="Job not found")

@app.get("/api/download/{filename}")
def download_export(filename: str):
    target = EXPORT_DIR / filename
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(str(target), media_type="video/mp4", filename=filename)

# ==========================================================
# MODULE BÁN APP & LICENSE (SY-XXXX-XXXX)
# ==========================================================
LICENSES_FILE = BASE_DIR / "backend" / "licenses.json"
ADMIN_AUTH_FILE = BASE_DIR / "backend" / "admin_auth.json"

def get_admin_passwords() -> Dict[str, str]:
    if ADMIN_AUTH_FILE.exists():
        try:
            with open(ADMIN_AUTH_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"admin": "123456", "thaytiensy@gmail.com": "12345678"}

def save_admin_passwords(data: Dict[str, str]):
    with open(ADMIN_AUTH_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_licenses_db() -> List[Dict[str, Any]]:
    if LICENSES_FILE.exists():
        try:
            with open(LICENSES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # Initial seeds
    initial = [
        {
            "id": "lic-sy-001",
            "email_or_phone": "thaytiensy@gmail.com",
            "license_key": "SY-VIP9-9999",
            "plan": "LIFETIME",
            "is_active": True,
            "expires_at": "NEVER",
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "lic-sy-002",
            "email_or_phone": "admin",
            "license_key": "SY-PRO8-8888",
            "plan": "LIFETIME",
            "is_active": True,
            "expires_at": "NEVER",
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "lic-sy-003",
            "email_or_phone": "khachhang@gmail.com",
            "license_key": "SY-DEMO-30DY",
            "plan": "1_MONTH",
            "is_active": True,
            "expires_at": "2026-11-02T18:00:00Z",
            "created_at": "2026-10-02T18:00:00Z"
        }
    ]
    save_licenses_db(initial)
    return initial

def save_licenses_db(lics: List[Dict[str, Any]]):
    with open(LICENSES_FILE, "w", encoding="utf-8") as f:
        json.dump(lics, f, indent=2, ensure_ascii=False)

def generate_sy_key() -> str:
    part1 = uuid.uuid4().hex[:4].upper()
    part2 = uuid.uuid4().hex[:4].upper()
    return f"SY-{part1}-{part2}"

class CreateLicenseRequest(BaseModel):
    email_or_phone: str
    plan: Optional[str] = "1_MONTH" # 1_MONTH, 1_YEAR, LIFETIME, PRO
    duration_days: Optional[int] = 30
    notes: Optional[str] = ""

class ToggleLicenseRequest(BaseModel):
    license_key: str

class ActivateLicenseRequest(BaseModel):
    license_key: str
    email_or_phone: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    username: str
    old_password: str
    new_password: str

@app.get("/admin/licenses")
def get_all_licenses():
    return load_licenses_db()

@app.post("/admin/licenses/create")
def create_license(req: CreateLicenseRequest):
    lics = load_licenses_db()
    key = generate_sy_key()
    
    expires_at = "NEVER"
    if req.plan != "LIFETIME":
        days = req.duration_days or (365 if req.plan == "1_YEAR" else 30)
        from datetime import datetime, timedelta, timezone
        exp_dt = datetime.now(timezone.utc) + timedelta(days=days)
        expires_at = exp_dt.isoformat()

    from datetime import datetime, timezone
    new_lic = {
        "id": f"lic-{uuid.uuid4().hex[:8]}",
        "email_or_phone": req.email_or_phone.strip(),
        "license_key": key,
        "plan": req.plan or "1_MONTH",
        "is_active": True,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "notes": req.notes or ""
    }
    lics.insert(0, new_lic)
    save_licenses_db(lics)
    return new_lic

@app.post("/admin/licenses/toggle")
def toggle_license(req: ToggleLicenseRequest):
    lics = load_licenses_db()
    for lic in lics:
        if lic["license_key"].upper() == req.license_key.strip().upper():
            lic["is_active"] = not lic["is_active"]
            save_licenses_db(lics)
            return {"success": True, "license": lic}
    raise HTTPException(status_code=404, detail="Không tìm thấy License Key")

@app.post("/admin/licenses/revoke")
def revoke_license(req: ToggleLicenseRequest):
    lics = load_licenses_db()
    for lic in lics:
        if lic["license_key"].upper() == req.license_key.strip().upper():
            lic["is_active"] = False
            save_licenses_db(lics)
            return {"success": True, "message": "Đã thu hồi bản quyền thành công", "license": lic}
    raise HTTPException(status_code=404, detail="Không tìm thấy License Key")

@app.post("/auth/activate")
def activate_license(req: ActivateLicenseRequest):
    lics = load_licenses_db()
    target_key = req.license_key.strip().upper()
    
    for lic in lics:
        if lic["license_key"].upper() == target_key:
            if not lic["is_active"]:
                raise HTTPException(status_code=403, detail="License này đã bị vô hiệu hóa hoặc thu hồi bởi Quản trị viên.")
            
            # Check expiration
            if lic["expires_at"] != "NEVER":
                from datetime import datetime, timezone
                try:
                    exp_dt = datetime.fromisoformat(lic["expires_at"].replace("Z", "+00:00"))
                    if datetime.now(timezone.utc) > exp_dt:
                        raise HTTPException(status_code=403, detail="License này đã hết hạn sử dụng. Vui lòng liên hệ để gia hạn.")
                except Exception as e:
                    pass

            return {
                "success": True,
                "message": "Kích hoạt bản quyền thành công!",
                "license": lic
            }
            
    raise HTTPException(status_code=404, detail="Mã License Key không tồn tại trên hệ thống.")

@app.get("/auth/license-status")
def check_license_status(key: str):
    lics = load_licenses_db()
    target_key = key.strip().upper()
    for lic in lics:
        if lic["license_key"].upper() == target_key:
            is_expired = False
            if lic["expires_at"] != "NEVER":
                from datetime import datetime, timezone
                try:
                    exp_dt = datetime.fromisoformat(lic["expires_at"].replace("Z", "+00:00"))
                    is_expired = datetime.now(timezone.utc) > exp_dt
                except Exception:
                    pass
            return {
                "valid": lic["is_active"] and not is_expired,
                "is_active": lic["is_active"],
                "is_expired": is_expired,
                "license": lic
            }
    return {"valid": False, "reason": "Không tìm thấy key"}

@app.post("/admin/change-password")
def change_admin_password(req: ChangePasswordRequest):
    auth_data = get_admin_passwords()
    username = req.username.strip().lower()
    current_stored = auth_data.get(username, "123456" if username == "admin" else "12345678")
    
    if req.old_password != current_stored:
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác!")
    
    auth_data[username] = req.new_password
    save_admin_passwords(auth_data)
    return {"success": True, "message": "Đổi mật khẩu thành công!"}

# ==========================================================
# MODULE TÍCH HỢP AI CLOUD BYOK (Veo 3, D-ID, Grok)
# ==========================================================
class GrokScriptRequest(BaseModel):
    api_key: str
    topic: str
    style: Optional[str] = "viral"

class DIDAnimateRequest(BaseModel):
    api_key: str
    source_url: str
    script: str

class VeoGenerateRequest(BaseModel):
    api_key: str
    prompt: str
    aspect_ratio: Optional[str] = "16:9"

@app.post("/api/ai/grok-script")
async def generate_grok_script(req: GrokScriptRequest):
    import requests
    headers = {
        "Authorization": f"Bearer {req.api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "grok-2",
        "messages": [
            {
                "role": "system",
                "content": "Bạn là chuyên gia biên kịch video ngắn triệu view CapCut / TikTok. Viết kịch bản video ngắn cuốn hút, có hook 3 giây đầu, phân cảnh rõ ràng và prompt hình ảnh để ghép mặt."
            },
            {
                "role": "user",
                "content": f"Chủ đề video: {req.topic}. Phong cách: {req.style}"
            }
        ]
    }
    try:
        res = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            content = data["choices"][0]["message"]["content"]
            return {"success": True, "script": content}
        else:
            return {"success": False, "error": res.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/ai/did-animate")
async def animate_talking_avatar(req: DIDAnimateRequest):
    import requests
    headers = {
        "Authorization": f"Basic {req.api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "source_url": req.source_url,
        "script": {
            "type": "text",
            "subtitles": "false",
            "provider": { "type": "microsoft", "voice_id": "vi-VN-HoaiMyNeural" },
            "input": req.script
        },
        "config": { "fluent": "false", "pad_audio": "0.0" }
    }
    try:
        res = requests.post("https://api.d-id.com/talks", headers=headers, json=payload, timeout=30)
        if res.status_code in [200, 201]:
            return {"success": True, "data": res.json()}
        else:
            return {"success": False, "error": res.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

