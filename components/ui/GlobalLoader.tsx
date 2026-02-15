'use client';

type Props = {
  visible: boolean;
};

export default function GlobalLoader({ visible }: Props) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--royal-blue)' }} />
    </div>
  );
}
