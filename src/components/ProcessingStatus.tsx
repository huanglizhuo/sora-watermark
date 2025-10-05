import { ProcessingStatus as Status, FFmpegProgress } from '../types/watermark';

interface ProcessingStatusProps {
  status: Status;
  progress: FFmpegProgress;
  error: string | null;
}

export const ProcessingStatus = ({ status, progress, error }: ProcessingStatusProps) => {
  if (status === 'idle') return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm transition-colors dark:bg-gray-800">
      {status === 'loading' && (
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading FFmpeg...</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing video...</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress.ratio * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress.ratio * 100}%` }}
            ></div>
          </div>
          {progress.time > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Processing time: {progress.time.toFixed(1)}s</p>
          )}
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-center space-x-3 text-green-600">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Processing completed!</span>
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-start space-x-3 text-red-600 dark:text-red-400">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium">Error</p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
