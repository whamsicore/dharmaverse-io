/**
 * Audio visualizer utility that creates a continuous light stream visualization.
 * Rays emerge from three different locations (0°, 120°, 240°) with shifting rainbow colors.
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
  private rayCount: number = 120; // Increased from 36 for more density
  private rayAngleStep: number = (Math.PI * 2) / 120; // Angular step between rays
  private rayPositions: number[] = []; // Array to track ray positions for clarity
  private rays: {
    intensity: number;  // Audio intensity when ray was created
    length: number;     // Length of the ray
    thickness: number;  // Thickness of the ray
    alpha: number;      // Alpha/opacity of the ray
    age: number;        // Age of the ray (in rays added since creation)
    source: number;     // Which source this ray came from (0, 1, or 2)
    hue: number;        // Hue for rainbow color shifting
  }[] = [];
  
  // Animation and pattern parameters
  private rotationSpeed: number = 0.3; // Reduced from 1 - much slower rotation
  private sineFrequency: number = 0.1; // Reduced from 0.15 - slower sine wave
  private sineAmplitude: number = 0.5; // Amplitude of the sine wave effect
  
  // Multi-source parameters
  private sourceCount: number = 3; // Number of ray sources (at 0°, 120°, 240°)
  private sourceAngles: number[] = [-Math.PI/2, -Math.PI/2 + (Math.PI*2/3), -Math.PI/2 + (Math.PI*4/3)]; // Fixed angles
  private sourceTimers: number[] = [0, 0, 0]; // Separate timers for each source
  private sourceLastAddTimes: number[] = [0, 0, 0]; // Last ray add time for each source
  private sourceHues: number[] = [0, 120, 240]; // Initial hues for each source
  private hueShiftSpeed: number = 0.05; // Slowed down from 0.1 - more gradual color shifts

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
      source: 0, // Which source this ray came from (0, 1, or 2)
      hue: 0 // Initial hue
    }));
    
    // Initialize positions array
    this.rayPositions = [];
    for (let i = 0; i < this.rayCount; i++) {
      this.rayPositions.push(i);
    }
    
    // Initialize source-specific timers with different phases
    this.sourceTimers = [0, Math.PI / 3, Math.PI * 2 / 3]; // Start at different phases
    
    // Initialize last ray add times
    const now = performance.now();
    this.sourceLastAddTimes = [now, now, now];
    
    // Set initial rotation speed
    this.rotationSpeed = 0.3; // Much slower rays per second per source
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
    const delta = now - this.lastUpdate;
    this.lastUpdate = now;
    
    // Shift hues for rainbow effect
    for (let i = 0; i < this.sourceCount; i++) {
      this.sourceHues[i] = (this.sourceHues[i] + this.hueShiftSpeed) % 360;
    }
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate overall audio energy
    const averageEnergy = Array.from(this.dataArray).reduce((sum, value) => sum + value, 0) / 
                          this.dataArray.length / 255;
    
    // Calculate separate bands for different frequency responses
    const bassRange = this.dataArray.slice(0, Math.floor(this.bufferLength * 0.2));
    const midRange = this.dataArray.slice(Math.floor(this.bufferLength * 0.2), Math.floor(this.bufferLength * 0.6));
    const trebleRange = this.dataArray.slice(Math.floor(this.bufferLength * 0.6));
    
    const getAverage = (arr: Uint8Array) => arr.reduce((acc, val) => acc + val, 0) / arr.length / 255;
    
    const bassValue = getAverage(bassRange);
    const midValue = getAverage(midRange);
    const trebleValue = getAverage(trebleRange);
    
    // Different frequency ranges for different sources
    const energyValues = [bassValue, midValue, trebleValue];
    
    // Only add rays when music is playing
    if (this.isPlaying) {
      // Check each source to see if it should add a ray
      for (let sourceIndex = 0; sourceIndex < this.sourceCount; sourceIndex++) {
        // Each source has slightly different base interval
        const baseInterval = 1000 / this.rotationSpeed;
        const minInterval = 10;
        const maxInterval = 800 + (sourceIndex * 150); // Increased from 500 - slower ray addition
        
        // Calculate interval based on the frequency band this source responds to
        const sourceEnergy = energyValues[sourceIndex];
        let interval = maxInterval - (sourceEnergy * (maxInterval - minInterval));
        
        // Check if it's time to add a new ray for this source
        if (now - this.sourceLastAddTimes[sourceIndex] >= interval) {
          // Use audio data appropriate for this source
          let intensity = energyValues[sourceIndex];
          if (intensity < 0.1) intensity = 0.1; // Minimum intensity
          
          // Add a new ray from this source
          this.addRay(intensity, sourceIndex);
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
      
      // Calculate end point
      const x = centerX + Math.cos(angle) * ray.length;
      const y = centerY + Math.sin(angle) * ray.length;
      
      // Draw the ray with more segments for a smoother effect
      const segments = 15;
      
      // Bright rainbow shifting colors (brighter saturation and lightness)
      const hue = ray.hue;
      const saturation = 100; // Full saturation
      const lightness = 60; // Bright but not washed out
      
      for (let j = 0; j < segments; j++) {
        // Calculate segment start and end points
        const segRatio = j / segments;
        const nextSegRatio = (j + 1) / segments;
        
        // Start slightly away from center
        const startDist = ray.length * (j === 0 ? 0.01 : segRatio);
        const endDist = ray.length * nextSegRatio;
        
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
    const now = performance.now();
    
    // Each source has its own sine wave frequency and phase
    // Source 0: Normal frequency
    // Source 1: 1.3x frequency (slightly faster) - reduced from 1.5x
    // Source 2: 0.8x frequency (slightly slower) - increased from 0.75x
    const frequencyMultipliers = [1, 1.3, 0.8];
    
    // Use sine wave to modulate the intensity with a unique pattern for each source
    const frequencyMod = this.sineFrequency * frequencyMultipliers[sourceIndex];
    const primaryPulse = Math.sin(this.sourceTimers[sourceIndex] * frequencyMod);
    const secondaryPulse = Math.sin(this.sourceTimers[sourceIndex] * frequencyMod * 2) * 0.3;
    const sineValue = Math.max(0, primaryPulse + secondaryPulse);
    
    // Combine audio intensity with sine pattern
    const baseValue = 0.2 + (baseIntensity * 0.6); 
    const sineContribution = sineValue * this.sineAmplitude;
    let intensity = Math.max(0.05, Math.min(1.0, baseValue + sineContribution));
    
    // Add some subtle randomness
    intensity *= (0.9 + Math.random() * 0.2);
    
    // Make ray length directly proportional to final intensity
    const intensitySquared = intensity * intensity; // Emphasize differences
    
    // Base length range from 5% to 80% of max length
    const minLength = 0.05;
    const maxLength = 0.8;
    
    // Calculate length with some randomness
    const lengthFactor = minLength + (intensitySquared * (maxLength - minLength)) * (0.9 + Math.random() * 0.2);
    const length = this.maxLineLength * lengthFactor;
    
    // Make rays wider
    const thickness = 0.5 + (intensity * 1.5); // Even wider rays for brightness
    
    // Alpha also based on intensity
    const alpha = 0.5 + (intensity * 0.5); // Higher base alpha for brighter rays
    
    // Clockwise movement - shift all ray positions
    for (let i = 0; i < this.rayPositions.length; i++) {
      this.rayPositions[i] = (this.rayPositions[i] + 1) % this.rayCount;
    }
    
    // The new ray always goes at position 0
    const newRayIndex = this.rayPositions.indexOf(0);
    
    // Get the current hue for this source with much less variation
    // Reduced random variation from ±15 to ±5 for smoother transitions
    const hue = (this.sourceHues[sourceIndex] + Math.random() * 10 - 5) % 360;
    
    // Add the new ray at the calculated index
    this.rays[newRayIndex] = {
      intensity: intensity,
      length: length,
      thickness: thickness,
      alpha: alpha,
      age: 0, // New ray
      source: sourceIndex, // Which source this ray came from
      hue: hue // Current hue for this ray
    };
    
    // Increment age of all existing rays
    for (let i = 0; i < this.rays.length; i++) {
      if (i !== newRayIndex && this.rays[i]) {
        this.rays[i].age += 1;
      }
    }
    
    // Update time for this source's sine wave pattern - even slower increment
    this.sourceTimers[sourceIndex] += 0.01; // Reduced from 0.02 for slower wave
    this.sourceLastAddTimes[sourceIndex] = now;
  }
} 