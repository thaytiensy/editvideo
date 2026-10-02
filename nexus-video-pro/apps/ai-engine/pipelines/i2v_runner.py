import os
from typing import Dict, Any, Optional
from ..adapters.fal_ai_client import FalAIClient

class ImageToVideoRunner:
    """Image-to-Video Synthesis runner supporting Wan 2.1, Kling, and Luma."""

    def __init__(self, fal_client: Optional[FalAIClient] = None):
        self.fal_client = fal_client or FalAIClient()

    async def run(
        self,
        model_name: str,
        image_url: str,
        prompt: str,
        camera_motion: str = "pan_right",
        motion_strength: int = 50,
        aspect_ratio: str = "16:9"
    ) -> Dict[str, Any]:
        if model_name == "wan2.1":
            return await self.fal_client.generate_image_to_video_wan(
                image_url=image_url,
                prompt=prompt,
                motion_strength=motion_strength,
                aspect_ratio=aspect_ratio
            )
        elif model_name == "kling":
            return await self.fal_client.generate_kling_i2v(
                image_url=image_url,
                prompt=prompt,
                camera_motion=camera_motion
            )
        else:
            return await self.fal_client.generate_image_to_video_wan(
                image_url=image_url,
                prompt=prompt,
                motion_strength=motion_strength,
                aspect_ratio=aspect_ratio
            )
