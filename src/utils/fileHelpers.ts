// File validation and helper functions

const VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  if (!VIDEO_FORMATS.includes(file.type)) {
    return { valid: false, error: 'Invalid video format. Please upload MP4, WebM, MOV, or AVI.' };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'Video file is too large. Maximum size is 500MB.' };
  }

  return { valid: true };
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!IMAGE_FORMATS.includes(file.type)) {
    return { valid: false, error: 'Invalid image format. Please upload PNG, JPG, WebP, or SVG.' };
  }

  return { valid: true };
};

export const createObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
