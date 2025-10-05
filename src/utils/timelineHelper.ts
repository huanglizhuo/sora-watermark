import { Position, PositionPreset, WatermarkSegment } from '../types/watermark';

// Position preset coordinates mapping
export const getPositionCoordinates = (
  preset: PositionPreset,
  customX?: number,
  customY?: number,
  padding: number = 10
): { x: string; y: string } => {
  if (preset === 'custom' && customX !== undefined && customY !== undefined) {
    // Convert percentage to pixel position
    return {
      x: `W*${customX / 100}-w*${customX / 100}`,
      y: `H*${customY / 100}-h*${customY / 100}`
    };
  }

  const positions: Record<Exclude<PositionPreset, 'custom'>, { x: string; y: string }> = {
    'top-left': { x: `${padding}`, y: `${padding}` },
    'top-center': { x: `(W-w)/2`, y: `${padding}` },
    'top-right': { x: `W-w-${padding}`, y: `${padding}` },
    'middle-left': { x: `${padding}`, y: `(H-h)/2` },
    'middle-center': { x: `(W-w)/2`, y: `(H-h)/2` },
    'middle-right': { x: `W-w-${padding}`, y: `(H-h)/2` },
    'bottom-left': { x: `${padding}`, y: `H-h-${padding}` },
    'bottom-center': { x: `(W-w)/2`, y: `H-h-${padding}` },
    'bottom-right': { x: `W-w-${padding}`, y: `H-h-${padding}` },
  };

  return positions[preset as Exclude<PositionPreset, 'custom'>];
};

// Calculate total duration of all segments
export const calculateTotalDuration = (segments: WatermarkSegment[]): number => {
  return segments.reduce((total, segment) => total + segment.duration, 0);
};

// Generate time ranges for segments
export const generateTimeRanges = (
  segments: WatermarkSegment[],
  videoDuration: number,
  loop: boolean
): Array<{ startTime: number; endTime: number; position: Position }> => {
  const ranges: Array<{ startTime: number; endTime: number; position: Position }> = [];
  const totalSegmentDuration = calculateTotalDuration(segments);

  if (totalSegmentDuration === 0) return ranges;

  let currentTime = 0;

  if (loop) {
    // Loop segments until video duration is reached
    while (currentTime < videoDuration) {
      for (const segment of segments) {
        const endTime = Math.min(currentTime + segment.duration, videoDuration);
        ranges.push({
          startTime: currentTime,
          endTime,
          position: segment.position
        });
        currentTime = endTime;
        if (currentTime >= videoDuration) break;
      }
    }
  } else {
    // Play segments once
    for (const segment of segments) {
      const endTime = Math.min(currentTime + segment.duration, videoDuration);
      ranges.push({
        startTime: currentTime,
        endTime,
        position: segment.position
      });
      currentTime = endTime;
      if (currentTime >= videoDuration) break;
    }
  }

  return ranges;
};

// Generate unique ID for segments
export const generateSegmentId = (): string => {
  return `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
