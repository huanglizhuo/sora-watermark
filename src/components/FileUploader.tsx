import { useCallback, useState, useEffect } from 'react';
import { validateVideoFile, validateImageFile, formatFileSize, formatDuration } from '../utils/fileHelpers';

interface FileUploaderProps {
  videoFile: File | null;
  watermarkFile: File | null;
  onVideoChange: (file: File | null) => void;
  onWatermarkChange: (file: File | null) => void;
}

export const FileUploader = ({
  videoFile,
  watermarkFile,
  onVideoChange,
  onWatermarkChange,
}: FileUploaderProps) => {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Generate video preview and extract duration
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreview(url);

      // Extract video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = url;

      return () => {
        URL.revokeObjectURL(url);
        setVideoPreview(null);
        setVideoDuration(0);
      };
    } else {
      setVideoPreview(null);
      setVideoDuration(0);
    }
  }, [videoFile]);

  // Generate watermark preview
  useEffect(() => {
    if (watermarkFile) {
      const url = URL.createObjectURL(watermarkFile);
      setWatermarkPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        setWatermarkPreview(null);
      };
    } else {
      setWatermarkPreview(null);
    }
  }, [watermarkFile]);
  const handleVideoDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const validation = validateVideoFile(file);
        if (validation.valid) {
          onVideoChange(file);
        } else {
          alert(validation.error);
        }
      }
    },
    [onVideoChange]
  );

  const handleWatermarkDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const validation = validateImageFile(file);
        if (validation.valid) {
          onWatermarkChange(file);
        } else {
          alert(validation.error);
        }
      }
    },
    [onWatermarkChange]
  );

  const handleVideoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validation = validateVideoFile(file);
        if (validation.valid) {
          onVideoChange(file);
        } else {
          alert(validation.error);
        }
      }
    },
    [onVideoChange]
  );

  const handleWatermarkSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validation = validateImageFile(file);
        if (validation.valid) {
          onWatermarkChange(file);
        } else {
          alert(validation.error);
        }
      }
    },
    [onWatermarkChange]
  );

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Video Upload */}
      <div
        className="cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
        onDrop={handleVideoDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onClick={() => document.getElementById('video-input')?.click()}
      >
        <input
          id="video-input"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
          onChange={handleVideoSelect}
          className="hidden"
        />
        {videoPreview ? (
          <div className="flex items-center gap-4 p-3">
            {/* Video Thumbnail - Square */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-900">
              <video
                src={videoPreview}
                className="h-full w-full object-contain"
              />
            </div>
            {/* Video Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center space-y-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{videoFile?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{videoFile && formatFileSize(videoFile.size)}</p>
              {videoDuration > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration: {formatDuration(videoDuration)}</p>
              )}
              <p className="mt-1 text-xs italic text-blue-600 dark:text-blue-400">Click or drag & drop to replace</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">MP4, WebM, MOV up to 500MB</p>
          </div>
        )}
      </div>

      {/* Watermark Upload */}
      <div
        className="cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
        onDrop={handleWatermarkDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onClick={() => document.getElementById('watermark-input')?.click()}
      >
        <input
          id="watermark-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={handleWatermarkSelect}
          className="hidden"
        />
        {watermarkPreview ? (
          <div className="flex items-center gap-4 p-3">
            {/* Watermark Thumbnail - Square */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
              <img
                src={watermarkPreview}
                alt="Watermark preview"
                className="max-h-full max-w-full object-contain p-2"
              />
            </div>
            {/* Watermark Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center space-y-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{watermarkFile?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{watermarkFile && formatFileSize(watermarkFile.size)}</p>
              <p className="mt-1 text-xs italic text-blue-600 dark:text-blue-400">Click or drag & drop to replace</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WebP, SVG</p>
          </div>
        )}
      </div>
    </div>
  );
};
