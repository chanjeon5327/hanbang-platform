"use client";

import { useToast } from '@/context/ToastContext';

export function JoinButton({ contentId }: { contentId: string }) {
  const { toast } = useToast();
  const join = async () => {
    await fetch("/api/funnel/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_id: contentId, source: "detail" }),
    });
    toast("합류 완료. 업데이트가 오면 알려드릴게요.");
  };

  return (
    <button
      onClick={join}
      className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold"
    >
      합류하기
    </button>
  );
}
