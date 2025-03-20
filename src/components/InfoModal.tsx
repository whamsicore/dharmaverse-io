import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { getCommunityCount, addEmail } from '../utils/emailStorage';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Google user type
interface User {
  email: string;
  name?: string;
  imageUrl?: string;
}

// Declare global Google type
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        }
      }
    }
  }
}

function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [communityCount, setCommunityCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  
  // Load Google Identity Services
  useEffect(() => {
    // Only load if not already loaded
    if (!document.getElementById('google-signin-script') && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-signin-script';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsGoogleLoaded(true);
    }
    
    return () => {
      const script = document.getElementById('google-signin-script');
      if (script) {
        // We don't want to remove the script when component unmounts
        // as it might be needed later
      }
    };
  }, []);
  
  // Handle Google callback
  const handleCredentialResponse = useCallback((response: any) => {
    // Decode JWT token from Google
    const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
    
    const googleUser: User = {
      email: decodedToken.email,
      name: decodedToken.name,
      imageUrl: decodedToken.picture
    };
    
    // Save user to localStorage
    localStorage.setItem('dharmaverse_user', JSON.stringify(googleUser));
    
    // Add email to our storage
    addEmail(googleUser.email);
    
    // Update state
    setUser(googleUser);
    setCommunityCount(getCommunityCount());
    setIsSigningIn(false);
  }, []);
  
  // Initialize Google Sign-In
  useEffect(() => {
    if (isGoogleLoaded && window.google && isOpen) {
      try {
        // Log the client ID to debug
        console.log('Client ID from env:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
        
        // Use a fallback client ID if the environment variable is undefined
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
          "79544038406-4f20062a6tc3uga4gti7fanum7apik71.apps.googleusercontent.com";
        
        console.log('Using client ID:', clientId);
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          prompt_parent_id: 'google-signin-prompt',
          itp_support: true
        });
        
        // Add an empty div for Google to render the prompt into
        const promptParent = document.getElementById('google-signin-prompt') || 
          document.createElement('div');
        
        if (!document.getElementById('google-signin-prompt')) {
          promptParent.id = 'google-signin-prompt';
          document.body.appendChild(promptParent);
        }
        
        // Create button element
        const buttonEl = document.getElementById('google-signin-button');
        if (buttonEl) {
          window.google.accounts.id.renderButton(buttonEl, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    }
  }, [isGoogleLoaded, isOpen, handleCredentialResponse]);
  
  useEffect(() => {
    if (isOpen) {
      setCommunityCount(getCommunityCount());
      
      // Check if we have saved user data in localStorage
      const savedUser = localStorage.getItem('dharmaverse_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse saved user:', error);
        }
      }
    }
  }, [isOpen]);

  const handleSignIn = () => {
    if (!window.google) {
      console.error('Google Sign-In not loaded');
      return;
    }
    
    setIsSigningIn(true);
    try {
      // Use the Google Sign-In prompt directly
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      setIsSigningIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.3 
                }}
                className="w-full max-w-md transform overflow-hidden rounded-xl
                          bg-black/80 backdrop-blur-lg p-6 text-left align-middle shadow-xl
                          border border-white/20"
              >
                {/* Close button */}
                <button 
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Content */}
                <div className="mt-2 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-300">
                    Join the Dharmaverse
                  </h2>
                  
                  {user ? (
                    <div className="text-white">
                      <p className="mb-4">Welcome to the community!</p>
                      {user.imageUrl && (
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                          <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-sm">You're signed in as <span className="font-semibold">{user.name || user.email}</span></p>
                      <p className="text-xs text-white/70 mb-2">{user.email}</p>
                      <p className="mt-4 text-xs sm:text-sm">
                        Your email has been added to our community list. We'll keep you updated on events and community activities.
                      </p>
                      
                      {communityCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm text-cyan-200">
                            {communityCount} {communityCount === 1 ? 'member' : 'members'} in our community
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="mb-6 text-sm sm:text-base text-white">
                        Connect with fellow sci-fi lovers! Join community events, such as singing all 20 hymns of the Dharmaverse Handbook Vol. 1, every Sunday. Let's support each other on the path to enlightenment.
                      </p>
                      
                      {communityCount > 0 && (
                        <p className="mb-4 text-sm text-cyan-200">
                          Join {communityCount} {communityCount === 1 ? 'member' : 'members'} in our community
                        </p>
                      )}
                      
                      {/* Google authentication button */}
                      <div className="mt-6">                        
                        {/* Official Google Sign-In button */}
                        <div id="google-signin-button" className="flex justify-center w-full"></div>
                        
                        {!isGoogleLoaded && <p className="mt-2 text-xs text-white/50">Loading Google Sign-In...</p>}
                      </div>
                      
                      <p className="mt-4 text-xs text-white/60">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default InfoModal; 