import React, { createContext, useContext, useState, useEffect, useRef, useCallback, PropsWithChildren } from 'react';

interface WeddingContextType {
  isEntered: boolean;
  enterSite: () => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
  setMusicPlaying: (playing: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider = ({ children }: PropsWithChildren) => {
  const [isEntered, setIsEntered] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /*
   * Lock the page while the WelcomeScreen is up.
   * `overflow: hidden` on <body> is not enough on Safari iOS — the page still
   * rubber-bands. Pinning the body with `position: fixed` and restoring the
   * scroll offset afterwards is the technique that actually holds.
   */
  useEffect(() => {
    if (isEntered) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isEntered]);

  const enterSite = useCallback(() => {
    setIsEntered(true);

    // Play must happen inside the click handler's call stack for mobile
    // autoplay policies to allow it.
    const audio = audioRef.current;
    if (audio) {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
    }
  }, []);

  const toggleMusic = useCallback(() => setIsMusicPlaying(prev => !prev), []);
  const setMusicPlaying = useCallback((playing: boolean) => setIsMusicPlaying(playing), []);

  return (
    <WeddingContext.Provider
      value={{ isEntered, enterSite, isMusicPlaying, toggleMusic, setMusicPlaying, audioRef }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
