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
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false
        });
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
                        <button 
                          className="inline-flex w-full justify-center items-center space-x-2 rounded-lg
                                    bg-white px-4 py-2.5 font-medium text-black hover:bg-gray-100
                                    sm:w-auto sm:px-8 disabled:opacity-70 disabled:cursor-not-allowed"
                          onClick={handleSignIn}
                          disabled={isSigningIn || !isGoogleLoaded}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
                        </button>
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