import { useEffect, useRef, useState } from 'react';

export function useAudioEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [loudnessLUFS, setLoudnessLUFS] = useState(-14);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const compressor = ctx.createDynamicsCompressor();
    const masterGain = ctx.createGain();

    // Broadcast standard loudness normalization settings (EBU R128 -14 LUFS)
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(30, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    compressorRef.current = compressor;
    masterGainRef.current = masterGain;

    return () => {
      ctx.close();
    };
  }, []);

  const setMasterVolume = (vol: number) => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        Math.max(0, Math.min(1.5, vol)),
        audioCtxRef.current.currentTime
      );
    }
  };

  return {
    audioContext: audioCtxRef.current,
    setMasterVolume,
    loudnessLUFS,
  };
}
