import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { WatermarkConfig, ProcessingStatus, FFmpegProgress, VideoMetadata } from '../types/watermark';
import { buildFFmpegCommand } from '../utils/ffmpegConfig';

export const useFFmpeg = () => {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState<FFmpegProgress>({ ratio: 0, time: 0 });
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg
  const load = async () => {
    if (loaded) return;

    try {
      setStatus('loading');
      const ffmpeg = new FFmpeg();

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        setProgress({ ratio: progress, time });
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      setStatus('idle');
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      setError('Failed to load FFmpeg. Please refresh the page and try again.');
      setStatus('error');
    }
  };

  // Process video with watermark
  const processVideo = async (
    videoFile: File,
    watermarkFile: File,
    config: WatermarkConfig,
    videoMetadata: VideoMetadata
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current || !loaded) {
      setError('FFmpeg is not loaded');
      return null;
    }

    try {
      setStatus('processing');
      setProgress({ ratio: 0, time: 0 });
      setError(null);

      const ffmpeg = ffmpegRef.current;

      // Write input files to FFmpeg file system
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.writeFile('watermark.png', await fetchFile(watermarkFile));

      // Build and execute FFmpeg command
      const command = buildFFmpegCommand(config, videoMetadata);
      console.log('[FFmpeg Command]', command.join(' '));

      await ffmpeg.exec(command);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');
      let sourceArray: Uint8Array<ArrayBufferLike>;

      if (typeof data === 'string') {
        sourceArray = new TextEncoder().encode(data);
      } else if (data instanceof Uint8Array) {
        sourceArray = data;
      } else {
        sourceArray = new Uint8Array(data);
      }

      const normalized = new Uint8Array(sourceArray.byteLength);
      normalized.set(sourceArray);

      const blob = new Blob([normalized], { type: 'video/mp4' });

      // Clean up
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('watermark.png');
      await ffmpeg.deleteFile('output.mp4');

      setStatus('completed');
      return blob;
    } catch (err) {
      console.error('Failed to process video:', err);
      setError('Failed to process video. Please try again.');
      setStatus('error');
      return null;
    }
  };

  // Auto-load FFmpeg on mount
  useEffect(() => {
    load();
  }, []);

  return {
    loaded,
    status,
    progress,
    error,
    load,
    processVideo,
  };
};
