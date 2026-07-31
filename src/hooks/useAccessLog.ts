"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAccessLog(module: string) {
  const { isLoggedIn, githubUser } = useAuth();

  useEffect(() => {
    // 节流：同一会话内同一模块只记录一次
    const key = `visit_logged_${module}`;
    if (typeof sessionStorage !== "undefined") {
      try {
        if (sessionStorage.getItem(key)) return;
      } catch { /* ignore */ }
    }

    const visitorId = githubUser?.gid ? `github_${githubUser.gid}` : `anon_${Math.random().toString(36).slice(2, 8)}`;
    const username = githubUser?.login || "匿名访客";

    const record = () => {
      fetch(
        `https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record",
            data: {
              visitorId,
              username,
              module,
              pageUrl: window.location.pathname,
            },
          }),
        }
      )
        .then(() => {
          try { sessionStorage.setItem(key, "1"); } catch { /* ignore */ }
        })
        .catch(() => {});
    };

    record();
  }, [isLoggedIn, githubUser, module]);
}
