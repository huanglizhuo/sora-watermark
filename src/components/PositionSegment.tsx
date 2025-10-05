import { WatermarkSegment, PositionPreset } from '../types/watermark';

interface PositionSegmentProps {
  segment: WatermarkSegment;
  index: number;
  onChange: (segment: WatermarkSegment) => void;
  onDelete: () => void;
}

const POSITION_PRESETS: { value: PositionPreset; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'middle-left', label: 'Middle Left' },
  { value: 'middle-center', label: 'Center' },
  { value: 'middle-right', label: 'Middle Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'custom', label: 'Custom' },
];

export const PositionSegment = ({ segment, index, onChange, onDelete }: PositionSegmentProps) => {
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...segment,
      position: { ...segment.position, preset: e.target.value as PositionPreset },
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseFloat(e.target.value);
    if (!isNaN(duration) && duration > 0) {
      onChange({ ...segment, duration });
    }
  };

  const handleCustomXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const x = parseFloat(e.target.value);
    if (!isNaN(x)) {
      onChange({
        ...segment,
        position: { ...segment.position, x },
      });
    }
  };

  const handleCustomYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseFloat(e.target.value);
    if (!isNaN(y)) {
      onChange({
        ...segment,
        position: { ...segment.position, y },
      });
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Segment {index + 1}</span>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Position Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
          <select
            value={segment.position.preset}
            onChange={handlePositionChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {POSITION_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration (s)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={segment.duration}
            onChange={handleDurationChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Custom Position Inputs */}
      {segment.position.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={segment.position.x || 0}
              onChange={handleCustomXChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={segment.position.y || 0}
              onChange={handleCustomYChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
