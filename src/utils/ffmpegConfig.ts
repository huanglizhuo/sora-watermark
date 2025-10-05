import { WatermarkConfig, VideoMetadata } from '../types/watermark';
import { getPositionCoordinates, calculateTotalDuration } from './timelineHelper';

// Build FFmpeg overlay filter expression for dynamic positioning
export const buildOverlayExpression = (config: WatermarkConfig): string => {
  const { segments, loop, opacity } = config;

  if (segments.length === 0) {
    throw new Error('No watermark segments defined');
  }

  const totalSegmentDuration = calculateTotalDuration(segments);

  if (totalSegmentDuration === 0) {
    throw new Error('Total segment duration must be greater than 0');
  }

  // Build time-based position expression
  let xExpression = '';
  let yExpression = '';

  let currentTime = 0;

  // For looping, use modulo to repeat the sequence
  const timeVar = loop ? `mod(t,${totalSegmentDuration})` : 't';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const startTime = currentTime;
    const endTime = currentTime + segment.duration;

    const coords = getPositionCoordinates(
      segment.position.preset,
      segment.position.x,
      segment.position.y
    );

    const condition = `between(${timeVar},${startTime},${endTime})`;

    if (i === 0) {
      xExpression = `if(${condition},${coords.x}`;
      yExpression = `if(${condition},${coords.y}`;
    } else {
      xExpression += `,if(${condition},${coords.x}`;
      yExpression += `,if(${condition},${coords.y}`;
    }

    currentTime = endTime;
  }

  // Close all if statements with default position (last segment)
  const lastCoords = getPositionCoordinates(
    segments[segments.length - 1].position.preset,
    segments[segments.length - 1].position.x,
    segments[segments.length - 1].position.y
  );

  xExpression += `,${lastCoords.x}${''.padStart(segments.length, ')')}`;
  yExpression += `,${lastCoords.y}${''.padStart(segments.length, ')')}`;

  return `x='${xExpression}':y='${yExpression}':format=auto:alpha=${opacity / 100}`;
};

// Build complete FFmpeg command
export const buildFFmpegCommand = (
  config: WatermarkConfig,
  videoMetadata: VideoMetadata
): string[] => {
  const { scale } = config;
  const { width: videoWidth } = videoMetadata;

  if (videoWidth <= 0) {
    throw new Error('Video width must be greater than 0');
  }

  const overlayExpr = buildOverlayExpression(config);

  // Scale watermark to be a percentage of the video width while retaining its aspect ratio
  const scaledWidth = Math.max(1, Math.round(videoWidth * scale));
  const evenWidth = scaledWidth % 2 === 0 ? scaledWidth : scaledWidth + 1;

  const filterComplex = [
    `[1:v]scale=${evenWidth}:-1:flags=lanczos[wm]`,
    `[0:v][wm]overlay=${overlayExpr},format=yuv420p[v]`
  ].join(';');

  return [
    '-i', 'input.mp4',
    '-i', 'watermark.png',
    '-filter_complex', filterComplex,
    '-map', '[v]',
    '-map', '0:a?',
    '-c:a', 'copy',
    '-y',
    'output.mp4'
  ];
};

// Get video metadata
export const getVideoMetadata = async (videoFile: File): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(videoFile);
  });
};
