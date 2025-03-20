/**
 * Audio visualizer utility that creates a continuous light stream visualization.
 * Rays emerge from three different locations (0°, 120°, 240°) with shifting magenta, yellow, and cyan colors.
 */

export class AudioVisualizer {
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private dataArray: Uint8Array = new Uint8Array();
  private bufferLength: number = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animationId: number = 0;
  private maxLineLength: number = 0;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private lastUpdate: number = 0;
  private isPlaying: boolean = false; // Track if music is actively playing
  
  // Fixed ray configuration
  private rayCount: number = 120; // Number of rays for smooth visualization
  private rayAngleStep: number = (Math.PI * 2) / 120; // Angular step between rays
  private rayPositions: number[] = []; // Array to track ray positions
  private rays: {
    intensity: number;  // Audio intensity when ray was created
    length: number;     // Length of the ray
    thickness: number;  // Thickness of the ray
    alpha: number;      // Alpha/opacity of the ray
    age: number;        // Age of the ray (in frames since creation)
    source: number;     // Which source this ray came from (0, 1, or 2)
    hue: number;        // Hue for color
  }[] = [];
  
  // Animation parameters
  private rotationSpeed: number = 0.15; // Controls rotation speed
  
  // Multi-source parameters
  private sourceCount: number = 3; // Three ray sources
  private sourceAngles: number[] = [-Math.PI/2, -Math.PI/2 + (Math.PI*2/3), -Math.PI/2 + (Math.PI*4/3)]; // Fixed at 0°, 120°, 240°
  private sourceLastAddTimes: number[] = [0, 0, 0]; // Last ray add time for each source
  private sourceHues: number[] = [300, 60, 180]; // Magenta, Yellow, Cyan hues
  private hueShiftSpeed: number = 0.03; // Controls color shift speed

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maxLineLength = 0; // Will be set based on canvas size
    this.lastUpdate = performance.now();
    
    // Initialize ray system
    this.initializeRays();
    
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  private initializeRays() {
    // Create empty rays
    this.rays = new Array(this.rayCount).fill(null).map(() => ({
      intensity: 0,
      length: 0,
      thickness: 0,
      alpha: 0,
      age: this.rayCount, // Mark as old enough to be replaced
      source: 0,
      hue: 0
    }));
    
    // Initialize positions array
    this.rayPositions = [];
    for (let i = 0; i < this.rayCount; i++) {
      this.rayPositions.push(i);
    }
    
    // Initialize last ray add times
    const now = performance.now();
    this.sourceLastAddTimes = [now, now, now];
  }

  private resizeCanvas() {
    const { canvas } = this;
    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Calculate max line length based on canvas dimensions
    this.maxLineLength = Math.min(canvas.width, canvas.height) * 0.8; 
  }

  // Get audio context for external state management
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // Check if already connected to an audio source
  isConnected(): boolean {
    return this.audioSource !== null;
  }

  connectAudio(audioElement: HTMLAudioElement) {
    // Clean up any existing connections
    this.disconnectAudio();

    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    
    // Configure analyser
    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    
    // Connect audio element to analyser
    this.audioSource = this.audioContext.createMediaElementSource(audioElement);
    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Listen for play/pause events to track playing state
    audioElement.addEventListener('play', () => {
      this.isPlaying = true;
    });
    
    audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
    });
    
    audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
    });

    // Initial state based on audio element
    this.isPlaying = !audioElement.paused;

    // Start animation
    this.startAnimation();
  }

  disconnectAudio() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    
    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    
    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      this.audioContext = null;
    }
    
    this.analyser = null;
  }

  private startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.draw();
    };
    
    animate();
  }

  private draw() {
    if (!this.analyser || !this.ctx) return;
    
    // Get current time for animations
    const now = performance.now();
    this.lastUpdate = now;
    
    // Shift hues for rainbow effect
    for (let i = 0; i < this.sourceCount; i++) {
      this.sourceHues[i] = (this.sourceHues[i] + this.hueShiftSpeed) % 360;
    }
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Use identical frequency bands for all three sections
    // Each section gets an identical part of the spectrum
    const sectionSize = Math.floor(this.bufferLength / 3);
    
    // Extract data for each section using the same formula
    const section1 = this.dataArray.slice(0, sectionSize);
    const section2 = this.dataArray.slice(sectionSize, sectionSize * 2);
    const section3 = this.dataArray.slice(sectionSize * 2);
    
    // Calculate intensity the same way for all sections
    const calculateIntensity = (data: Uint8Array) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      return sum / (data.length * 255); // Normalize to 0-1
    };
    
    // Calculate intensities exactly the same way for all sections
    const intensities = [
      calculateIntensity(section1),
      calculateIntensity(section2),
      calculateIntensity(section3)
    ];
    
    // Only add rays when music is playing
    if (this.isPlaying) {
      // Check each source to see if it should add a ray
      for (let sourceIndex = 0; sourceIndex < this.sourceCount; sourceIndex++) {
        // Use a constant interval for consistent ray creation
        const interval = 300; // milliseconds
        
        // Check if it's time to add a new ray for this source
        if (now - this.sourceLastAddTimes[sourceIndex] >= interval) {
          // Get current intensity for this source - identical for all
          const intensity = Math.max(0.1, intensities[sourceIndex]);
          
          // Add a new ray from this source
          this.addRay(intensity, sourceIndex);
          
          // Update last add time
          this.sourceLastAddTimes[sourceIndex] = now;
        }
      }
    }
    
    // Clear canvas with slight alpha for trailing effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Find center of canvas
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Draw all rays
    for (let i = 0; i < this.rayCount; i++) {
      const ray = this.rays[i];
      
      // Skip rays with no intensity (empty slots)
      if (!ray || ray.intensity <= 0) continue;
      
      // Skip rays that have completed a full circle
      if (ray.age >= this.rayCount) continue;
      
      // The position (angle) is directly determined by where this ray is in the rayPositions array
      const position = this.rayPositions[i];
      
      // Calculate angle: source angle + rotation within that source's section
      // Each source gets 1/3 of the circle to emit rays into
      const sourceAngle = this.sourceAngles[ray.source];
      const sectorSize = (Math.PI * 2) / this.sourceCount;
      const angleWithinSector = position * this.rayAngleStep * this.sourceCount;
      
      // Final angle combines source position and angle within that source's sector
      const angle = sourceAngle - (sectorSize / 2) + (angleWithinSector % sectorSize);
      
      // Apply animation for ray growth - rays grow to full length over time
      const growthDuration = 10; // Number of frames to reach full length
      const growthFactor = Math.min(1, ray.age / growthDuration);
      const animatedLength = ray.length * growthFactor;
      
      // Calculate end point
      const x = centerX + Math.cos(angle) * animatedLength;
      const y = centerY + Math.sin(angle) * animatedLength;
      
      // Draw the ray with more segments for a smoother effect
      const segments = 15;
      
      // Use the ray's hue
      const hue = ray.hue;
      const saturation = 100; // Full saturation
      const lightness = 60; // Bright but not washed out
      
      for (let j = 0; j < segments; j++) {
        // Calculate segment start and end points
        const segRatio = j / segments;
        const nextSegRatio = (j + 1) / segments;
        
        // Start slightly away from center
        const startDist = animatedLength * (j === 0 ? 0.01 : segRatio);
        const endDist = animatedLength * nextSegRatio;
        
        const startX = centerX + Math.cos(angle) * startDist;
        const startY = centerY + Math.sin(angle) * startDist;
        const endX = centerX + Math.cos(angle) * endDist;
        const endY = centerY + Math.sin(angle) * endDist;
        
        // Thinner rays for more light-like appearance
        const segmentThickness = ray.thickness * (0.3 + (nextSegRatio * 0.7));
        
        // Higher opacity for more visible light effect
        const segmentAlpha = ray.alpha * (0.4 + (nextSegRatio * 0.6));
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${segmentAlpha})`;
        this.ctx.lineWidth = segmentThickness;
        this.ctx.stroke();
      }
      
      // Add wider, more visible glow for brighter rays
      if (ray.alpha > 0.3) {
        const glowAlpha = ray.alpha * 0.15; // Increased glow opacity for more brightness
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 2 + ray.thickness * 2; // Wider glow
        this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness + 10}%, ${glowAlpha})`;
        this.ctx.stroke();
      }
    }
  }

  private addRay(baseIntensity: number, sourceIndex: number) {
    // Keep constant intensity for even appearance
    const intensity = 0.7;
    
    // Ray length responds to audio intensity - exactly the same for all sections
    // Allow rays to reach full length of max length
    const minLength = 0.1;
    const maxLength = 1.0; // Allow full length (up to 100% of maxLineLength)
    
    // Apply identical intensity amplification to all sections
    // Use a more aggressive exponent (2.0) to amplify differences for all sections
    const amplifiedIntensity = Math.pow(baseIntensity, 2.0);
    
    // Calculate final length using identical formula for all sections
    const lengthFactor = minLength + (amplifiedIntensity * (maxLength - minLength));
    const length = this.maxLineLength * lengthFactor;
    
    // Width varies with intensity - same for all sections
    const thickness = 1.0 + (amplifiedIntensity * 1.0);
    
    // Alpha varies with intensity - same for all sections
    const alpha = 0.7 + (amplifiedIntensity * 0.3);
    
    // Clockwise movement - shift all ray positions
    for (let i = 0; i < this.rayPositions.length; i++) {
      this.rayPositions[i] = (this.rayPositions[i] + 1) % this.rayCount;
    }
    
    // The new ray always goes at position 0
    const newRayIndex = this.rayPositions.indexOf(0);
    
    // Get color for this source with minimal variation
    const baseHue = this.sourceHues[sourceIndex]; // Magenta, Yellow, or Cyan
    const hue = (baseHue + Math.random() * 4 - 2) % 360; // Small random variation
    
    // Add the new ray
    this.rays[newRayIndex] = {
      intensity: intensity,
      length: length,
      thickness: thickness,
      alpha: alpha,
      age: 0, // New ray
      source: sourceIndex,
      hue: hue
    };
    
    // Increment age of all existing rays
    for (let i = 0; i < this.rays.length; i++) {
      if (i !== newRayIndex && this.rays[i]) {
        this.rays[i].age += 1;
      }
    }
  }
} 