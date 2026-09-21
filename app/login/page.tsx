"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/merchant/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">
      Mengalihkan ke halaman masuk kasir...
    </div>
  );
}
