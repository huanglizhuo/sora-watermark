# Video Watermark Tool

Add Sora watermark to your videos to generate fake fake videos 😂.
Of course, it's 100% client-side processing and you can replace the watermark with your own and define your own timeline.

### Example

Curious how the watermark looks once applied? The app includes an "Example Result" section at the top with two autoplaying videos, shown below using GitHub-supported HTML:

| Original | Watermarked |
| --- | --- |
| ![Original sample](public/before.png) | ![Watermarked sample](public/after.png) |


## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **FFmpeg.wasm** for video processing
- No backend required!

## Getting Started

### Prerequisites

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory. You can serve them with any static file server.

### Custom Default Watermark

To replace the default Sora watermark with your own image:

1. Replace `/public/sora-watermark.png` with your image
2. Supported formats: PNG, JPG, WebP, SVG (PNG/SVG recommended for transparency)
3. Update the file path in `src/App.tsx` if using a different filename or format
4. The app will automatically load this as the default watermark

## Usage

### Quick Start (Default Settings)

1. **Upload Video**
   - Drag & drop or click to upload your video file (MP4, WebM, MOV)
   - Preview appears automatically in the upload box
   - Default Sora watermark is pre-loaded

2. **Preview & Process**
   - Video preview shows the watermark animation (top-left → middle-right → bottom-left, looped)
   - Click "Process Video" to apply watermark with default settings
   - Download the result when processing completes

### Advanced Customization

1. **Upload Custom Watermark**
   - Click the watermark upload box to replace the default Sora logo
   - Supports PNG, JPG, WebP, SVG (PNG/SVG recommended for transparency)
   - Preview appears instantly

2. **Advanced Settings**
   - Click "Advanced Settings" to expand customization options

3. **Define Position Timeline**
   - Click "Add Segment" to create position segments
   - For each segment:
     - Select position (9 presets or custom X/Y coordinates)
     - Set duration in seconds
   - Segments play in order

4. **Configure Watermark**
   - Adjust watermark **size** (10-100% of video width)
   - Set **opacity** (0-100%)
   - Enable **loop** to repeat the sequence throughout video

5. **Preview & Process**
   - Watch the watermark animation in real-time
   - Play/pause to check different positions
   - Click "Process Video" to apply watermark
   - Download the result when complete

## Default Configuration

The app comes pre-configured with an animated Sora watermark:

- **Watermark**: Sora logo (PNG)
- **Segment 1**: Top-left, 2 seconds
- **Segment 2**: Middle-right, 2 seconds
- **Segment 3**: Bottom-left, 2 seconds
- **Loop**: Enabled (repeats throughout video)
- **Size**: 20% of video width
- **Opacity**: 100%

Simply upload a video and click "Process Video" to use these defaults!

## Project Structure

```
src/
├── components/         # React components
│   ├── FileUploader.tsx
│   ├── ExampleComparison.tsx
│   ├── PositionTimeline.tsx
│   ├── PositionSegment.tsx
│   ├── WatermarkConfig.tsx
│   ├── VideoPreview.tsx
│   └── ProcessingStatus.tsx
├── hooks/
│   └── useFFmpeg.ts   # FFmpeg WebAssembly hook
├── types/
│   └── watermark.ts   # TypeScript type definitions
├── utils/
│   ├── fileHelpers.ts     # File validation
│   ├── timelineHelper.ts  # Position calculations
│   └── ffmpegConfig.ts    # FFmpeg command builder
├── App.tsx            # Main application
└── main.tsx          # Entry point
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
