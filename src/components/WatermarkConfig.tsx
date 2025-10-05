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
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm transition-colors dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Watermark Settings</h3>

      {/* Opacity Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="opacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Opacity
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">{config.opacity}%</span>
        </div>
        <input
          id="opacity"
          type="range"
          min="0"
          max="100"
          step="5"
          value={config.opacity}
          onChange={handleOpacityChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 dark:bg-gray-700"
        />
      </div>

      {/* Scale Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="scale" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Size
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(config.scale * 100)}%</span>
        </div>
        <input
          id="scale"
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={config.scale}
          onChange={handleScaleChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 dark:bg-gray-700"
        />
      </div>

      {/* Loop Control */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="loop" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loop Position Sequence
          </label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Repeat the position timeline throughout the entire video
          </p>
        </div>
        <input
          id="loop"
          type="checkbox"
          checked={config.loop}
          onChange={handleLoopChange}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
        />
      </div>
    </div>
  );
};
