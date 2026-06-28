import React, { useEffect, useRef, useState } from 'react';

const SIGNED_IN_KEY = 'zouk_signed_in';

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    if (fading) {
      return;
    }

    setFading(true);
    setTimeout(() => {
      localStorage.setItem(SIGNED_IN_KEY, '1');
      onDone();
    }, 600);
  };

  useEffect(() => {
    const vid = videoRef.current;

    if (!vid) {
      return;
    }

    vid.play().catch(() => {});
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src="/zouk-intro.mov"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 60,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'system-ui, sans-serif',
            animation: 'zouk-pulse 2s ease-in-out infinite',
          }}
        >
          Tap to enter
        </span>
      </button>

      <style>{`
        @keyframes zouk-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function shouldShowSplash(): boolean {
  try {
    return !localStorage.getItem(SIGNED_IN_KEY);
  } catch {
    return false;
  }
}

export function signOut(): void {
  try {
    localStorage.removeItem(SIGNED_IN_KEY);
  } catch {
    // ignore
  }
}
