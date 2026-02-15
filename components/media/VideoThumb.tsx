'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  href?: string;
  autoPlayOnHover?: boolean;
};

/**
 * 동영상 카드 UX: 데스크탑 hover 시 재생, 모바일 클릭 시 재생
 * - window.matchMedia("(hover: hover)") 체크 → hover 가능 시에만 onMouseEnter/Leave 사용
 * - 모바일: onClick으로 play/pause
 * - 기본 muted 유지, 스피커 버튼 토글
 */
export default function VideoThumb({
  src,
  poster,
  className = '',
  href,
  autoPlayOnHover = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia?.('(hover: hover)');
    if (!mq) return;

    setHasHover(mq.matches);

    const handler = () => setHasHover(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    // 구형 브라우저 대응
    // @ts-ignore
    if (mq.addListener) {
      // @ts-ignore
      mq.addListener(handler);
      // @ts-ignore
      return () => mq.removeListener(handler);
    }
  }, []);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!hasHover) {
        e.preventDefault();
        e.stopPropagation();
        const v = videoRef.current;
        if (v) {
          if (isPlaying) {
            pause();
          } else {
            play();
          }
        }
      }
    },
    [hasHover, isPlaying, play, pause]
  );

  const useHover = hasHover && autoPlayOnHover;

  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={useHover ? play : undefined}
      onMouseLeave={useHover ? pause : undefined}
      onClick={!useHover ? handleClick : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        loop
        className="w-full h-full object-cover aspect-[4/5]"
        onEnded={pause}
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition"
        aria-label={muted ? '음소거 해제' : '음소거'}
      >
        {muted ? (
          <VolumeX size={16} className="text-white" />
        ) : (
          <Volume2 size={16} className="text-white" />
        )}
      </button>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
