/**
 * Recorder class handles frame capture and export functionality
 */
class Recorder {
    constructor(drawCanvas) {
        this.drawCanvas = drawCanvas;
        this.isRecording = false;
        this.frames = [];
        this.startTime = null;
        this.fps = 30;
        this.recordingInterval = null;
        this.frameCount = 0;
        this.backgroundOpacity = 0.3; // Semi-transparent black background
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingCanvas = null;
        this.recordingStream = null;
    }

    setFPS(fps) {
        this.fps = fps;
    }

    setBackgroundOpacity(opacity) {
        this.backgroundOpacity = opacity;
    }

    startRecording() {
        if (this.isRecording) return;
        
        this.isRecording = true;
        this.frames = [];
        this.frameCount = 0;
        this.recordedChunks = [];
        this.startTime = Date.now();
        
        // Create an offscreen canvas for recording with black background
        this.recordingCanvas = document.createElement('canvas');
        this.recordingCanvas.width = this.drawCanvas.width;
        this.recordingCanvas.height = this.drawCanvas.height;
        
        // Start capturing the canvas stream
        this.recordingStream = this.recordingCanvas.captureStream(this.fps);
        
        // Set up MediaRecorder for video export
        const options = {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 2500000
        };
        
        // Fallback to vp8 if vp9 not supported
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8';
        }
        
        this.mediaRecorder = new MediaRecorder(this.recordingStream, options);
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
        
        this.mediaRecorder.start();
        
        // Update recording canvas continuously
        this.recordingInterval = setInterval(() => {
            this.updateRecordingCanvas();
        }, 1000 / this.fps);

        console.log(`Recording started at ${this.fps} FPS`);
    }

    stopRecording() {
        if (!this.isRecording) return new Promise((resolve) => resolve(null));
        
        this.isRecording = false;
        clearInterval(this.recordingInterval);
        
        const duration = (Date.now() - this.startTime) / 1000;
        
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.onstop = () => {
                    console.log(`Recording stopped. Duration: ${duration.toFixed(2)}s`);
                    resolve({
                        fps: this.fps,
                        duration: duration,
                        frameCount: this.frameCount
                    });
                };
                this.mediaRecorder.stop();
                
                // Stop all tracks
                if (this.recordingStream) {
                    this.recordingStream.getTracks().forEach(track => track.stop());
                }
            } else {
                resolve({
                    fps: this.fps,
                    duration: duration,
                    frameCount: this.frameCount
                });
            }
        });
    }

    updateRecordingCanvas() {
        if (!this.recordingCanvas) return;
        
        const ctx = this.recordingCanvas.getContext('2d');
        
        // Fill with semi-transparent black background
        ctx.fillStyle = `rgba(0, 0, 0, ${this.backgroundOpacity})`;
        ctx.fillRect(0, 0, this.recordingCanvas.width, this.recordingCanvas.height);
        
        // Draw the user's drawing on top
        ctx.drawImage(this.drawCanvas, 0, 0);
        
        this.frameCount++;
    }

    exportAsVideo() {
        if (this.recordedChunks.length === 0) {
            alert('No video data to export. Please record something first!');
            return;
        }

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `scribble-video-${Date.now()}.webm`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        console.log('Video exported successfully');
    }

    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            frameCount: this.frameCount,
            duration: this.startTime ? (Date.now() - this.startTime) / 1000 : 0
        };
    }

    clearRecording() {
        this.recordedChunks = [];
        this.frameCount = 0;
        this.startTime = null;
        console.log('Recording cleared');
    }
    
    hasRecording() {
        return this.recordedChunks.length > 0;
    }

    // Export single frame (current drawing state)
    exportCurrentFrame() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.drawCanvas.width;
        tempCanvas.height = this.drawCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Fill with semi-transparent black background
        tempCtx.fillStyle = `rgba(0, 0, 0, ${this.backgroundOpacity})`;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the user's drawing on top
        tempCtx.drawImage(this.drawCanvas, 0, 0);
        
        const link = document.createElement('a');
        link.download = `scribble-frame-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}

export default Recorder;

