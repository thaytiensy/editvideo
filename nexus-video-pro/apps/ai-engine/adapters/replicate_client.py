import os
import httpx
from typing import Dict, Any, Optional

class ReplicateClient:
    """Replicate API adapter for IP-Adapter FaceID, ProPainter, and CodeFormer."""

    BASE_URL = "https://api.replicate.com/v1"

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or os.getenv("REPLICATE_API_TOKEN")
        self.headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }

    async def run_faceid_consistent(self, face_image_url: str, prompt: str) -> Dict[str, Any]:
        """IP-Adapter FaceID Plus v2 character lock connector."""
        endpoint = f"{self.BASE_URL}/predictions"
        payload = {
            "version": "a823b4e604f58c49e7b23395b0581ba82ec7a26f8d3810d7a87e5b22b1154562",
            "input": {
                "face_image": face_image_url,
                "prompt": prompt,
                "negative_prompt": "blurry, low quality, distorted, extra limbs",
                "faceid_weight": 0.85
            }
        }
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def run_propainter_inpaint(self, video_url: str, mask_url: str) -> Dict[str, Any]:
        """ProPainter temporal video object & watermark inpainting."""
        endpoint = f"{self.BASE_URL}/predictions"
        payload = {
            "version": "9924c529ba04a8ad4821a719c8d5786ba113e6179b5cfa3200ffbb5e3eb4c1fa",
            "input": {
                "video": video_url,
                "mask": mask_url,
                "subvideo_length": 80,
                "neighbor_length": 10
            }
        }
        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            return resp.json()
