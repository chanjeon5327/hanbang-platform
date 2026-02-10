"use client";

export function JoinButton({ contentId }: { contentId: string }) {
  const join = async () => {
    await fetch("/api/funnel/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_id: contentId, source: "detail" }),
    });
    alert("합류 완료. 업데이트가 오면 알려드릴게요.");
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
