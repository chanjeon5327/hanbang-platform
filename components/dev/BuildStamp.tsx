"use client";

import { useEffect, useState } from "react";

/**
 * Build: <commit 7자리> · Env: <env>
 * ?debug=1 또는 NEXT_PUBLIC_SHOW_BUILD_STAMP=1 일 때만 표시
 */
export default function BuildStamp() {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState<{ commit: string; env: string } | null>(null);

  useEffect(() => {
    const showByUrl = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
    const showByEnv = process.env.NEXT_PUBLIC_SHOW_BUILD_STAMP === "1";
    if (!showByUrl && !showByEnv) return;

    setVisible(true);

    fetch("/api/debug/build", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const commit = d.commit ? String(d.commit).slice(0, 7) : "local";
        const env = d.env ?? "unknown";
        setInfo({ commit, env });
      })
      .catch(() => setInfo({ commit: "local", env: "unknown" }));
  }, []);

  if (!visible || !info) return null;

  return (
    <div
      className="fixed bottom-2 right-2 z-[9999] px-2 py-1 rounded text-[10px] opacity-70 bg-black/60 text-white font-mono"
      aria-label="빌드 정보"
    >
      Build: {info.commit} · Env: {info.env}
    </div>
  );
}
