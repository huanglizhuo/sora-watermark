import { useRef, useEffect, useState } from 'react';
import { WatermarkConfig } from '../types/watermark';
import { generateTimeRanges } from '../utils/timelineHelper';

interface VideoPreviewProps {
  videoFile: File | null;
  watermarkFile: File | null;
  config: WatermarkConfig;
  videoDuration: number;
}

export const VideoPreview = ({
  videoFile,
  watermarkFile,
  config,
  videoDuration,
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [watermarkImg, setWatermarkImg] = useState<HTMLImageElement | null>(null);
  const [canvasStyle, setCanvasStyle] = useState<{ width: string; height: string }>({
    width: '100%',
    height: 'auto',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const animationFrameRef = useRef<number>();
  const controlsTimeoutRef = useRef<number>();

  // Load video
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  // Load watermark
  useEffect(() => {
    if (watermarkFile) {
      const url = URL.createObjectURL(watermarkFile);

      const img = new Image();
      img.onload = () => {
        setWatermarkImg(img);
        // Don't revoke here - keep URL alive while image is in use
      };
      img.onerror = () => {
        console.error('Failed to load watermark image');
      };
      img.src = url;

      return () => {
        // Only revoke when component unmounts or watermark changes
        URL.revokeObjectURL(url);
        setWatermarkImg(null);
      };
    } else {
      setWatermarkImg(null);
    }
  }, [watermarkFile]);

  // Draw video frame with watermark
  const drawFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!video || !canvas || !ctx || !watermarkImg) return;

    const currentTime = video.currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Find current position from timeline
    const timeRanges = generateTimeRanges(config.segments, videoDuration, config.loop);
    const currentRange = timeRanges.find(
      (range) => currentTime >= range.startTime && currentTime < range.endTime
    );

    if (currentRange && config.segments.length > 0) {
      // Calculate watermark dimensions
      const watermarkWidth = canvas.width * config.scale;
      const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;

      // Calculate position
      let x = 10; // default
      let y = 10; // default

      const preset = currentRange.position.preset;
      const padding = 10;

      if (preset === 'custom' && currentRange.position.x !== undefined && currentRange.position.y !== undefined) {
        x = (canvas.width * currentRange.position.x) / 100 - (watermarkWidth * currentRange.position.x) / 100;
        y = (canvas.height * currentRange.position.y) / 100 - (watermarkHeight * currentRange.position.y) / 100;
      } else {
        const positions: Record<string, { x: number; y: number }> = {
          'top-left': { x: padding, y: padding },
          'top-center': { x: (canvas.width - watermarkWidth) / 2, y: padding },
          'top-right': { x: canvas.width - watermarkWidth - padding, y: padding },
          'middle-left': { x: padding, y: (canvas.height - watermarkHeight) / 2 },
          'middle-center': { x: (canvas.width - watermarkWidth) / 2, y: (canvas.height - watermarkHeight) / 2 },
          'middle-right': { x: canvas.width - watermarkWidth - padding, y: (canvas.height - watermarkHeight) / 2 },
          'bottom-left': { x: padding, y: canvas.height - watermarkHeight - padding },
          'bottom-center': { x: (canvas.width - watermarkWidth) / 2, y: canvas.height - watermarkHeight - padding },
          'bottom-right': { x: canvas.width - watermarkWidth - padding, y: canvas.height - watermarkHeight - padding },
        };

        const pos = positions[preset];
        if (pos) {
          x = pos.x;
          y = pos.y;
        }
      }

      // Draw watermark with opacity
      ctx.globalAlpha = config.opacity / 100;
      ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0;
    }

    if (!video.paused && !video.ended) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    } else {
      animationFrameRef.current = undefined;
    }
  };

  // Start/stop animation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      drawFrame();
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', drawFrame);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', drawFrame);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [watermarkImg, config, videoDuration]);

  // Auto-draw preview when watermark loads or config changes
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && watermarkImg && video.readyState >= 2) {
      // Video is loaded and watermark is ready, draw the frame
      drawFrame();
    }
  }, [watermarkImg, config]);

  // Ensure video defaults to an audible state when loaded
  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = false;
      video.volume = 1;
    }

    setIsPlaying(false);
    setIsMuted(false);
    setVolume(1);
    setPreviousVolume(1);
  }, [videoUrl]);

  // Toggle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      // Unmuting: restore previous volume
      const restoreVolume = previousVolume > 0 ? previousVolume : 1;
      video.volume = restoreVolume;
      setVolume(restoreVolume);
      video.muted = false;
      setIsMuted(false);
    } else {
      // Muting: save current volume and set to 0
      setPreviousVolume(volume > 0 ? volume : 1);
      video.volume = 0;
      setVolume(0);
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else {
      if (isMuted) {
        setIsMuted(false);
        video.muted = false;
      }
      setPreviousVolume(newVolume);
    }
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);
  };

  // Keep controls visible when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
    }
  }, [isPlaying]);

  // Update canvas size when video loads
  const handleVideoLoad = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (video && canvas && container) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const aspectRatio = videoWidth / videoHeight;

      // Set canvas internal resolution to video resolution
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Calculate display size based on container width
      const containerWidth = container.clientWidth;
      const maxHeight = 500;

      let displayWidth = containerWidth;
      let displayHeight = containerWidth / aspectRatio;

      // If calculated height exceeds max, scale down
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * aspectRatio;
      }

      // Update canvas display size while maintaining aspect ratio
      setCanvasStyle({
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
      });

      drawFrame();
    }
  };

  if (!videoUrl) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm transition-colors dark:bg-gray-800">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Upload a video to preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm transition-colors dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden flex items-center justify-center bg-black cursor-pointer"
        onClick={togglePlayPause}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="hidden"
          onLoadedMetadata={handleVideoLoad}
          loop
        />
        <canvas
          ref={canvasRef}
          className="rounded-lg mx-auto"
          style={{
            width: canvasStyle.width,
            height: canvasStyle.height,
            display: 'block',
          }}
        />

        {/* Loading Overlay */}
        {!watermarkImg && watermarkFile && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
            <p className="text-sm text-white">Loading watermark...</p>
          </div>
        )}

        {/* Play/Pause Overlay (center) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-70 rounded-full p-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : volume > 0.5 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
