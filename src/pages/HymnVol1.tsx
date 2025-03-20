import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoModal from '../components/InfoModal';
import { AudioVisualizer } from '../utils/audioVisualizer';

interface LyricPoint {
  time: number; // in seconds
  text: string;
  id?: string; // Add unique ID for each lyric
}

const lyrics: LyricPoint[] = [
  {time: 4, text: "Twelve sacred boddhisattvas," }, 
  {time: 8, text: "The Buddha assigned to us." }, 
  {time: 12, text: "To save all mankind," }, 
  {time: 16, text: "And uplift all gaiankind." }, 
  {time: 20, text: "To save all mankind," }, 
  {time: 24, text: "And uplift all gaiankind." }, 
  {time: 30, text: "Put fire into our hearts," }, 
  {time: 34, text: "To map out all of the stars," }, 
  {time: 38, text: "To never lose our sight," }, 
  {time: 42, text: "Of the Oneness shared by all." }, 
  {time: 47, text: "To never lose our sight," }, 
  {time: 51, text: "Of the Oneness shared by all." }, 
  {time: 55, text: "Of the Oneness shared by all." }, 
  {time: 62, text: "Hail to all of the buddhas," }, 
  {time: 66, text: "Whose triumph is over Aham." }, 
  {time: 70, text: "Whose triumph is shedding the ego," }, 
  {time: 74, text: "The ego that never rests." }, 
  {time: 78, text: "Whose triumph is shedding the ego," }, 
  {time: 82, text: "The ego that never rests." }, 
  {time: 86, text: "In the eve of the dark night," }, 
  {time: 90, text: "That threatens to swallow us," }, 
  {time: 94, text: "Give us keepers to guide us," }, 
  {time: 98, text: "To help us find the light." }, 
  {time: 103, text: "Give us keepers to guide us," }, 
  {time: 107, text: "To help us find the light." }, 
  {time: 111, text: "To help us find the light." }, 
  {time: 128, text: "Namaste!" },
].map((lyric, i) => ({...lyric, id: `lyric-${i}-${lyric.time}`})); // Add unique IDs

function HymnVol1() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<AudioVisualizer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyric, setCurrentLyric] = useState<LyricPoint | null>(null);
  const [recentLyrics, setRecentLyrics] = useState<LyricPoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add state for dynamic title
  const [pageTitle, setPageTitle] = useState("Opening Hymn");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Update page title based on current time
      if (audio.currentTime >= 60 && pageTitle !== "Hail Buddhas!") {
        setPageTitle("Hail Buddhas!");
      } else if (audio.currentTime < 60 && pageTitle !== "Opening Hymn") {
        setPageTitle("Opening Hymn");
      }
      
      // Find the current lyric based on time
      const current = lyrics.find((lyric, index, array) => {
        const nextLyric = array[index + 1];
        return audio.currentTime >= lyric.time && 
               (!nextLyric || audio.currentTime < nextLyric.time);
      });
      
      if (current && (!currentLyric || current.id !== currentLyric.id)) {
        setCurrentLyric(current);
        setRecentLyrics(prev => {
          // Check if we already have this lyric to avoid duplicates
          if (prev.some(l => l.id === current.id)) {
            return prev;
          }
          const newLyrics = [current, ...prev].slice(0, 5);
          return newLyrics;
        });
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentLyric, pageTitle]);

  // Separate useEffect for keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        rewind(5);
      } else if (e.key === ' ') {
        // Prevent default to stop page scrolling with spacebar
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]); // Add isPlaying to dependencies

  // Update play/pause state when audio plays or pauses
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Initialize visualizer and connect to audio element
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    
    if (!canvas || !audio) return;
    
    // Initialize audio visualizer
    const visualizer = new AudioVisualizer(canvas);
    visualizerRef.current = visualizer;
    
    // Connect to audio element when it becomes available
    const connectVisualizer = () => {
      try {
        if (visualizerRef.current && !visualizerRef.current.isConnected()) {
          visualizerRef.current.connectAudio(audio);
        }
      } catch (error) {
        console.error('Failed to connect audio visualizer:', error);
      }
    };
    
    audio.addEventListener('canplaythrough', connectVisualizer);
    
    // Connect once if already loadable
    if (audio.readyState >= 2) {
      connectVisualizer();
    }
    
    // Clean up
    return () => {
      audio.removeEventListener('canplaythrough', connectVisualizer);
      if (visualizerRef.current) {
        visualizerRef.current.disconnectAudio();
        visualizerRef.current = null;
      }
    };
  }, []);

  // Update visualizer when play state changes
  useEffect(() => {
    const audio = audioRef.current;
    const visualizer = visualizerRef.current;
    
    if (!audio || !visualizer) return;
    
    if (isPlaying) {
      // If audio context was suspended (e.g., browser policy), resume it
      if (visualizer.getAudioContext()?.state === 'suspended') {
        visualizer.getAudioContext()?.resume();
      }
    }
  }, [isPlaying]);

  const rewind = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = newTime;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          // Ensure audio context is resumed on user interaction
          if (visualizerRef.current?.getAudioContext()?.state === 'suspended') {
            visualizerRef.current.getAudioContext()?.resume();
          }
          
          // Sometimes play() can fail if the browser has autoplay restrictions
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Play failed:", error);
              
              // If playback fails, try to initialize/resume the audio context
              if (visualizerRef.current?.getAudioContext()?.state !== 'running') {
                visualizerRef.current?.getAudioContext()?.resume()
                  .then(() => audioRef.current?.play())
                  .catch(err => console.error("Failed to resume audio context:", err));
              }
            });
          }
        }
      } catch (error) {
        console.error("Toggle play error:", error);
      }
      // State is updated by event listeners
    }
  };

  const resetToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // Clear current lyrics when resetting
      setCurrentLyric(null);
      setRecentLyrics([]);
      if (isPlaying) {
        // Use the play promise pattern for safety
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Play failed after reset:", error);
          });
        }
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    
    // Find all lyrics that should be shown at this time point
    // This helps create the correct history when jumping to a new position
    const allPreviousLyrics = lyrics
      .filter(lyric => lyric.time <= newTime)
      .sort((a, b) => b.time - a.time) // Sort in reverse chronological order
      .slice(0, 5); // Take only the 5 most recent
      
    if (allPreviousLyrics.length > 0) {
      // Set the most recent as current lyric
      setCurrentLyric(allPreviousLyrics[0]);
      // Update the recent lyrics list with all that should be visible
      setRecentLyrics(allPreviousLyrics);
    } else {
      // If no lyrics found, clear everything
      setCurrentLyric(null);
      setRecentLyrics([]);
    }
    
    // Don't need to reconnect the visualizer here as it's already connected
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Shader background */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{ pointerEvents: 'none' }} // Ensure canvas doesn't block interactions
      />
      
      <div className="min-h-screen text-white p-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">{pageTitle}</h1>

          {/* Audio element (hidden) */}
          <audio
            ref={audioRef}
            src="/music/hymns.wav"
            className="hidden"
            preload="auto"
          />
          
          {/* Lyrics Display */}
          <div className="relative h-96 mb-12">
            <AnimatePresence initial={false}>
              {recentLyrics.map((lyric, index) => (
                <motion.div
                  key={lyric.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ 
                    opacity: 1 - (index * 0.2), 
                    y: -index * 40, // Negative value to move upward
                    scale: 1 - (index * 0.1)
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -200, // Negative value to exit upward
                    scale: 0.6,
                    transition: {
                      duration: 1.2,
                      ease: "easeIn"
                    }
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                  className="text-xl text-center absolute w-full left-0 bottom-0 origin-bottom text-white"
                  style={{
                    zIndex: 100 - index,
                    transform: `translateY(${-index * 40}px) scale(${1 - (index * 0.1)})`,
                    textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 0 0 3px rgba(0, 0, 0, 0.9), 0 0 5px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  {lyric.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Audio Player Controls - Now below lyrics */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 border border-white/10 mt-auto">
            {/* Progress Bar */}
            <div 
              className="h-3 bg-white/10 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-cyan-400/70 rounded-full transition-all"
                style={{ 
                  width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` 
                }}
              />
            </div>

            {/* Time Display */}
            <div className="text-sm text-white/60 mb-6">
              {formatTime(currentTime)}
            </div>
            
            <div className="flex items-center justify-center gap-8">
              {/* Reset Button */}
              <button
                onClick={resetToStart}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center transition-colors"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>

              {/* Info Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 
                         flex items-center justify-center transition-colors"
                aria-label="Track Information"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default HymnVol1; 