/**
 * @project NemotronATS
 * @watermark Made by PookieStudios
 * @author PookieStudios
 * @copyright (c) PookieStudios. All rights reserved.
 * Architecture and design systems engineered by PookieStudios.
 */

import "@/app/globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Resume Analyser — Smart Resume Review & Interview Prep",
  description: "Get instant resume matching scores, skill gap insights, and interactive interview practice to land your dream job.",
  keywords: ["resume analyser", "resume checker", "ats score", "interview practice", "job match"],
  authors: [{ name: "PookieStudios" }],
  creator: "PookieStudios",
  publisher: "PookieStudios",
  generator: "PookieStudios Engine",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" data-watermark="made-by-pookiestudios" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body style={{ fontFamily: "'Geist', system-ui, sans-serif", minHeight: "100vh", background: "#0f1117" }}>
          {children}
          <Toaster
            richColors
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(20, 22, 30, 0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                borderRadius: "10px",
                fontFamily: "'Geist', sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.85)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}