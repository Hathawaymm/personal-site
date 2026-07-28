"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAccessLog(module: string) {
  const { isLoggedIn, githubUser } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !githubUser) return;

    const record = () => {
      fetch(
        `https://psn-site-m5-d2g6kt88h3b1d7da8.ap-shanghai.tcb-api.tencentcloudapi.com/web?name=logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record",
            data: {
              uid: githubUser.gid,
              username: githubUser.login,
              module,
              pageUrl: window.location.pathname,
            },
          }),
        }
      ).catch(() => {});
    };

    record();
  }, [isLoggedIn, githubUser, module]);
}
