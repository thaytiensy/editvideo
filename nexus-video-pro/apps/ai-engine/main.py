import os
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from adapters.fal_ai_client import FalAIClient
from pipelines.face_swap import FaceSwapPipeline
from pipelines.i2v_runner import ImageToVideoRunner
from pipelines.consistent_face import ConsistentFacePipeline
from pipelines.sam2_inpainting import SAM2InpaintingPipeline
from pipelines.lip_sync import LipSyncPipeline

app = FastAPI(
    title="Nexus Video Pro - AI Synthesis Engine",
    description="Microservice gateway for InsightFace, Wan 2.1, Kling, LivePortrait, SAM 2, and IP-Adapter FaceID",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pipeline instances
face_swap_pipeline = FaceSwapPipeline()
i2v_runner = ImageToVideoRunner()
consistent_face_pipeline = ConsistentFacePipeline()
sam2_pipeline = SAM2InpaintingPipeline()
lip_sync_pipeline = LipSyncPipeline()

# Request schemas
class FaceSwapRequest(BaseModel):
    source_face_url: str
    target_video_url: str
    target_face_index: int = 0
    feather_blur: int = 25

class I2VRequest(BaseModel):
    model: str = "wan2.1"
    image_url: str
    prompt: str
    camera_motion: str = "pan_right"
    motion_strength: int = 50
    aspect_ratio: str = "16:9"

class ConsistentFaceRequest(BaseModel):
    face_image_url: str
    scene_prompt: str
    pose_reference_url: Optional[str] = None

class InpaintRequest(BaseModel):
    video_url: str
    mask_url: str

class LipSyncRequest(BaseModel):
    character_image_url: str
    audio_url: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Nexus Video Pro AI Engine",
        "gpu_available": False,
        "pipelines": ["face_swap", "i2v", "consistent_face", "sam2_inpaint", "lip_sync"]
    }

@app.post("/api/ai/face-swap")
async def face_swap_endpoint(req: FaceSwapRequest):
    try:
        return {"status": "dispatched", "job_id": "job_fs_mock", "message": "Face swap processing initiated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/image-to-video")
async def i2v_endpoint(req: I2VRequest):
    try:
        result = await i2v_runner.run(
            model_name=req.model,
            image_url=req.image_url,
            prompt=req.prompt,
            camera_motion=req.camera_motion,
            motion_strength=req.motion_strength,
            aspect_ratio=req.aspect_ratio
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/consistent-character")
async def consistent_character_endpoint(req: ConsistentFaceRequest):
    try:
        result = await consistent_face_pipeline.generate_consistent_character(
            face_image_url=req.face_image_url,
            scene_prompt=req.scene_prompt,
            pose_reference_url=req.pose_reference_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/smart-inpaint")
async def smart_inpaint_endpoint(req: InpaintRequest):
    try:
        result = await sam2_pipeline.inpaint_video(
            video_url=req.video_url,
            mask_url=req.mask_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/lip-sync")
async def lip_sync_endpoint(req: LipSyncRequest):
    try:
        result = await lip_sync_pipeline.sync_voice_to_face(
            character_image_url=req.character_image_url,
            audio_url=req.audio_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
