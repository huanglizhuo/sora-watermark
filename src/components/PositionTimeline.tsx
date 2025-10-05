import { WatermarkSegment } from '../types/watermark';
import { PositionSegment } from './PositionSegment';
import { generateSegmentId, calculateTotalDuration } from '../utils/timelineHelper';

interface PositionTimelineProps {
  segments: WatermarkSegment[];
  onChange: (segments: WatermarkSegment[]) => void;
}

export const PositionTimeline = ({ segments, onChange }: PositionTimelineProps) => {
  const handleAddSegment = () => {
    const newSegment: WatermarkSegment = {
      id: generateSegmentId(),
      position: { preset: 'top-left' },
      duration: 2,
    };
    onChange([...segments, newSegment]);
  };

  const handleSegmentChange = (index: number, updatedSegment: WatermarkSegment) => {
    const newSegments = [...segments];
    newSegments[index] = updatedSegment;
    onChange(newSegments);
  };

  const handleSegmentDelete = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    onChange(newSegments);
  };

  const totalDuration = calculateTotalDuration(segments);

  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm transition-colors dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Position Timeline</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define watermark positions and durations
            {segments.length > 0 && ` • Total: ${totalDuration.toFixed(1)}s`}
          </p>
        </div>
        <button
          onClick={handleAddSegment}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Add Segment
        </button>
      </div>

      {/* Segments List */}
      {segments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No segments yet. Click "Add Segment" to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <PositionSegment
              key={segment.id}
              segment={segment}
              index={index}
              onChange={(updatedSegment) => handleSegmentChange(index, updatedSegment)}
              onDelete={() => handleSegmentDelete(index)}
            />
          ))}
        </div>
      )}

      {/* Timeline Visualization */}
      {segments.length > 0 && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sequence:</span>
            <div className="flex flex-1 items-center space-x-1 overflow-x-auto">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex-shrink-0 rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                  style={{ minWidth: `${(segment.duration / totalDuration) * 100}px` }}
                >
                  {segment.position.preset} ({segment.duration}s)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
