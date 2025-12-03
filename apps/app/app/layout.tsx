"use client";

import "./global.css";

import { Providers } from "@/lib/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
