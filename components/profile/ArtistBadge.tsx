"use client";

interface ArtistBadgeProps {
  artist: string;
  amount: number;
}

/**
 * 공식 파트너십 기여 배지
 * - 배경: #000000, 테두리/텍스트: #C5A059
 * - 등급/레벨 단어 사용 금지
 */
export default function ArtistBadge({ artist, amount }: ArtistBadgeProps) {
  const formatted = amount.toLocaleString("ko-KR");
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap"
      style={{
        backgroundColor: "#000000",
        border: "1px solid #C5A059",
        color: "#C5A059",
      }}
    >
      [{artist}] 공식 파트너십 기여 ₩{formatted}
    </span>
  );
}
