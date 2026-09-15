"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Home, Sparkles, AlertCircle, ChevronDown, Coffee } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log client error for telemetry
    console.error("App boundary caught error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 30%, #17072b 0%, #0d0617 50%, #08030f 100%)",
      color: "rgba(255, 255, 255, 0.9)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      fontFamily: "'Geist', system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Cozy ambient glow background orbs */}
      <div style={{
        position: "absolute",
        width: 550,
        height: 550,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)",
        top: "25%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        filter: "blur(70px)",
      }} />

      <div style={{
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Cute Cozy Illustration */}
        <div style={{
          position: "relative",
          marginBottom: 24,
          display: "inline-block"
        }}>
          {/* Glowing badge */}
          <div style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.2))",
            border: "1px solid rgba(236,72,153,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 45px rgba(236,72,153,0.25), inset 0 0 20px rgba(168,85,247,0.15)",
            margin: "0 auto"
          }}>
            {/* Cute cat with tiny bandage & steaming warm tea SVG */}
            <svg width="88" height="88" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cozy floating sparkles */}
              <circle cx="18" cy="22" r="1.5" fill="#f472b6" opacity="0.8" />
              <circle cx="82" cy="26" r="2" fill="#c084fc" opacity="0.9" />
              <path d="M22 36L23.5 33L25 36L28 37.5L25 39L23.5 42L22 39L19 37.5L22 36Z" fill="#f472b6" opacity="0.7" />

              {/* Cat Body */}
              <ellipse cx="50" cy="66" rx="27" ry="19" fill="#2d1345" stroke="#ec4899" strokeWidth="2" />

              {/* Little cute heart on chest */}
              <path d="M50 63 C49 60 46 60 46 63 C46 66 50 68 50 68 C50 68 54 66 54 63 C54 60 51 60 50 63 Z" fill="#f472b6" opacity="0.8" />

              {/* Cat Head */}
              <circle cx="50" cy="46" r="18" fill="#381b5c" stroke="#f472b6" strokeWidth="2" />

              {/* Ears */}
              <polygon points="34,36 39,18 46,32" fill="#381b5c" stroke="#f472b6" strokeWidth="2" />
              <polygon points="37,33 40,23 44,31" fill="#f472b6" opacity="0.6" />
              <polygon points="66,36 61,18 54,32" fill="#381b5c" stroke="#f472b6" strokeWidth="2" />
              <polygon points="63,33 60,23 56,31" fill="#f472b6" opacity="0.6" />

              {/* Tiny Cute Band-aid across one ear */}
              <rect x="36" y="24" width="10" height="4" rx="1" transform="rotate(35 36 24)" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.8" />

              {/* Sleeping cute curved eyes */}
              <path d="M41 46 Q45 50 48 46" stroke="#fce7f3" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M52 46 Q55 50 59 46" stroke="#fce7f3" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Pink Nose & Gentle Smile */}
              <polygon points="49,51 51,51 50,53" fill="#f472b6" />
              <path d="M50 53 Q47 56 45 54" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M50 53 Q53 56 55 54" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Blushing Cheeks */}
              <circle cx="38" cy="51" r="3.5" fill="#f472b6" opacity="0.45" />
              <circle cx="62" cy="51" r="3.5" fill="#f472b6" opacity="0.45" />

              {/* Whiskers */}
              <line x1="32" y1="48" x2="23" y2="47" stroke="#f472b6" strokeWidth="1" opacity="0.7" />
              <line x1="32" y1="53" x2="24" y2="55" stroke="#f472b6" strokeWidth="1" opacity="0.7" />
              <line x1="68" y1="48" x2="77" y2="47" stroke="#f472b6" strokeWidth="1" opacity="0.7" />
              <line x1="68" y1="53" x2="76" y2="55" stroke="#f472b6" strokeWidth="1" opacity="0.7" />

              {/* Cozy teacup with heart steam */}
              <rect x="70" y="62" width="15" height="16" rx="3" fill="#831843" stroke="#f472b6" strokeWidth="1.5" />
              <path d="M85 66 C88 66 88 72 85 72" stroke="#f472b6" strokeWidth="1.5" fill="none" />
              <path d="M74 58 Q77 55 75 52" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M79 59 Q82 56 80 53" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </svg>
          </div>

          <div style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            padding: "4px 10px",
            borderRadius: 20,
            background: "#831843",
            border: "1px solid rgba(244,114,182,0.4)",
            fontSize: 11,
            color: "#fce7f3",
            fontFamily: "'Geist Mono', monospace",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            <Sparkles size={12} style={{ color: "#fbcfe8" }} /> Oops
          </div>
        </div>

        {/* Heading & Cozy Description */}
        <h1 style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 10,
          background: "linear-gradient(135deg, #ffffff 40%, #f472b6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Something Took a Cozy Detour
        </h1>

        <p style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "rgba(255, 255, 255, 0.65)",
          marginBottom: 26,
          maxWidth: 440
        }}>
          Don't worry — our engines just tripped over a warm yarn ball. Take a sip of tea and let&apos;s give it another gentle try!
        </p>

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 20
        }}>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #db2777, #9333ea)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(219, 39, 119, 0.35)",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
          >
            <RefreshCw size={16} /> Take a Sip & Retry 🍵
          </button>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.15s"
            }}
          >
            <Home size={16} /> Return Home 🐾
          </Link>
        </div>

        {/* Collapsible Error Diagnosis */}
        <div style={{ width: "100%", maxWidth: 440, marginTop: 12 }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: 12,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6
            }}
          >
            <ChevronDown size={14} style={{ transform: showDetails ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            {showDetails ? "Hide diagnostic details" : "Show diagnostic details"}
          </button>

          {showDetails && (
            <div style={{
              marginTop: 10,
              padding: 14,
              borderRadius: 8,
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              textAlign: "left",
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              color: "#fbcfe8",
              wordBreak: "break-all"
            }}>
              <div style={{ color: "#f472b6", fontWeight: 600, marginBottom: 4 }}>Error Message:</div>
              {error.message || "An unexpected application error occurred."}
              {error.digest && (
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.4)" }}>
                  Digest ID: {error.digest}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace" }}>
          Resume Analyser Recovery System
        </div>
      </div>
    </div>
  );
}
