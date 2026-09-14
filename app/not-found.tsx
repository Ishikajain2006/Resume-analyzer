import Link from "next/link";
import { Sparkles, Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 30%, #1a0b2e 0%, #0d0617 50%, #08030f 100%)",
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
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 70%)",
        top: "20%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        filter: "blur(60px)",
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
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))",
            border: "1px solid rgba(168,85,247,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(168,85,247,0.2), inset 0 0 20px rgba(168,85,247,0.1)",
            margin: "0 auto"
          }}>
            {/* Cute sleeping cat SVG with steaming mug */}
            <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Floating stars */}
              <circle cx="20" cy="25" r="1.5" fill="#f472b6" opacity="0.8" />
              <circle cx="80" cy="20" r="2" fill="#c084fc" opacity="0.9" />
              <path d="M78 28L80 24L82 28L86 30L82 32L80 36L78 32L74 30L78 28Z" fill="#e879f9" opacity="0.7" />
              <path d="M16 42L17.5 39L19 42L22 43.5L19 45L17.5 48L16 45L13 43.5L16 42Z" fill="#a855f7" opacity="0.6" />

              {/* Cat Body */}
              <ellipse cx="50" cy="65" rx="28" ry="20" fill="#2d1b4e" stroke="#a855f7" strokeWidth="2" />
              {/* Cat Head */}
              <circle cx="50" cy="46" r="18" fill="#3b2266" stroke="#c084fc" strokeWidth="2" />
              {/* Ears */}
              <polygon points="34,36 40,20 46,32" fill="#3b2266" stroke="#c084fc" strokeWidth="2" />
              <polygon points="37,34 40,24 44,32" fill="#f472b6" opacity="0.6" />
              <polygon points="66,36 60,20 54,32" fill="#3b2266" stroke="#c084fc" strokeWidth="2" />
              <polygon points="63,34 60,24 56,32" fill="#f472b6" opacity="0.6" />
              {/* Sleeping Eyes (Happy closed arcs) */}
              <path d="M41 46 Q45 49 48 46" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M52 46 Q55 49 59 46" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Nose & Mouth */}
              <polygon points="49,51 51,51 50,53" fill="#f472b6" />
              <path d="M50 53 Q47 56 45 54" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M50 53 Q53 56 55 54" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Rosy Cheeks */}
              <circle cx="39" cy="50" r="3" fill="#f472b6" opacity="0.4" />
              <circle cx="61" cy="50" r="3" fill="#f472b6" opacity="0.4" />
              {/* Whiskers */}
              <line x1="32" y1="48" x2="24" y2="46" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
              <line x1="32" y1="52" x2="25" y2="53" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
              <line x1="68" y1="48" x2="76" y2="46" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
              <line x1="68" y1="52" x2="75" y2="53" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
              {/* Paws curled in */}
              <ellipse cx="42" cy="62" rx="5" ry="4" fill="#4c2c85" stroke="#c084fc" strokeWidth="1" />
              <ellipse cx="58" cy="62" rx="5" ry="4" fill="#4c2c85" stroke="#c084fc" strokeWidth="1" />
              {/* Steaming warm mug beside cat */}
              <rect x="68" y="62" width="14" height="15" rx="3" fill="#6b21a8" stroke="#e879f9" strokeWidth="1.5" />
              <path d="M82 66 C85 66 85 72 82 72" stroke="#e879f9" strokeWidth="1.5" fill="none" />
              {/* Steam waves */}
              <path d="M72 58 Q75 55 72 52" stroke="#d8b4fe" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d="M77 59 Q80 56 77 53" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
            </svg>
          </div>

          <div style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            padding: "4px 10px",
            borderRadius: 20,
            background: "#2e1065",
            border: "1px solid rgba(168,85,247,0.4)",
            fontSize: 11,
            color: "#e9d5ff",
            fontFamily: "'Geist Mono', monospace",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            <Sparkles size={12} style={{ color: "#f472b6" }} /> 404
          </div>
        </div>

        {/* Title & Cozy Message */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 10,
          background: "linear-gradient(135deg, #ffffff 40%, #d8b4fe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Lost in the Cozy Void
        </h1>

        <p style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "rgba(255, 255, 255, 0.6)",
          marginBottom: 28,
          maxWidth: 420
        }}>
          Looks like this route went taking a warm catnap with hot matcha. The page you are looking for does not exist or has been tucked away safely.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #9333ea, #db2777)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(147, 51, 234, 0.35)",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
          >
            <Home size={16} /> Take Me Home 🏡
          </Link>

          <Link
            href="/dashboard"
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
            <Compass size={16} /> Open Studio ✨
          </Link>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace" }}>
          meow90 // NemotronATS Diagnostic Engine
        </div>
      </div>
    </div>
  );
}
