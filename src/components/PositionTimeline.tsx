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
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Position Timeline</h3>
          <p className="text-sm text-gray-500 mt-1">
            Define watermark positions and durations
            {segments.length > 0 && ` • Total: ${totalDuration.toFixed(1)}s`}
          </p>
        </div>
        <button
          onClick={handleAddSegment}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Segment
        </button>
      </div>

      {/* Segments List */}
      {segments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
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
          <p className="mt-2 text-sm text-gray-500">No segments yet. Click "Add Segment" to start.</p>
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
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-700">Sequence:</span>
            <div className="flex-1 flex items-center space-x-1 overflow-x-auto">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex-shrink-0 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
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
