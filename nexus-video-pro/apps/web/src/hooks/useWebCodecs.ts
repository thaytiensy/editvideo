import { useEffect, useRef, useState } from 'react';

export function useWebCodecs() {
  const [isSupported, setIsSupported] = useState(false);
  const decoderRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'VideoDecoder' in window) {
      setIsSupported(true);
    }
  }, []);

  const decodeFrameAtTime = async (videoElement: HTMLVideoElement, targetTime: number): Promise<ImageBitmap | null> => {
    // Fast sub-frame seek and bitmap capture
    videoElement.currentTime = targetTime;
    return new Promise((resolve) => {
      const handleSeeked = async () => {
        videoElement.removeEventListener('seeked', handleSeeked);
        try {
          const bitmap = await createImageBitmap(videoElement);
          resolve(bitmap);
        } catch {
          resolve(null);
        }
      };
      videoElement.addEventListener('seeked', handleSeeked, { once: true });
    });
  };

  return {
    isSupported,
    decodeFrameAtTime,
  };
}
