'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { useSponsoredPick } from '@/hooks/useSponsoredPick';

const YOUTUBE_ID = "eDuCxyhyx7g";

export default function SponsoredPickHero() {
  const { pick } = useSponsoredPick(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const sendCommand = useCallback((func: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  }, []);

  // 화면 이탈 시 pause
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    sendCommand(muted ? "mute" : "unMute");
  }, [muted, sendCommand]);

  useEffect(() => {
    sendCommand(visible ? "playVideo" : "pauseVideo");
    setIsPlaying(visible);
  }, [visible, sendCommand]);

  const handleVideoClick = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    sendCommand(next ? "playVideo" : "pauseVideo");
  };

  if (!pick) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden group"
    >
      {/* 유튜브 embed - cc_load_policy=0 자막 비활성, 기본 muted */}
      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&cc_load_policy=0&playsinline=1&loop=1&playlist=${YOUTUBE_ID}&enablejsapi=1`}
        title="전문가 추천 영상"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />

      {/* 클릭/터치: play/pause (상단 영상 영역, CTA 클릭 가능하도록 하단 여유) */}
      <button
        type="button"
        onClick={handleVideoClick}
        className="absolute top-0 left-0 right-0 h-[60%] z-[1] cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        aria-label={isPlaying ? '일시정지' : '재생'}
      />

      {/* 텍스트 영역 - z-10으로 버튼 위에 (CTA 클릭 가능) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <h3 className="body-sm font-bold">
          {pick.title}
        </h3>
        <p className="caption opacity-80">
          {pick.subtitle}
        </p>

        <Link
          href={`/market/${pick.productId}`}
          className="inline-block mt-3 px-5 py-2.5 rounded-[12px] body-sm font-bold tap-scale"
          style={{ backgroundColor: 'var(--royal-blue)', boxShadow: 'var(--shadow-royal)' }}
        >
          매수하기
        </Link>
      </div>

      {/* 투명 스피커 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMuted(!muted);
        }}
        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm"
        aria-label={muted ? "음소거 해제" : "음소거"}
      >
        {muted ? (
          <VolumeX size={18} className="text-white" />
        ) : (
          <Volume2 size={18} className="text-white" />
        )}
      </button>
    </div>
  );
}
