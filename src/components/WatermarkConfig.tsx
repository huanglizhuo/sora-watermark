import { WatermarkConfig } from '../types/watermark';

interface WatermarkConfigProps {
  config: WatermarkConfig;
  onChange: (config: WatermarkConfig) => void;
}

export const WatermarkConfigPanel = ({ config, onChange }: WatermarkConfigProps) => {
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, opacity: parseInt(e.target.value) });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, scale: parseFloat(e.target.value) });
  };

  const handleLoopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, loop: e.target.checked });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Watermark Settings</h3>

      {/* Opacity Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="opacity" className="text-sm font-medium text-gray-700">
            Opacity
          </label>
          <span className="text-sm text-gray-500">{config.opacity}%</span>
        </div>
        <input
          id="opacity"
          type="range"
          min="0"
          max="100"
          step="5"
          value={config.opacity}
          onChange={handleOpacityChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Scale Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="scale" className="text-sm font-medium text-gray-700">
            Size
          </label>
          <span className="text-sm text-gray-500">{Math.round(config.scale * 100)}%</span>
        </div>
        <input
          id="scale"
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={config.scale}
          onChange={handleScaleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Loop Control */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="loop" className="text-sm font-medium text-gray-700">
            Loop Position Sequence
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Repeat the position timeline throughout the entire video
          </p>
        </div>
        <input
          id="loop"
          type="checkbox"
          checked={config.loop}
          onChange={handleLoopChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
      </div>
    </div>
  );
};
