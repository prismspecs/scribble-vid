import Recorder from './recorder.js';

/**
 * Main application class for the Scribble Video app
 */
class ScribbleApp {
    constructor() {
        // Canvas elements
        this.bgCanvas = document.getElementById('bgCanvas');
        this.drawCanvas = document.getElementById('drawCanvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.drawCtx = this.drawCanvas.getContext('2d');
        
        // Drawing state
        this.drawing = false;
        this.brushSize = 5;
        this.brushColor = '#ffffff';
        this.bgVisible = true;
        this.mode = 'draw';
        this.bgImage = null;
        
        // Canvas scaling
        this.scale = 1;
        this.maxDisplayWidth = null;
        this.maxDisplayHeight = null;
        
        // Recorder
        this.recorder = new Recorder(this.drawCanvas);
        
        // Set initial canvas size
        this.setCanvasSize(800, 600);
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Recording UI state
        this.recordingTimer = null;
        
        // Calculate max display size based on viewport
        this.updateMaxDisplaySize();
        window.addEventListener('resize', () => this.updateMaxDisplaySize());
    }

    setCanvasSize(width, height) {
        // Set actual canvas resolution (full size)
        this.drawCanvas.width = width;
        this.drawCanvas.height = height;
        this.bgCanvas.width = width;
        this.bgCanvas.height = height;
        
        // Calculate scale factor to fit in viewport
        this.calculateScale(width, height);
        
        // Apply CSS scaling
        this.applyCanvasDisplaySize();
    }

    updateMaxDisplaySize() {
        // With sidebar layout, we have much more space!
        const canvasArea = document.querySelector('.canvas-area');
        const recordingInfo = document.querySelector('.recording-info');
        
        if (!canvasArea) {
            this.maxDisplayWidth = window.innerWidth - 400;
            this.maxDisplayHeight = window.innerHeight - 100;
            return;
        }
        
        const canvasAreaRect = canvasArea.getBoundingClientRect();
        
        // Calculate used height (recording info + padding)
        let usedHeight = 80; // padding top/bottom
        if (recordingInfo && recordingInfo.classList.contains('active')) {
            usedHeight += recordingInfo.offsetHeight + 20;
        }
        
        // Use most of the canvas area (sidebar is separate)
        this.maxDisplayWidth = canvasAreaRect.width - 80; // leave margins
        this.maxDisplayHeight = canvasAreaRect.height - usedHeight;
        
        // Ensure minimum reasonable size
        this.maxDisplayWidth = Math.max(this.maxDisplayWidth, 400);
        this.maxDisplayHeight = Math.max(this.maxDisplayHeight, 400);
        
        // Recalculate scale if canvas exists
        if (this.drawCanvas.width > 0) {
            this.calculateScale(this.drawCanvas.width, this.drawCanvas.height);
            this.applyCanvasDisplaySize();
        }
    }

    calculateScale(width, height) {
        // Calculate scale to fit canvas in available space
        const scaleX = this.maxDisplayWidth / width;
        const scaleY = this.maxDisplayHeight / height;
        
        // Use the smaller scale to ensure it fits, but don't scale up
        this.scale = Math.min(1, scaleX, scaleY);
    }

    applyCanvasDisplaySize() {
        // Apply CSS size based on scale
        const displayWidth = this.drawCanvas.width * this.scale;
        const displayHeight = this.drawCanvas.height * this.scale;
        
        this.drawCanvas.style.width = `${displayWidth}px`;
        this.drawCanvas.style.height = `${displayHeight}px`;
        this.bgCanvas.style.width = `${displayWidth}px`;
        this.bgCanvas.style.height = `${displayHeight}px`;
        
        // Update UI with canvas info
        this.updateCanvasInfo();
        
        console.log(`Canvas: ${this.drawCanvas.width}x${this.drawCanvas.height}, Display: ${displayWidth}x${displayHeight}, Scale: ${this.scale.toFixed(2)}`);
    }

    updateCanvasInfo() {
        const resolutionEl = document.getElementById('canvasResolution');
        const scaleEl = document.getElementById('canvasScale');
        
        if (resolutionEl) {
            resolutionEl.textContent = `${this.drawCanvas.width} × ${this.drawCanvas.height}`;
        }
        
        if (scaleEl) {
            const scalePercent = Math.round(this.scale * 100);
            scaleEl.textContent = `Scale: ${scalePercent}%`;
            // Only show scale info if we're actually scaling down
            scaleEl.style.display = this.scale < 1 ? 'block' : 'none';
        }
    }

    initEventListeners() {
        // Background image upload
        document.getElementById('bgInput').addEventListener('change', (e) => this.loadBackground(e));
        
        // Drawing controls
        document.getElementById('brushSize').addEventListener('input', (e) => this.updateBrushSize(e));
        document.getElementById('brushColor').addEventListener('input', (e) => this.updateBrushColor(e));
        
        // FPS control
        document.getElementById('fpsInput').addEventListener('input', (e) => this.updateFPS(e));
        
        // Background opacity control
        document.getElementById('bgOpacity').addEventListener('input', (e) => this.updateBgOpacity(e));
        
        // Canvas mouse events
        this.drawCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.drawCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.drawCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.drawCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    loadBackground(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.bgImage = new Image();
                this.bgImage.onload = () => {
                    // Store the current drawing if exists
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = this.drawCanvas.width;
                    tempCanvas.height = this.drawCanvas.height;
                    tempCtx.drawImage(this.drawCanvas, 0, 0);
                    
                    // Resize canvases to match image (full resolution)
                    this.setCanvasSize(this.bgImage.width, this.bgImage.height);
                    
                    // Draw background at full resolution
                    this.bgCtx.drawImage(this.bgImage, 0, 0);
                    
                    // Restore drawing if it existed
                    if (tempCanvas.width > 0) {
                        this.drawCtx.drawImage(tempCanvas, 0, 0);
                    }
                };
                this.bgImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    updateBrushSize(e) {
        this.brushSize = e.target.value;
        document.getElementById('brushValue').textContent = this.brushSize;
    }

    updateBrushColor(e) {
        this.brushColor = e.target.value;
    }

    updateFPS(e) {
        const fps = parseInt(e.target.value);
        this.recorder.setFPS(fps);
    }

    updateBgOpacity(e) {
        const opacity = parseFloat(e.target.value);
        this.recorder.setBackgroundOpacity(opacity);
        document.getElementById('bgOpacityValue').textContent = opacity.toFixed(2);
    }

    setMode(newMode) {
        this.mode = newMode;
        document.getElementById('drawMode').classList.toggle('active', this.mode === 'draw');
        document.getElementById('eraseMode').classList.toggle('active', this.mode === 'erase');
    }

    startDrawing(e) {
        this.drawing = true;
        this.draw(e);
    }

    stopDrawing() {
        this.drawing = false;
        this.drawCtx.beginPath();
    }

    draw(e) {
        if (!this.drawing) return;

        const rect = this.drawCanvas.getBoundingClientRect();
        // Get mouse position relative to displayed canvas
        const displayX = e.clientX - rect.left;
        const displayY = e.clientY - rect.top;
        
        // Scale coordinates to actual canvas resolution
        const x = displayX / this.scale;
        const y = displayY / this.scale;

        // Scale brush size to actual resolution
        this.drawCtx.lineWidth = this.brushSize / this.scale;
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';

        if (this.mode === 'erase') {
            this.drawCtx.globalCompositeOperation = 'destination-out';
            this.drawCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.drawCtx.globalCompositeOperation = 'source-over';
            this.drawCtx.strokeStyle = this.brushColor;
        }

        this.drawCtx.lineTo(x, y);
        this.drawCtx.stroke();
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(x, y);
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.drawCanvas.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.drawCanvas.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.drawCanvas.dispatchEvent(mouseEvent);
    }

    clearDrawing() {
        this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    }

    toggleBackground() {
        this.bgVisible = !this.bgVisible;
        this.bgCanvas.style.opacity = this.bgVisible ? '1' : '0';
    }

    exportFrame() {
        this.recorder.exportCurrentFrame();
    }

    startRecording() {
        this.recorder.startRecording();
        
        // Update UI
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordBtn.classList.add('recording');
        
        // Show recording info
        document.getElementById('recordingInfo').classList.add('active');
        
        // Start timer
        this.startRecordingTimer();
    }

    async stopRecording() {
        const result = await this.recorder.stopRecording();
        
        // Update UI
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const exportVideoBtn = document.getElementById('exportVideoBtn');
        
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordBtn.classList.remove('recording');
        exportVideoBtn.disabled = false;
        
        // Hide recording info
        document.getElementById('recordingInfo').classList.remove('active');
        
        // Stop timer
        this.stopRecordingTimer();
        
        if (result) {
            alert(`Recording stopped! Duration: ${result.duration.toFixed(2)} seconds.\n\nClick "Export Video" to download.`);
        }
    }

    startRecordingTimer() {
        const timerElement = document.getElementById('recordingTimer');
        const frameCountElement = document.getElementById('frameCountDisplay');
        
        this.recordingTimer = setInterval(() => {
            const status = this.recorder.getRecordingStatus();
            const minutes = Math.floor(status.duration / 60);
            const seconds = Math.floor(status.duration % 60);
            timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            frameCountElement.textContent = `Frames: ${status.frameCount}`;
        }, 100);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    exportVideo() {
        this.recorder.exportAsVideo();
    }

    clearRecording() {
        if (confirm('Are you sure you want to clear the recorded video?')) {
            this.recorder.clearRecording();
            document.getElementById('exportVideoBtn').disabled = true;
            alert('Recording cleared!');
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScribbleApp();
    
    // Expose functions to global scope for onclick handlers
    window.setMode = (mode) => app.setMode(mode);
    window.clearDrawing = () => app.clearDrawing();
    window.toggleBackground = () => app.toggleBackground();
    window.exportFrame = () => app.exportFrame();
    window.startRecording = () => app.startRecording();
    window.stopRecording = () => app.stopRecording();
    window.exportVideo = () => app.exportVideo();
    window.clearRecording = () => app.clearRecording();
    
    // Instructions toggle
    window.toggleInstructions = () => {
        const instructions = document.getElementById('instructions');
        if (instructions.style.display === 'none') {
            instructions.style.display = 'block';
        } else {
            instructions.style.display = 'none';
        }
    };
});

