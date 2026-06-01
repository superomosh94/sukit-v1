'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Camera,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  onThumbnailSelect?: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function VideoPlayer({
  src,
  poster,
  duration: propDuration,
  width: propWidth,
  height: propHeight,
  codec,
  onThumbnailSelect,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration ?? 0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (propDuration && propDuration > 0) {
      setDuration(propDuration);
    }
  }, [propDuration]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isSeeking]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || propDuration || 0);
      setIsLoaded(true);
    }
  }, [propDuration]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = v;
        setVolume(v);
        setIsMuted(v === 0);
      }
    },
    []
  );

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(
    (
      e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>
    ) => {
      const input = e.target as HTMLInputElement;
      const time = parseFloat(input.value);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      setIsSeeking(false);
    },
    []
  );

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const captureThumbnail = useCallback(() => {
    if (!videoRef.current || !onThumbnailSelect) return;
    onThumbnailSelect(videoRef.current.currentTime);
  }, [onThumbnailSelect]);

  const handleError = useCallback(() => {
    setError('Unable to load video. The format may be unsupported.');
    setIsLoaded(true);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="max-h-64 w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        playsInline
        preload="metadata"
      />

      {/* Loading state */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="size-8 animate-spin text-white" />
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4">
          <AlertTriangle className="size-8 text-amber-400" />
          <p className="text-center text-xs text-white/80">{error}</p>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 transition-opacity',
          isLoaded && !error ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Progress bar */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="rounded p-1 text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>

          {/* Time display */}
          <span className="min-w-[70px] text-[10px] text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className="rounded p-1 text-white hover:bg-white/20"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="h-1 w-16 appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Thumbnail capture */}
          {onThumbnailSelect && (
            <button
              onClick={captureThumbnail}
              className="rounded p-1 text-white hover:bg-white/20"
              title="Capture frame as thumbnail"
            >
              <Camera className="size-3.5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="rounded p-1 text-white hover:bg-white/20"
          >
            {isFullscreen ? (
              <Minimize className="size-3.5" />
            ) : (
              <Maximize className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Dimensions & codec info */}
      {(propWidth || propHeight || codec) && (
        <div className="absolute left-2 top-2 flex gap-2">
          {(propWidth || propHeight) && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80">
              {propWidth}×{propHeight}
            </span>
          )}
          {codec && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/60">
              {codec}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
