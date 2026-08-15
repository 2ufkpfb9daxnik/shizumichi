"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const swUrl = `${base}/sw.js`;

    void navigator.serviceWorker.register(swUrl, { scope: `${base}/` }).catch(() => {
      /* GitHub Pages 以外や非HTTPSでは登録できないことがある */
    });
  }, []);

  return null;
}
