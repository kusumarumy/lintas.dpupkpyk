
"use client";

import { useEffect, useState } from "react";
import homeContent from "./home-content";
import { r2Asset } from "@/lib/assets";

export default function HomeContent() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    // Mengarahkan seluruh gambar assets/ ke Cloudflare R2
    const updatedHtml = homeContent
      .replace(
        /assets\/([^"' ]+)/g,
        (_, filename: string) => r2Asset(filename)
      )
      // Script tidak dijalankan oleh dangerouslySetInnerHTML
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    setHtml(updatedHtml);

    // Inisialisasi AOS setelah komponen dimuat
    let active = true;

    import("aos").then((module) => {
      if (active) {
        module.default.init({
          duration: 1000,
          once: true,
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!html) return null;

  return (
    <div
      className="lintas-home-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
