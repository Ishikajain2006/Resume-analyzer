'use client';

import Link from "next/link";
import {
  ArrowRight, Check, X, FileText, Cpu, Terminal,
  Database, Lock, Mic, Clock,
} from "lucide-react";
import CardNav from "@/components/react-bits/CardNav";
import Topography from "@/components/react-bits/Topography";
import ParticleText from "@/components/react-bits/ParticleText";
import MagicBento from "@/components/react-bits/MagicBento";

export default function MarketingPage() {
  const navItems = [
    {
      label: 'Platform',
      bgColor: '#120f17',
      textColor: '#ffffff',
      links: [
        { label: 'Studio', href: '/dashboard' },
        { label: 'ATS Reports', href: '/dashboard' },
        { label: 'Interview Sim', href: '/dashboard' }
      ]
    },
    {
      label: 'Technology',
      bgColor: '#2a1a4a',
      textColor: '#d8b4fe',
      links: [
        { label: 'NVIDIA NIM', href: 'https://build.nvidia.com' },
        { label: 'Security & Privacy', href: '/privacy' }
      ]
    },
    {
      label: 'Legal',
      bgColor: '#1e1136',
      textColor: '#ffffff',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' }
      ]
    }
  ];

  const bentoCards = [
    {
      label: "Engine",
      title: "Server-Side Parsing",
      description: "Raw PDF bytes are extracted server-side using pdf-parse with strict UTF-8 normalization. Zero regex hacks.",
      color: "#1a0b2e",
      icon: <FileText size={180} strokeWidth={1} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(-15deg)' }} />
    },
    {
      label: "AI",
      title: "NVIDIA Nemotron",
      description: "Powered by Nemotron-340B via NVIDIA NIM for unparalleled reasoning and speed.",
      color: "#251242",
      icon: <Cpu size={180} strokeWidth={1} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(10deg)' }} />
    },
    {
      label: "Prep",
      title: "Live Interview Sim",
      description: "Web Speech API transcription and real-time grading against the Nemotron gap analysis.",
      color: "#311859",
      icon: <Mic size={180} strokeWidth={1} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(-10deg)' }} />
    },
    {
      label: "Security",
      title: "Local-First Persistence",
      description: "All parsing and data stays in your local .data/db.json. Your resume never leaves your machine.",
      color: "#120f17",
      icon: <Lock size={180} strokeWidth={1} style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(15deg)' }} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#090510] text-white flex flex-col relative" style={{ fontFamily: "'Geist', system-ui, sans-serif", overflowX: 'hidden' }}>
      
      {/* ── BACKGROUND ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.6 }}>
        <Topography color="#8400ff" scale={2.5} thickness={0.15} speed={0.15} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090510]/80 to-[#090510]"></div>
      </div>

      {/* ── NAV ──────────────────────────────────────────── */}
      <div className="relative z-50">
        <CardNav 
          logo="/logo.jpg"
          logoAlt="NemotronATS"
          items={navItems}
          baseColor="#0f0918"
          menuColor="#d8b4fe"
          buttonBgColor="#8400ff"
          buttonTextColor="#ffffff"
        />
      </div>

      <main className="flex-1 relative z-10 pt-32">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-20 text-center flex flex-col items-center">
          
          <div className="flex items-center gap-2 mb-6">
            <span className="badge-purple">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />
              Powered by NVIDIA Nemotron NIM
            </span>
          </div>

          <div className="w-full max-w-4xl h-[280px] sm:h-[200px] mb-8 mt-4 relative flex items-center justify-center">
            <ParticleText 
              text="Analyze. Optimize."
              particleSize={2.5}
              density={6}
              color="#d8b4fe"
              highlightColor="#8400ff"
              scatter={100}
              gatherDuration={2000}
              stagger={300}
              pointerRepel={60}
              repelRadius={150}
              idleDrift={0.5}
              trigger="mount"
              fontSize="clamp(3.5rem, 8vw, 6.5rem)"
              fontWeight={800}
              glow={true}
            />
          </div>

          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", maxWidth: 640, lineHeight: 1.6, marginBottom: 48, fontWeight: 300, textAlign: 'center' }}>
            Get a precise ATS compatibility score with a targeted interview
            simulation — all in under 60 seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <button className="btn-primary" style={{ height: 48, fontSize: 15, paddingLeft: 32, paddingRight: 32 }}>
                Enter Studio <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, marginTop: 48, color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500 }}>
            {[
              { icon: Lock, label: "Local Storage Only" },
              { icon: FileText, label: "Real PDF parsing" },
              { icon: Mic, label: "Live Voice Sim" },
              { icon: Clock, label: "~500ms Lightning" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={14} style={{ color: "#a855f7" }} /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── PIPELINE TERMINAL BLOCK ───────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-20 relative">
          <div className="panel subtle-grid overflow-hidden relative backdrop-blur-md bg-[#0f0918]/60 border-purple-500/20 shadow-[0_0_30px_rgba(132,0,255,0.15)]">
            <div className="terminal-chrome px-5 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56" }} />
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Geist Mono', monospace", marginLeft: 6 }}>
                  diagnostic_output.json
                </span>
              </div>
              <span style={{ color: "#a855f7", fontSize: 11, fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>
                200 OK · 488ms
              </span>
            </div>

            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { n: "01", label: "PDF Ingestion", sub: "Server byte stream" },
                  { n: "02", label: "Skill Taxonomy", sub: "5-category grouping" },
                  { n: "03", label: "ATS Benchmark", sub: "0–100 score engine" },
                  { n: "04", label: "Interview Sim", sub: "5 targeted questions" },
                ].map((step) => (
                  <div key={step.n} className="panel-sm" style={{ padding: "14px 16px", background: 'rgba(132,0,255,0.03)', borderColor: 'rgba(132,0,255,0.1)' }}>
                    <div style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: "#d8b4fe", fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em" }}>
                      {step.n}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Geist Mono', monospace" }}>{step.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "20px 24px", background: "rgba(0,0,0,0.4)" }}>
              <pre style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", overflowX: "auto", margin: 0 }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>// inference snapshot</span>{"\n"}
                {"{"}{"\n"}
                {"  "}<span style={{ color: "#d8b4fe" }}>"atsScore"</span>: <span style={{ color: "#22c55e" }}>88</span>,{"\n"}
                {"  "}<span style={{ color: "#d8b4fe" }}>"subScores"</span>: {"{ "}<span style={{ color: "rgba(255,255,255,0.4)" }}>keywordCoverage: 91, technicalDepth: 87</span>{" },"}{"\n"}
                {"  "}<span style={{ color: "#d8b4fe" }}>"matchingKeywords"</span>: <span style={{ color: "#60a5fa" }}>["Next.js", "TypeScript", "React", "Node.js"]</span>,{"\n"}
                {"  "}<span style={{ color: "#d8b4fe" }}>"missingKeywords"</span>: <span style={{ color: "#fca5a5" }}>["GraphQL Subscriptions", "Redis"]</span>,{"\n"}
                {"  "}<span style={{ color: "#d8b4fe" }}>"summary"</span>: <span style={{ color: "rgba(255,255,255,0.45)" }}>"Strong candidate. Minor gaps in real-time."</span>{"\n"}
                {"}"}
              </pre>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID (MAGIC BENTO) ────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 py-20 relative">
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p className="label-mono" style={{ marginBottom: 12 }}>Platform</p>
            <h2 className="display-lg mx-auto" style={{ maxWidth: 600 }}>
              Production grade,{" "}
              <span style={{ color: "rgba(255,255,255,0.35)" }}>not a side project.</span>
            </h2>
          </div>

          <MagicBento 
            cards={bentoCards}
            glowColor="132, 0, 255"
            particleCount={15}
            enableTilt={true}
            enableBorderGlow={true}
          />
        </section>

        {/* ── COMPARISON TABLE ─────────────────────────────── */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} className="max-w-5xl mx-auto px-6 py-20 relative z-10">
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <p className="label-mono" style={{ marginBottom: 12 }}>Comparison</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>vs. generic ATS checkers</h2>
          </div>

          <div className="panel" style={{ overflow: "hidden", background: 'rgba(15, 9, 24, 0.6)' }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Feature</span>
              <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#f87171", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Legacy tools</span>
              <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#d8b4fe", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>NemotronATS</span>
            </div>

            {[
              { f: "PDF extraction", old: "Client-side regex", ours: "Server byte stream" },
              { f: "Matching logic", old: "Exact string match", ours: "Semantic taxonomy + AI depth" },
              { f: "Interview prep", old: "Generic FAQ lists", ours: "Targeted gap scenarios" },
              { f: "Voice rehearsal", old: "Not available", ours: "Web Speech API + live WPM" },
              { f: "Data privacy", old: "3rd party cloud DB", ours: "Local disk only (.data/db.json)" },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "16px 20px",
                  borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none",
                  fontSize: 13,
                  transition: "background 0.1s",
                }}
                className="hover:bg-purple-900/10 transition-colors"
              >
                <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{row.f}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)" }}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} /> {row.old}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#e9d5ff" }}>
                  <Check size={14} style={{ color: "#a855f7", flexShrink: 0 }} /> {row.ours}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 bg-[#05020a]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              NemotronATS · Next.js 14 · NVIDIA NIM
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/privacy" className="text-[13px] text-white/40 hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[13px] text-white/40 hover:text-white/80 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}