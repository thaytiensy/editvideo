import os
import httpx
from typing import Dict, Any, Optional

class RunPodClient:
    """RunPod Serverless Worker Adapter for heavy GPU processing."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("RUNPOD_API_KEY")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def run_serverless_job(self, endpoint_id: str, input_payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"https://api.runpod.ai/v2/{endpoint_id}/runsync"
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(url, json={"input": input_payload}, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

class ComfyUIClient:
    """ComfyUI WebSocket / REST Gateway for node-based local workflows."""

    def __init__(self, base_url: str = "http://127.0.0.1:8188"):
        self.base_url = base_url

    async def queue_prompt(self, workflow_prompt: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/prompt"
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json={"prompt": workflow_prompt})
            resp.raise_for_status()
            return resp.json()
