// Position presets for watermark placement
export type PositionPreset =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

// Position definition
export interface Position {
  preset: PositionPreset;
  x?: number; // For custom positions (percentage: 0-100)
  y?: number; // For custom positions (percentage: 0-100)
}

// Timeline segment representing a watermark position for a specific duration
export interface WatermarkSegment {
  id: string;
  position: Position;
  duration: number; // in seconds
}

// Complete watermark configuration
export interface WatermarkConfig {
  segments: WatermarkSegment[];
  loop: boolean; // Loop the sequence throughout video
  opacity: number; // 0-100
  scale: number; // Watermark scale (0.1-1.0)
}

// Basic metadata extracted from the source video
export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
}

// Video and watermark file information
export interface MediaFiles {
  video: File | null;
  watermark: File | null;
  videoUrl?: string;
  watermarkUrl?: string;
}

// Processing status
export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'completed' | 'error';

// FFmpeg progress information
export interface FFmpegProgress {
  ratio: number; // 0-1
  time: number; // current processing time in seconds
}
