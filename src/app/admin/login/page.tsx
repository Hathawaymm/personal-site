"use client";

import { useEffect } from "react";

export default function AdminLoginPage() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);

  return null;
}
