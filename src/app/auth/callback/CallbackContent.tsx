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
      else if (elapsed > 10) setHint("网络较慢，请耐心等待...");
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
    const needRetry = error.includes("超时") || error.includes("连接") || error.includes("重试");
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-cream">
        <div className="text-center space-y-4">
          <p className="text-accent-rose">登录失败: {error}</p>
          {needRetry && <p className="text-sm text-text-muted">请确认网络和代理正常后重试</p>}
          <a href="/login" className="mt-4 inline-block rounded-full bg-accent-gold px-6 py-2 text-sm text-white hover:opacity-90">重新登录</a>
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
