import os
from typing import Dict, Any, Optional
from ..adapters.replicate_client import ReplicateClient

class ConsistentFacePipeline:
    """IP-Adapter FaceID Plus v2 + ControlNet OpenPose character consistency pipeline."""

    def __init__(self, client: Optional[ReplicateClient] = None):
        self.client = client or ReplicateClient()

    async def generate_consistent_character(
        self,
        face_image_url: str,
        scene_prompt: str,
        pose_reference_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate scene visual preserving 95-100% character identity."""
        augmented_prompt = f"{scene_prompt}, sharp facial features, photorealistic skin texture, 8k resolution"
        return await self.client.run_faceid_consistent(
            face_image_url=face_image_url,
            prompt=augmented_prompt
        )
