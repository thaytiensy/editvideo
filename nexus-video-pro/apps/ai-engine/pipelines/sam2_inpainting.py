import os
from typing import Dict, Any, Optional
from ..adapters.replicate_client import ReplicateClient

class SAM2InpaintingPipeline:
    """
    Segment Anything Model 2 (SAM 2) object tracking & mask generation
    + ProPainter / E2FGVI temporal video inpainting.
    """

    def __init__(self, replicate_client: Optional[ReplicateClient] = None):
        self.replicate_client = replicate_client or ReplicateClient()

    async def inpaint_video(
        self,
        video_url: str,
        mask_url: str
    ) -> Dict[str, Any]:
        """Erase unwanted objects, watermarks, or people from video."""
        return await self.replicate_client.run_propainter_inpaint(
            video_url=video_url,
            mask_url=mask_url
        )
