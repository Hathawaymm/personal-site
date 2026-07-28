"use client";

import { Suspense } from "react";
import CallbackContent from "./CallbackContent";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg-cream"><p className="text-text-muted">加载中...</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}
