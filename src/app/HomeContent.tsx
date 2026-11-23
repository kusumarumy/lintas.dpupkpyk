"use client";

import { useEffect, useState } from "react";
import homeContent from "./home-content";
import { r2Asset } from "@/lib/assets";

export default function HomeContent() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const updatedHtml = homeContent
      .replace(
        /assets\/([^"' ]+)/g,
        (_, filename: string) => r2Asset(filename)
      )
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    setHtml(updatedHtml);

    let active = true;

    import("aos").then((module) => {
      if (active) {
        module.default.init({
          duration: 1000,
          once: true,
        });

        module.default.refresh();
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
