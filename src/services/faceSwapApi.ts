// FaceSwap Pro API Service - Communicates with local FastAPI (Port 8000)

export const API_BASE_URL = 'http://127.0.0.1:8000';

export interface HealthStatus {
  status: string;
  cpu_only: boolean;
  models_dir: string;
  analyzer_ready: boolean;
  swapper_ready: boolean;
  ffmpeg_path: string;
  ffmpeg_exists: boolean;
}

export interface UploadedMedia {
  file_id: string;
  filename: string;
  file_path: string;
  url: string;
  type: 'video' | 'image' | 'other';
  width: number;
  height: number;
  duration: number;
  fps: number;
  frame_count: number;
  thumbnail: string;
}

export interface DetectedFace {
  index: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  normalized_bbox: [number, number, number, number]; // [nx1, ny1, nx2, ny2]
  landmarks: [number, number][];
  det_score: number;
  gender: string;
  age: number;
  thumbnail: string; // base64 JPEG
}

export interface DetectFacesResponse {
  face_count: number;
  faces: DetectedFace[];
  width: number;
  height: number;
  frame_preview: string;
}

export interface JobProgress {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0 to 100
  current_frame: number;
  total_frames: number;
  fps: number;
  eta_seconds: number;
  output_file: string;
  download_url: string;
  resolution?: string;
  error?: string | null;
  stage?: string;
}

export const faceSwapApi = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  },

  async uploadFile(file: File): Promise<UploadedMedia> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  },

  async detectFaces(filePath: string, timestamp: number = 0): Promise<DetectFacesResponse> {
    const res = await fetch(`${API_BASE_URL}/api/detect-faces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: filePath, timestamp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Face detection failed' }));
      throw new Error(err.detail || 'Face detection failed');
    }
    return await res.json();
  },

  async swapPreview(params: {
    source_image_path: string;
    target_video_path?: string;
    target_image_path?: string;
    timestamp?: number;
    target_face_index?: number;
  }): Promise<{ status: string; swapped_image: string; target_face_index: number }> {
    const res = await fetch(`${API_BASE_URL}/api/swap-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preview swap failed' }));
      throw new Error(err.detail || 'Preview swap failed');
    }
    return await res.json();
  },

  async startExport(params: {
    video_path: string;
    source_image_path: string;
    target_face_index?: number;
    time_start?: number;
    time_end?: number;
    resolution?: string;
    unify_character?: boolean;
  }): Promise<{ job_id: string; status: string }> {
    const res = await fetch(`${API_BASE_URL}/api/export-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Export request failed' }));
      throw new Error(err.detail || 'Export request failed');
    }
    return await res.json();
  },

  async getJob(jobId: string): Promise<JobProgress> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
    if (!res.ok) throw new Error('Job status check failed');
    return await res.json();
  },

  async cancelJob(jobId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/jobs/${jobId}/cancel`, { method: 'POST' });
  },

  getDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/api/download/${filename}`;
  },

  async trimVideo(params: {
    video_path: string;
    start_time: number;
    end_time: number;
  }): Promise<UploadedMedia> {
    const res = await fetch(`${API_BASE_URL}/api/video/trim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Trim failed' }));
      throw new Error(err.detail || 'Trim failed');
    }
    return await res.json();
  },

  async splitVideo(params: {
    video_path: string;
    timestamp: number;
  }): Promise<{ status: string; part1: UploadedMedia; part2: UploadedMedia }> {
    const res = await fetch(`${API_BASE_URL}/api/video/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Split failed' }));
      throw new Error(err.detail || 'Split failed');
    }
    return await res.json();
  },

  async mergeVideos(params: { video_paths: string[] }): Promise<UploadedMedia> {
    const res = await fetch(`${API_BASE_URL}/api/video/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Merge failed' }));
      throw new Error(err.detail || 'Merge failed');
    }
    return await res.json();
  },

  async imageToVideo(params: {
    image_path: string;
    source_face_path?: string;
    motion_style?: string;
    duration?: number;
    fps?: number;
  }): Promise<UploadedMedia> {
    const res = await fetch(`${API_BASE_URL}/api/image-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Image-To-Video failed' }));
      throw new Error(err.detail || 'Image-To-Video failed');
    }
    return await res.json();
  },
};
