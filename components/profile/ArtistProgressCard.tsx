"use client";

interface ArtistProgressCardProps {
  artist: string;
  totalAmount: number;
  targetAmount: number;
  progress: number;
  compact?: boolean;
}

const GOLD = "#C5A059";
const BG = "#000000";

/**
 * 공식 파트너십 도달률 카드
 * - 등급/레벨 단어 사용 금지
 */
export default function ArtistProgressCard({
  artist,
  totalAmount,
  targetAmount,
  progress,
  compact = false,
}: ArtistProgressCardProps) {
  const totalFormatted = totalAmount.toLocaleString("ko-KR");
  const targetFormatted = targetAmount.toLocaleString("ko-KR");
  const percent = Math.min(100, Math.max(0, progress));

  if (compact) {
    return (
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: BG,
          border: "1px solid " + GOLD,
        }}
      >
        <p className="text-[11px] font-medium mb-1.5" style={{ color: GOLD }}>
          [{artist}] 공식 파트너십 도달률
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden mb-1"
          style={{ backgroundColor: "rgba(197,160,89,0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: GOLD }}
          />
        </div>
        <p className="text-[10px]" style={{ color: GOLD }}>
          {percent}% · ₩{totalFormatted} / ₩{targetFormatted}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: BG,
        border: "1px solid " + GOLD,
      }}
    >
      <h3 className="text-[14px] font-semibold mb-3" style={{ color: GOLD }}>
        [{artist}] 공식 파트너십 도달률
      </h3>
      <div
        className="h-2.5 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: "rgba(197,160,89,0.2)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: GOLD }}
        />
      </div>
      <p className="text-[14px] font-bold mb-1" style={{ color: GOLD }}>
        {percent}%
      </p>
      <p className="text-[12px]" style={{ color: "rgba(197,160,89,0.9)" }}>
        ₩{totalFormatted} / ₩{targetFormatted}
      </p>
    </div>
  );
}
