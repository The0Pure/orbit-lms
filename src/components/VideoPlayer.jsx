// src/components/VideoPlayer.jsx
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Lock } from 'lucide-react';

export default function VideoPlayer({ url, title, isLocked = false, onProgress }) {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  if (isLocked) {
    return (
      <div className="relative bg-orbit-navy rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center text-orbit-cream">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-orbit-cream/70" />
          </div>
          <p className="font-semibold text-lg mb-1">Module Locked</p>
          <p className="text-orbit-cream/60 text-sm">Enroll to access this lesson</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="relative bg-gradient-to-br from-orbit-navy to-orbit-navy-light rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center text-orbit-cream">
          <p className="text-4xl mb-3">📖</p>
          <p className="font-semibold">Reading / Project Module</p>
          <p className="text-orbit-cream/60 text-sm mt-1">Complete the materials below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-orbit-lg">
      {!started ? (
        // Custom thumbnail / play button
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer group bg-orbit-navy"
          onClick={() => { setStarted(true); setPlaying(true); }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-full bg-orbit-gold/90 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Play size={30} className="text-white ml-1" fill="white" />
            </div>
            <p className="text-white font-semibold text-lg drop-shadow">{title}</p>
            <p className="text-white/60 text-sm mt-1">Click to play</p>
          </div>
        </div>
      ) : null}

      <ReactPlayer
        url={url}
        playing={playing}
        controls={started}
        width="100%"
        height="100%"
        style={{ display: started ? 'block' : 'none' }}
        onProgress={({ played }) => {
          if (onProgress) onProgress(played);
        }}
        onEnded={() => {
          if (onProgress) onProgress(1);
        }}
        config={{
          youtube: {
            playerVars: { showinfo: 1, rel: 0, modestbranding: 1 },
          },
          vimeo: {
            playerOptions: { byline: false, portrait: false, title: false },
          },
        }}
      />
    </div>
  );
}
