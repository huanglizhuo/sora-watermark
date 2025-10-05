import { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { WatermarkConfigPanel } from './components/WatermarkConfig';
import { PositionTimeline } from './components/PositionTimeline';
import { VideoPreview } from './components/VideoPreview';
import { ProcessingStatus } from './components/ProcessingStatus';
import { useFFmpeg } from './hooks/useFFmpeg';
import { WatermarkConfig, VideoMetadata } from './types/watermark';
import { getVideoMetadata } from './utils/ffmpegConfig';
import { generateSegmentId } from './utils/timelineHelper';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const canProcess = videoFile && watermarkFile && config.segments.length > 0 && loaded && status !== 'processing';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Video Watermark Tool</h1>
          <p className="mt-2 text-lg text-gray-600">
            Add animated watermarks to your videos - 100% client-side processing
          </p>
          {!loaded && status === 'loading' && (
            <p className="mt-2 text-sm text-blue-600">Loading FFmpeg...</p>
          )}
        </div>

        <div className="space-y-6">
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        showAdvanced ? 'rotate-90' : ''
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
                    <span className="text-lg font-semibold text-gray-900">Advanced Settings</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {showAdvanced ? 'Hide' : 'Show'} position timeline & watermark settings
                  </span>
                </button>
              </div>

              {/* Advanced Settings Content */}
              {showAdvanced && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PositionTimeline
                    segments={config.segments}
                    onChange={(segments) => setConfig({ ...config, segments })}
                  />
                  <WatermarkConfigPanel config={config} onChange={setConfig} />
                </div>
              )}

              {/* Processing Controls */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Process Video</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Apply watermark to your video with the configured settings
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProcess}
                      disabled={!canProcess}
                      className={`px-6 py-3 rounded-md font-medium transition-colors ${
                        canProcess
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Process Video
                    </button>
                    {outputBlob && status === 'completed' && (
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
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
