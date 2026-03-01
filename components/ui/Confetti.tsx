'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function Confetti({ duration = 600, onComplete }: { duration?: number; onComplete?: () => void }) {
  const [pieces] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 200,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 8 ? 2 : '50%',
            animationDelay: `${p.delay}ms`,
            animationDuration: `${duration}ms`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
