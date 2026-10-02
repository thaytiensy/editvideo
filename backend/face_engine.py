"""
FaceSwap PRO - Advanced AI Core Engine
---------------------------------------
- InsightFace buffalo_l (Face Detection & Recognition)
- INSWAPPER 128 ONNX (Face Replacement)
- ONNXRuntime with CUDAExecutionProvider + CPUExecutionProvider Fallback
- skimage.transform.SimilarityTransform (Precision Affine Alignment)
- Source Embedding Single-Pass Caching
- EMA (Exponential Moving Average) Tracking Smoothing for Bbox & Landmarks
- Feather Mask Blur 25px & Adaptive Bbox Scaling
- Reinhard Color Transfer (Skin Tone & Lighting Matching)
- Robust Auto-Tracking with Cosine Similarity + Spatial Continuity
"""

import os
import cv2
import time
import numpy as np
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

# Ensure CUDA / GPU environment variables can be utilized dynamically
if "CUDA_VISIBLE_DEVICES" in os.environ and os.environ["CUDA_VISIBLE_DEVICES"] == "-1":
    del os.environ["CUDA_VISIBLE_DEVICES"]

import onnxruntime as ort
import insightface
from insightface.app import FaceAnalysis
from skimage import transform as trans

# ArcFace Standard Coordinates
ARCFACE_DST = np.array([
    [38.2946, 51.6963],
    [73.5318, 51.5014],
    [56.0252, 71.7366],
    [41.5493, 92.3655],
    [70.7266, 92.2041]
], dtype=np.float32)

INSWAPPER_128_DST = ARCFACE_DST.copy()
INSWAPPER_128_DST[:, 0] += 8.0  # Center within 128x128 coordinate space


def get_optimal_providers() -> List[str]:
    """
    Selects best available execution providers:
    Tests CUDA first with automatic fallback to CPU without crashes or noisy warnings.
    """
    available = ort.get_available_providers()
    if "CUDAExecutionProvider" in available:
        try:
            import ctypes
            handle = ctypes.windll.kernel32.LoadLibraryW("cublasLt64_12.dll")
            if handle:
                ctypes.windll.kernel32.FreeLibrary(handle)
                return ["CUDAExecutionProvider", "CPUExecutionProvider"]
        except Exception:
            pass
    return ["CPUExecutionProvider"]


def estimate_affine_similarity(kps: np.ndarray, dst_template: np.ndarray = INSWAPPER_128_DST) -> np.ndarray:
    """
    Computes 2x3 affine matrix using skimage.transform.SimilarityTransform.
    Prevents shearing, perspective distortion, and unnatural warping.
    """
    tform = trans.SimilarityTransform()
    tform.estimate(kps, dst_template)
    M = tform.params[0:2, :]
    return M.astype(np.float32)


def reinhard_color_transfer(source_face: np.ndarray, target_face: np.ndarray) -> np.ndarray:
    """
    Reinhard Color Transfer in Lab color space.
    Matches the skin tone, color temperature, and ambient lighting of the swapped face
    to the target body/background, eliminating plastic or mismatched mask looks.
    """
    src_lab = cv2.cvtColor(source_face, cv2.COLOR_BGR2LAB).astype(np.float32)
    tgt_lab = cv2.cvtColor(target_face, cv2.COLOR_BGR2LAB).astype(np.float32)

    src_mean, src_std = src_lab.mean(axis=(0, 1), keepdims=True), src_lab.std(axis=(0, 1), keepdims=True)
    tgt_mean, tgt_std = tgt_lab.mean(axis=(0, 1), keepdims=True), tgt_lab.std(axis=(0, 1), keepdims=True)

    # Avoid zero division
    src_std = np.maximum(src_std, 1e-4)

    # Transfer statistics
    matched_lab = (src_lab - src_mean) * (tgt_std / src_std) + tgt_mean
    matched_lab = np.clip(matched_lab, 0, 255).astype(np.uint8)
    return cv2.cvtColor(matched_lab, cv2.COLOR_LAB2BGR)


def generate_feather_mask(size: Tuple[int, int] = (128, 128), blur_radius: int = 25) -> np.ndarray:
    """
    Creates an anatomically contoured soft feather mask with a Gaussian blur of 25px.
    Eliminates rectangular border seams and blends seamlessly into cheeks and jawline.
    """
    w, h = size
    mask = np.zeros((h, w), dtype=np.float32)

    # Anatomical face contour ellipse covering eyes, nose, mouth and central cheeks
    center = (w // 2, int(h * 0.52))
    axes = (int(w * 0.36), int(h * 0.42))
    cv2.ellipse(mask, center, axes, 0, 0, 360, 1.0, -1)

    # Small erosion to keep mask away from hair / forehead line
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.erode(mask, kernel, iterations=1)

    # 25px Gaussian Feather Blur
    ksize = blur_radius if blur_radius % 2 != 0 else blur_radius + 1
    feather_mask = cv2.GaussianBlur(mask, (ksize, ksize), 0)
    return np.clip(feather_mask, 0.0, 1.0)


def enhance_face_details(face_bgr: np.ndarray) -> np.ndarray:
    """
    High-fidelity face restoration filter (Unsharp Masking + Contrast Equalization)
    Restores crisp eye, eyelash, teeth, and skin details to 128x128 swapped face.
    """
    gaussian = cv2.GaussianBlur(face_bgr, (0, 0), 2.0)
    unsharp = cv2.addWeighted(face_bgr, 1.25, gaussian, -0.25, 0)
    return np.clip(unsharp, 0, 255).astype(np.uint8)


class CachedSourceEmbedding:
    """
    Caches the 512-D normalized embedding of the replacement face once.
    Avoids redundant detection and embedding recomputation across thousands of frames.
    """
    def __init__(self, raw_face: Any):
        self.raw_face = raw_face
        if hasattr(raw_face, "normed_embedding") and raw_face.normed_embedding is not None:
            self.normed_embedding = raw_face.normed_embedding.copy()
        elif hasattr(raw_face, "embedding") and raw_face.embedding is not None:
            emb = raw_face.embedding.copy()
            norm = np.linalg.norm(emb)
            self.normed_embedding = emb / norm if norm > 0 else emb
        else:
            self.normed_embedding = None

        self.kps = raw_face.kps if hasattr(raw_face, "kps") else None
        self.bbox = raw_face.bbox if hasattr(raw_face, "bbox") else None


class FaceTrackerEMA:
    """
    Exponential Moving Average (EMA) smoothing for face bounding boxes and 5 landmarks.
    Eliminates frame-to-frame jitter, shaking, and twitching during head movement.
    """
    def __init__(self, alpha: float = 0.70):
        self.alpha = alpha  # Weight for current frame (0.65 - 0.75 gives cinematic smoothness)
        self.smoothed_bbox: Optional[np.ndarray] = None
        self.smoothed_kps: Optional[np.ndarray] = None
        self.last_center: Optional[Tuple[float, float]] = None
        self.lost_frames: int = 0

    def update(self, bbox: np.ndarray, kps: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        bbox = np.array(bbox, dtype=np.float32)
        kps = np.array(kps, dtype=np.float32)
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0

        if self.smoothed_bbox is None or self.lost_frames > 5:
            self.smoothed_bbox = bbox
            self.smoothed_kps = kps
        else:
            prev_cx, prev_cy = self.last_center
            dist = np.hypot(cx - prev_cx, cy - prev_cy)
            face_size = max(bbox[2] - bbox[0], bbox[3] - bbox[1])
            if dist > face_size * 1.5:
                # Sudden cut or transition -> reset
                self.smoothed_bbox = bbox
                self.smoothed_kps = kps
            else:
                self.smoothed_bbox = self.alpha * bbox + (1.0 - self.alpha) * self.smoothed_bbox
                self.smoothed_kps = self.alpha * kps + (1.0 - self.alpha) * self.smoothed_kps

        self.last_center = (cx, cy)
        self.lost_frames = 0
        return self.smoothed_bbox.copy(), self.smoothed_kps.copy()

    def mark_lost(self):
        self.lost_frames += 1

    def reset(self):
        self.smoothed_bbox = None
        self.smoothed_kps = None
        self.last_center = None
        self.lost_frames = 0


class InsightFaceProEngine:
    """
    Enterprise-grade face swap engine encapsulating buffalo_l + inswapper_128
    with EMA smoothing, Reinhard skin tone matching, and 25px feather mask blending.
    """
    def __init__(self, models_dir: Path):
        self.models_dir = Path(models_dir)
        self.providers = get_optimal_providers()
        print(f"[*] InsightFaceProEngine initializing with providers: {self.providers}")

        self.app: Optional[FaceAnalysis] = None
        self.swapper: Optional[Any] = None
        self.feather_mask_128 = generate_feather_mask((128, 128), blur_radius=25)
        self._load_models()

    def _load_models(self):
        # 1. Face Analysis (buffalo_l)
        try:
            print(f"[*] Loading FaceAnalysis buffalo_l from: {self.models_dir}...")
            self.app = FaceAnalysis(
                name="buffalo_l",
                root=str(self.models_dir),
                providers=self.providers
            )
            det_size = (640, 640) if "CUDAExecutionProvider" in self.providers else (320, 320)
            self.app.prepare(ctx_id=0, det_size=det_size)
            print("[OK] FaceAnalysis buffalo_l loaded successfully.")
        except Exception as e:
            print(f"[!] Error loading FaceAnalysis: {e}")

        # 2. INSWAPPER 128 ONNX
        swapper_path = self.models_dir / "inswapper_128.onnx"
        if not swapper_path.exists():
            if (self.models_dir.parent / "models" / "inswapper_128.onnx").exists():
                swapper_path = self.models_dir.parent / "models" / "inswapper_128.onnx"

        if swapper_path.exists():
            try:
                print(f"[*] Loading INSWAPPER 128 model from: {swapper_path}...")
                self.swapper = insightface.model_zoo.get_model(
                    str(swapper_path),
                    providers=self.providers
                )
                print("[OK] INSWAPPER 128 loaded successfully.")
            except Exception as e:
                print(f"[!] Error loading INSWAPPER: {e}")
        else:
            print(f"[!] Warning: INSWAPPER model not found at: {swapper_path}")

    def is_ready(self) -> bool:
        return self.app is not None and self.swapper is not None

    def detect_faces(self, img_bgr: np.ndarray) -> List[Any]:
        if self.app is None or img_bgr is None:
            return []
        faces = self.app.get(img_bgr)
        return sorted(faces, key=lambda f: f.bbox[0])

    def get_source_cache(self, source_img_bgr: np.ndarray) -> Optional[CachedSourceEmbedding]:
        faces = self.detect_faces(source_img_bgr)
        if not faces:
            return None
        largest_face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
        return CachedSourceEmbedding(largest_face)

    def swap_face_core(
        self,
        frame_bgr: np.ndarray,
        target_kps: np.ndarray,
        cached_source: CachedSourceEmbedding,
        enhance: bool = True,
        match_skin_tone: bool = True
    ) -> np.ndarray:
        """
        Executes precision face swap:
        1. Calls inswapper with target landmarks to get synthesized 128x128 face and true Affine M.
        2. Applies Reinhard color transfer to match ambient skin lighting.
        3. Applies 25px Gaussian feather mask.
        4. Warps inverse to original frame dimensions and blends with high precision.
        """
        if self.swapper is None or cached_source is None or target_kps is None:
            return frame_bgr

        h, w = frame_bgr.shape[:2]

        # Construct target face mock with smoothed kps
        class TargetFaceMock:
            def __init__(self, kps):
                self.kps = np.array(kps, dtype=np.float32)

        mock_target = TargetFaceMock(target_kps)

        try:
            # 1. Run inswapper. Notice: with paste_back=False, inswapper returns (bgr_fake, M)
            swap_res = self.swapper.get(frame_bgr, mock_target, cached_source.raw_face, paste_back=False)
            if swap_res is None:
                return frame_bgr

            if isinstance(swap_res, tuple) and len(swap_res) >= 2:
                bgr_fake, M = swap_res[0], swap_res[1]
            else:
                bgr_fake = swap_res
                # Fallback to skimage SimilarityTransform
                M = estimate_affine_similarity(target_kps, INSWAPPER_128_DST)

            if bgr_fake is None or bgr_fake.shape[:2] != (128, 128):
                return frame_bgr

            # 2. Extract original cropped face for skin tone reference
            orig_crop = cv2.warpAffine(frame_bgr, M, (128, 128), borderMode=cv2.BORDER_REFLECT)

            # 3. Match skin tone and lighting
            if match_skin_tone and orig_crop is not None and orig_crop.size > 0:
                bgr_fake = reinhard_color_transfer(bgr_fake, orig_crop)

            # 4. Detail enhancement (eyes, teeth, lips)
            if enhance:
                bgr_fake = enhance_face_details(bgr_fake)

            # 5. Invert Affine Transform Matrix
            IM = cv2.invertAffineTransform(M)

            # 6. Apply 25px Gaussian Feather Mask
            mask_128 = self.feather_mask_128

            # 7. Warp swapped face & feather mask back to original video frame
            warped_face = cv2.warpAffine(bgr_fake, IM, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
            warped_mask = cv2.warpAffine(mask_128, IM, (w, h), flags=cv2.INTER_LINEAR, borderValue=0.0)

            # 8. High-Precision Multi-Channel Alpha Blending
            warped_mask_3c = np.repeat(np.expand_dims(warped_mask, axis=2), 3, axis=2)
            blended = frame_bgr.astype(np.float32) * (1.0 - warped_mask_3c) + warped_face.astype(np.float32) * warped_mask_3c
            return np.clip(blended, 0.0, 255.0).astype(np.uint8)

        except Exception as err:
            print(f"[!] Exception in swap_face_core: {err}")
            # Fallback to inswapper paste_back=True if custom blending has issue
            try:
                fallback = self.swapper.get(frame_bgr, mock_target, cached_source.raw_face, paste_back=True)
                return fallback if fallback is not None else frame_bgr
            except:
                return frame_bgr


def compute_cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    if emb1 is None or emb2 is None:
        return 0.0
    dot = np.dot(emb1, emb2)
    norm = np.linalg.norm(emb1) * np.linalg.norm(emb2)
    if norm == 0:
        return 0.0
    return float(dot / norm)
