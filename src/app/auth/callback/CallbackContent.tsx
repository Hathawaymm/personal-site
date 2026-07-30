"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallbackContent() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [hint, setHint] = useState("正在登录...");

  useEffect(() => {
    const code = params.get("code");
    if (!code) { setError("缺少 GitHub 授权码"); return; }

    let done = false;
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (done) { clearInterval(timer); return; }
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed > 30) setHint("仍在尝试连接，请勿关闭页面...");
      else if (elapsed > 10) setHint("正在帮你跳转到 GitHub，稍等一秒钟~");
    }, 2000);

    (async () => {
      try {
        const res = await fetch("/api/auth/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "登录失败");

        done = true;
        clearInterval(timer);
        await new Promise((r) => setTimeout(r, 300));
        window.location.href = "/";
      } catch (err: unknown) {
        done = true;
        clearInterval(timer);
        setError((err as Error).message);
      }
    })();

    return () => { done = true; clearInterval(timer); };
  }, [params]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center space-y-4 rounded-lg border border-accent-gold/20 bg-bg-paper p-8 shadow-paper max-w-sm">
          <h2 className="diary-title text-xl">哎呀，出了一点小状况</h2>
          <p className="text-sm text-text-muted caption-text">GitHub 那边好像有点拥堵，网络开小差了。要不你先刷新一下页面，再点一次登录试试？</p>
          <a href="/login" className="mt-4 inline-block rounded-full bg-accent-gold px-6 py-2 text-sm text-white hover:opacity-90">好的，我刷新一下</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-cream">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent mx-auto" />
        <p className="text-text-muted">{hint}</p>
      </div>
    </div>
  );
}
