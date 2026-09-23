import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useFinePointer } from '../hooks/useFinePointer';
import { cn } from '../lib/cn';

interface Props {
  src: string;
  /** Sharper 1080p loop, used when the frame is wide in device pixels (large or high-density screens). */
  srcHd: string;
  poster: string;
  posterSrcSet: string;
  label: string;
  /** True while the card is hovered (desktop only). */
  active: boolean;
  className?: string;
}

/**
 * Project cover: the poster frame by default, the real project video on hover.
 *
 * The video element is created once and kept; its source is attached the first time the card is
 * hovered (resolution picked from the frame's width × devicePixelRatio) and then reused, so a
 * second hover never reloads the file. The poster stays fully visible until the video actually
 * has frames, then the two crossfade (≈400ms), so there is never a black rectangle.
 * Touch devices keep the poster and never load the video; reduced motion crossfades quickly.
 */
export default function VideoPreview({ src, srcHd, poster, posterSrcSet, label, active, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const [source, setSource] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const enabled = fine; // no hover on touch devices

  useEffect(() => {
    const video = ref.current;
    if (!video || !enabled) return;
    if (active) {
      if (!source) {
        const width = video.getBoundingClientRect().width * (window.devicePixelRatio || 1);
        setSource(width > 1400 ? srcHd : src);
        return; // playback starts once the source is in the DOM (effect below)
      }
      video.play().catch(() => {
        /* Autoplay can be refused (e.g. low-power mode); the poster simply stays. */
      });
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [active, source, enabled, src, srcHd]);

  // First hover: the source has just been attached, start it.
  useEffect(() => {
    if (!source || !active) return;
    ref.current?.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const showVideo = playing && active;

  return (
    <div className={cn('relative h-full w-full', className)}>
      <img
        src={poster}
        srcSet={posterSrcSet}
        sizes="(min-width: 1024px) 60vw, 100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity ease-soft',
          reduce ? 'duration-150' : 'duration-[420ms]',
          showVideo ? 'opacity-0' : 'opacity-100',
        )}
      />
      {enabled && (
        <video
          ref={ref}
          src={source ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-label={label}
          onPlaying={() => setPlaying(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity ease-soft',
            reduce ? 'duration-150' : 'duration-[420ms]',
            showVideo ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}
