import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useWedding } from '@/context';

import weddingSong from '@/assets/music/wedding-song.mp3';

const MusicPlayer: React.FC = () => {
  const { isEntered, isMusicPlaying, toggleMusic, setMusicPlaying, audioRef } = useWedding();

  // Sync play/pause state with audio element (for toggle button)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.play().catch(() => {
        // Autoplay blocked — reflect reality in the button instead of lying.
        setMusicPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isMusicPlaying, audioRef, setMusicPlaying]);

  return (
    <>
      {/*
        preload="none" keeps the ~6.7 MB track off the critical path. It does not
        break playback: enterSite() calls .play() inside the click handler's call
        stack, which is what iOS/Android require, and buffering starts there.
      */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        src={weddingSong}
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
      />

      <AnimatePresence>
        {isEntered && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1.5 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <motion.button
              onClick={toggleMusic}
              whileHover={{ scale: 1.1, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.9 }}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-300 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-wedding-olive focus-visible:ring-offset-2 ${
                isMusicPlaying
                  ? 'bg-wedding-olive/90 text-wedding-cream'
                  : 'bg-wedding-cream/90 text-wedding-lila border border-wedding-pearl/40'
              }`}
              aria-label={isMusicPlaying ? 'Pausar música' : 'Reproducir música'}
              aria-pressed={isMusicPlaying}
            >
              <motion.div
                key={isMusicPlaying ? 'on' : 'off'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isMusicPlaying
                  ? <Volume2 size={20} strokeWidth={1.5} />
                  : <VolumeX size={20} strokeWidth={1.5} />}
              </motion.div>
            </motion.button>

            {/* Pulse ring animation when playing */}
            {isMusicPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-wedding-olive/40 pointer-events-none"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicPlayer;
