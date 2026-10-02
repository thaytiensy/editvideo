import os
import httpx
from typing import Dict, Any, Optional

class FalAIClient:
    """Unified Fal.ai Gateway Adapter for Wan 2.1, Kling, Luma Dream Machine, and LivePortrait."""

    BASE_URL = "https://queue.fal.run"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FAL_KEY")
        self.headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_image_to_video_wan(
        self,
        image_url: str,
        prompt: str,
        motion_strength: int = 50,
        aspect_ratio: str = "16:9"
    ) -> Dict[str, Any]:
        """Wan 2.1 Image-to-Video generation connector."""
        endpoint = f"{self.BASE_URL}/fal-ai/wan/image-to-video"
        payload = {
            "image_url": image_url,
            "prompt": prompt,
            "motion_bucket_id": int(motion_strength * 1.5),
            "aspect_ratio": aspect_ratio,
            "fps": 30
        }
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def generate_kling_i2v(
        self,
        image_url: str,
        prompt: str,
        camera_motion: str = "pan_right"
    ) -> Dict[str, Any]:
        """Kling AI video synthesis connector with camera motion."""
        endpoint = f"{self.BASE_URL}/fal-ai/kling-video/v1/standard/image-to-video"
        payload = {
            "image_url": image_url,
            "prompt": prompt,
            "camera_control": {
                "type": camera_motion,
                "config": {"horizontal": 5 if "right" in camera_motion else 0}
            }
        }
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def generate_liveportrait_voice(
        self,
        source_image_url: str,
        audio_url: str
    ) -> Dict[str, Any]:
        """LivePortrait audio-driven facial reenactment connector."""
        endpoint = f"{self.BASE_URL}/fal-ai/live-portrait"
        payload = {
            "source_image_url": source_image_url,
            "driving_audio_url": audio_url,
            "relative_motion": True,
            "flag_pasteback": True
        }
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()
