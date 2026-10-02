import os
from typing import Dict, Any, Optional
from ..adapters.fal_ai_client import FalAIClient

class LipSyncPipeline:
    """Audio-driven LivePortrait & Wav2Lip speech synchronization."""

    def __init__(self, fal_client: Optional[FalAIClient] = None):
        self.fal_client = fal_client or FalAIClient()

    async def sync_voice_to_face(
        self,
        character_image_url: str,
        audio_url: str
    ) -> Dict[str, Any]:
        """Generate speaking avatar video driven by speech audio."""
        return await self.fal_client.generate_liveportrait_voice(
            source_image_url=character_image_url,
            audio_url=audio_url
        )
