import { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ExampleComparison } from './components/ExampleComparison';
import { WatermarkConfigPanel } from './components/WatermarkConfig';
import { PositionTimeline } from './components/PositionTimeline';
import { VideoPreview } from './components/VideoPreview';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ThemeToggle, ThemePreference, ResolvedTheme } from './components/ThemeToggle';
import { useFFmpeg } from './hooks/useFFmpeg';
import { WatermarkConfig, VideoMetadata } from './types/watermark';
import { getVideoMetadata } from './utils/ffmpegConfig';
import { generateSegmentId } from './utils/timelineHelper';

const THEME_STORAGE_KEY = 'theme-preference';

const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? (stored as ThemePreference) : 'system';
};

const getSystemColorScheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>(getStoredThemePreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemColorScheme);

  // Default configuration with pre-configured segments
  const [config, setConfig] = useState<WatermarkConfig>({
    segments: [
      { id: generateSegmentId(), position: { preset: 'top-left' }, duration: 2 },
      { id: generateSegmentId(), position: { preset: 'middle-right' }, duration: 2 },
      { id: generateSegmentId(), position: { preset: 'bottom-left' }, duration: 2 },
    ],
    loop: true,
    opacity: 100,
    scale: 0.2,
  });

  const { loaded, status, progress, error, processVideo } = useFFmpeg();

  // Load default Sora watermark
  useEffect(() => {
    const loadDefaultWatermark = async () => {
      try {
        const response = await fetch('/sora-watermark.png');
        const blob = await response.blob();
        const file = new File([blob], 'sora-watermark.png', { type: 'image/png' });
        setWatermarkFile(file);
      } catch (err) {
        console.error('Failed to load default watermark:', err);
      }
    };

    loadDefaultWatermark();
  }, []);

  // Get video duration when video file changes
  useEffect(() => {
    if (videoFile) {
      getVideoMetadata(videoFile)
        .then((metadata) => {
          setVideoDuration(metadata.duration);
          setVideoMetadata(metadata);
        })
        .catch((err) => {
          console.error('Failed to get video duration:', err);
          setVideoDuration(0);
          setVideoMetadata(null);
        });
    } else {
      setVideoDuration(0);
      setVideoMetadata(null);
    }
  }, [videoFile]);

  const handleProcess = async () => {
    if (!videoFile || !watermarkFile) {
      alert('Please upload both video and watermark files');
      return;
    }

    if (config.segments.length === 0) {
      alert('Please add at least one position segment');
      return;
    }

    if (videoDuration === 0) {
      alert('Failed to load video duration. Please try uploading the video again.');
      return;
    }

    if (!videoMetadata) {
      alert('Failed to read video metadata. Please try uploading the video again.');
      return;
    }

    const blob = await processVideo(videoFile, watermarkFile, config, videoMetadata);
    if (blob) {
      setOutputBlob(blob);
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;

    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-download when processing completes
  useEffect(() => {
    if (outputBlob && status === 'completed') {
      handleDownload();
    }
  }, [outputBlob, status]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Ensure state reflects latest system preference
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (theme === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((current) => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  };

  const canProcess = videoFile && watermarkFile && config.segments.length > 0 && loaded && status !== 'processing';

  return (
    <div className="min-h-screen bg-gray-50 py-8 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Watermark Tool</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Add Sora watermark to your videos to generate fake Sora videos 😂. <br />
              Of course, it's 100% client-side processing and you can replace the watermark with your own and define your own timeline.
            </p>
            {!loaded && status === 'loading' && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Loading FFmpeg...</p>
            )}
          </div>
          <div className="flex justify-center md:justify-end">
            <ThemeToggle
              theme={theme}
              resolvedTheme={resolvedTheme}
              onToggle={handleThemeToggle}
            />
          </div>
        </div>

        <div className="space-y-6">
          <ExampleComparison />

          {/* File Upload */}
          <FileUploader
            videoFile={videoFile}
            watermarkFile={watermarkFile}
            onVideoChange={setVideoFile}
            onWatermarkChange={setWatermarkFile}
          />

          {/* Configuration Section */}
          {videoFile && watermarkFile && (
            <>
              {/* Preview Section - Always Visible */}
              <VideoPreview
                videoFile={videoFile}
                watermarkFile={watermarkFile}
                config={config}
                videoDuration={videoDuration}
              />

              {/* Advanced Settings Toggle */}
              <div className="rounded-lg bg-white p-4 shadow-sm transition-colors dark:bg-gray-800">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-90' : ''
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Settings</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {showAdvanced ? 'Hide' : 'Show'} position timeline & watermark settings
                  </span>
                </button>
              </div>

              {/* Advanced Settings Content */}
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <PositionTimeline
                    segments={config.segments}
                    onChange={(segments) => setConfig({ ...config, segments })}
                  />
                  <WatermarkConfigPanel config={config} onChange={setConfig} />
                </div>
              )}

              {/* Processing Controls */}
              <div className="rounded-lg bg-white p-6 shadow-sm transition-colors dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Process Video</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Apply watermark to your video with the configured settings
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProcess}
                      disabled={!canProcess}
                      className={`px-6 py-3 rounded-md font-medium transition-colors ${canProcess
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                    >
                      Process Video
                    </button>
                    {outputBlob && status === 'completed' && (
                      <button
                        onClick={handleDownload}
                        className="rounded-md bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                      >
                        Download Result
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <ProcessingStatus status={status} progress={progress} error={error} />
            </>
          )}

          {/* Info Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 transition-colors dark:border-blue-900/50 dark:bg-blue-950/40">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">How it works</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200/90">
              <li>Upload your video (watermark is pre-loaded with default Sora logo)</li>
              <li>Default animation: top-left 2s → middle-right 2s → bottom-left 2s (looped)</li>
              <li>Click "Advanced Settings" to customize position timeline and watermark settings</li>
              <li>Preview the animation in real-time</li>
              <li>Process and download - all processing happens in your browser!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
