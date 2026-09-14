import "@/app/globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NemotronATS — AI Resume Analyzer & Interview Prep",
  description: "Production-grade resume analyzer powered by NVIDIA Nemotron. Instant ATS scores, keyword gap analysis, targeted interview simulation.",
  keywords: ["resume analyzer", "ATS", "NVIDIA Nemotron", "interview prep"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
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