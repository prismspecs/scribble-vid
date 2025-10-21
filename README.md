# Scribble Video

A browser-based drawing and video recording tool that captures your drawings with transparent backgrounds, perfect for creating animated overlays and video effects.

## Features

- **Full-Featured Drawing Tools**
  - Adjustable brush size and color
  - Eraser mode
  - Touch support for tablets/mobile
  - Full resolution drawing (no quality loss from scaling)

- **Reference Image Support**
  - Load background images for tracing
  - Reference stays visible while drawing but doesn't appear in output
  - Auto-scales large images to fit viewport while maintaining full resolution

- **Real-Time Video Recording**
  - Records drawings as you create them
  - Adjustable FPS (1-60 fps)
  - Live recording timer and frame counter
  - No external software needed

- **Transparent Video Export**
  - WebM format with transparency support
  - Configurable background opacity (fully transparent to solid black)
  - Full resolution export regardless of viewport scaling
  - Perfect for video compositing and overlays

- **Modern UX**
  - Clean, intuitive interface
  - Responsive design that adapts to screen size
  - Organized control panels
  - Collapsible help section

## Quick Start

1. Download or clone this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, or Edge recommended)
3. Start drawing!

No build process, no dependencies, no installation required.

## How to Use

1. **Load Background** (Optional)
   - Click "Load Background" to upload a reference image
   - The image will scale to fit your viewport
   - Drawing happens at full resolution regardless of display size

2. **Draw Your Animation**
   - Select Draw/Erase mode
   - Adjust brush size and color
   - Create your artwork on the canvas

3. **Record**
   - Set desired FPS (30 recommended)
   - Adjust BG Opacity (0 = transparent, 1 = black)
   - Click "Record" to start
   - Draw your animation
   - Click "Stop" when finished

4. **Export**
   - Click "Export Video" to download as WebM
   - Or use "Current Frame" to export a single PNG

## Use Cases

- Creating animated text or doodles for video editing
- Making transparent overlays for live streams
- Drawing animations for presentations
- Creating educational content with hand-drawn elements
- Producing explainer video annotations
- Generating transparent effects for compositing

## Technical Details

### Architecture
```
scribble-video/
├── index.html      # Main HTML structure
├── styles.css      # Modern, responsive styling
├── app.js          # Drawing logic & canvas management
├── recorder.js     # Video recording with MediaRecorder API
└── README.md       # Documentation
```

### Technologies
- **Pure vanilla JavaScript** (ES6 modules)
- **HTML5 Canvas API** for drawing
- **MediaRecorder API** for video capture
- **Canvas.captureStream()** for real-time streaming
- **WebM** video format (VP9/VP8 codec)

### Canvas Scaling System
The app uses a dual-resolution system:
- **Display Resolution**: Scales to fit viewport (CSS transform)
- **Internal Resolution**: Full image resolution (unchanged)
- Mouse coordinates and brush sizes are automatically scaled
- Recordings always capture at full resolution

### Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Drawing | Yes | Yes | Yes |
| Recording | Yes | Yes | Limited |
| Export | Yes | Yes | WebM support varies |

**Requirements:**
- Canvas API
- MediaRecorder API
- ES6 Module support
- File API

**Note:** Safari has limited WebM support. For best results, use Chrome, Firefox, or Edge.

## Configuration

### FPS Settings
- **Low (15-20 fps)**: Smaller files, choppy motion
- **Medium (30 fps)**: Good balance (recommended)
- **High (60 fps)**: Smooth motion, larger files

### Background Opacity
- **0.0**: Fully transparent (for overlays)
- **0.3**: Semi-transparent (default, good visibility)
- **1.0**: Solid black background

## Tips & Tricks

- **Large Images**: The canvas auto-scales to fit, but records at full resolution
- **Brush Size**: Value represents pixels at full resolution (not display size)
- **Toggle Background**: Use this to see your drawing without reference clutter
- **Performance**: Lower FPS for longer recordings to reduce file size
- **Transparency**: Set BG Opacity to 0 for fully transparent backgrounds perfect for compositing

## Advanced Usage

### Converting to Other Formats

Use ffmpeg to convert WebM to other formats:

```bash
# Convert to MP4 (preserving transparency may not work)
ffmpeg -i scribble-video.webm -c:v libx264 output.mp4

# Convert to PNG sequence (preserves transparency)
ffmpeg -i scribble-video.webm -pix_fmt rgba frame_%04d.png

# Convert to GIF
ffmpeg -i scribble-video.webm -vf "fps=15,scale=640:-1:flags=lanczos" output.gif
```

## Contributing

This is a single-file web app designed for simplicity. If you'd like to contribute:

1. Fork the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Known Issues

- Safari: Limited WebM codec support
- Mobile: Performance may vary on low-end devices
- Very large images (>4K): May impact performance on slower devices

## Acknowledgments

Built with vanilla JavaScript - no frameworks, no dependencies, just pure web standards.

---

Made for creators, animators, and video editors.

