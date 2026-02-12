'use client';

import React from 'react';

type Props = {
  videoId: string;
  className?: string;
  title?: string;
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  loop?: boolean;
  start?: number;
  /** true면 부모를 채우고 aspect ratio 없음 (hero용) */
  fill?: boolean;
};

export default function YouTubeEmbed({
  videoId,
  className = '',
  title = 'YouTube video',
  autoplay = true,
  mute = true,
  controls = false,
  loop = true,
  start,
  fill = false,
}: Props) {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: controls ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
  });

  // loop는 playlist 파라미터가 필요
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  if (start != null && start > 0) {
    params.set('start', String(start));
  }

  const src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;

  if (fill) {
    return (
      <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl ${className}`}>
      <div className="pb-[56.25%]" />
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
