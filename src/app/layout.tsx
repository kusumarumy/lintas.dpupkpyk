
import type { Metadata } from "next";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";
import "cesium/Build/Cesium/Widgets/widgets.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "LINTAS | Layanan Informasi Jembatan Kota Yogyakarta",
  description: "Layanan Informasi Jembatan Kota Yogyakarta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
