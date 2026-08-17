'use client';

import { useEffect, useRef, useState } from 'react';

type SolarEcosystemFilmProps = {
  progressRef: { current: number };
  active?: boolean;
  playFilm?: boolean;
  onError?: () => void;
};

export function SolarEcosystemFilm({
  progressRef,
  active = true,
  playFilm = true,
  onError,
}: SolarEcosystemFilmProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playFilm || !active || failed) return;

    let cancelled = false;
    const synchronize = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0 && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        const target = Math.min(duration - 0.04, Math.max(0, progressRef.current * duration));
        if (!video.seeking && Math.abs(video.currentTime - target) > 1 / 30) video.currentTime = target;
      }
      frameRef.current = requestAnimationFrame(synchronize);
    };

    synchronize();
    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      video.pause();
    };
  }, [active, failed, playFilm, progressRef]);

  const handleFailure = () => {
    setFailed(true);
    onError?.();
  };

  return (
    <div className={`journey-film ${ready && !failed ? 'is-ready' : ''}`}>
      <picture className={`journey-film-poster ${playFilm ? '' : 'is-static'}`}>
        <img
          src={playFilm ? '/marketing/cinematic/kaamasaan-solar-ecosystem-poster.webp' : '/marketing/cinematic/kaamasaan-solar-ecosystem-mobile.webp'}
          alt="Photorealistic modern Pakistani solar home with rooftop panels, inverter, batteries, EV charger and electric car"
          width="1600"
          height="800"
        />
      </picture>
      {playFilm && !failed ? (
        <video
          ref={videoRef}
          className="journey-film-video"
          muted
          playsInline
          preload={active ? 'auto' : 'metadata'}
          poster="/marketing/cinematic/kaamasaan-solar-ecosystem-poster.webp"
          aria-label="Scroll-controlled photorealistic solar ecosystem cinematic"
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onSeeked={() => setReady(true)}
          onError={handleFailure}
        >
          <source src="/marketing/cinematic/kaamasaan-solar-ecosystem.mp4" type="video/mp4" />
          <source src="/marketing/cinematic/kaamasaan-solar-ecosystem.webm" type="video/webm" />
        </video>
      ) : null}
    </div>
  );
}
