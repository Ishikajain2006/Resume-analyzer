'use client';

import Link from "next/link";
import {
  ArrowRight, Check, X, FileText, Sparkles,
  Database, Lock, Mic, Zap, ShieldCheck
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
        { label: 'Match Reports', href: '/dashboard' },
        { label: 'Mock Interview', href: '/dashboard' }
      ]
    },
    {
      label: 'Resources',
      bgColor: '#2a1a4a',
      textColor: '#d8b4fe',
      links: [
        { label: 'Privacy & Security', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' }
      ]
    },
    {
      label: 'Support',
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
      label: "Parsing",
      title: "Instant PDF Reader",
      description: "Extracts your work experience, education, and technical stack clearly with zero formatting loss.",
      color: "#1a0b2e",
      icon: <FileText size={160} strokeWidth={1} style={{ position: 'absolute', right: '-30px', bottom: '-30px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(-15deg)' }} />
    },
    {
      label: "Matching",
      title: "Smart Keyword Match",
      description: "Compares your profile with job specs to uncover missing keywords, skill gaps, and match percentage.",
      color: "#251242",
      icon: <Sparkles size={160} strokeWidth={1} style={{ position: 'absolute', right: '-30px', bottom: '-30px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(10deg)' }} />
    },
    {
      label: "Interview",
      title: "Mock Interview Sim",
      description: "Practice answering 5 personalized screening questions with live speech recognition and instant feedback.",
      color: "#311859",
      icon: <Mic size={160} strokeWidth={1} style={{ position: 'absolute', right: '-30px', bottom: '-30px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(-10deg)' }} />
    },
    {
      label: "Privacy",
      title: "Private & Secure",
      description: "Your resume and job applications remain strictly private and saved safely on your device.",
      color: "#120f17",
      icon: <Lock size={160} strokeWidth={1} style={{ position: 'absolute', right: '-30px', bottom: '-30px', color: 'rgba(216, 180, 254, 0.05)', transform: 'rotate(15deg)' }} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#090510] text-white flex flex-col relative" style={{ fontFamily: "'Geist', system-ui, sans-serif", overflowX: 'hidden' }}>
      
      {/* ── BACKGROUND ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.5 }}>
        <Topography color="#8400ff" scale={2.5} thickness={0.15} speed={0.15} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090510]/80 to-[#090510]"></div>
      </div>

      {/* ── NAV ──────────────────────────────────────────── */}
      <div className="relative z-50">
        <CardNav 
          logo="/logo.jpg"
          logoAlt="Resume Analyser"
          items={navItems}
          baseColor="#0f0918"
          menuColor="#d8b4fe"
          buttonBgColor="#8400ff"
          buttonTextColor="#ffffff"
        />
      </div>

      <main className="flex-1 relative z-10 pt-24 sm:pt-32">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 text-center flex flex-col items-center">
          
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="badge-purple">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />
              Smart Resume Engine
            </span>
          </div>

          <div className="w-full max-w-4xl h-[160px] sm:h-[200px] mb-4 sm:mb-6 relative flex items-center justify-center">
            <ParticleText 
              text="Resume Analyser"
              particleSize={2.2}
              density={5}
              color="#d8b4fe"
              highlightColor="#8400ff"
              scatter={80}
              gatherDuration={1800}
              stagger={250}
              pointerRepel={50}
              repelRadius={120}
              idleDrift={0.4}
              trigger="mount"
              fontSize="clamp(2.5rem, 7vw, 5.5rem)"
              fontWeight={800}
              glow={true}
            />
          </div>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-8 font-light leading-relaxed px-2">
            Get an instant resume match score, uncover missing keywords, and practice tailored interview questions — all in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto" style={{ height: 46, fontSize: 14, paddingLeft: 28, paddingRight: 28 }}>
                Get Started Free <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-8 mt-10 text-white/50 text-xs sm:text-sm font-medium">
            {[
              { icon: Lock, label: "100% Private" },
              { icon: FileText, label: "PDF Resume Parser" },
              { icon: Mic, label: "Voice Interview Sim" },
              { icon: Zap, label: "Instant Results" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 justify-center">
                <Icon size={14} className="text-purple-400" /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── PIPELINE PREVIEW ───────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 relative">
          <div className="panel overflow-hidden relative backdrop-blur-md bg-[#0f0918]/70 border-purple-500/20 shadow-[0_0_30px_rgba(132,0,255,0.12)]">
            <div className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-white/40 text-xs font-mono ml-2">
                  resume_analysis_preview
                </span>
              </div>
              <span className="text-purple-400 text-xs font-mono font-medium">
                Ready in seconds
              </span>
            </div>

            <div className="p-4 sm:p-6 border-b border-white/5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { n: "01", label: "Upload Resume", sub: "PDF auto-parse" },
                  { n: "02", label: "Job Description", sub: "Paste target role" },
                  { n: "03", label: "Match Score", sub: "0–100 index" },
                  { n: "04", label: "Mock Interview", sub: "5 practice questions" },
                ].map((step) => (
                  <div key={step.n} className="panel-sm p-3 bg-purple-500/[0.03] border-purple-500/10 rounded-lg">
                    <div className="text-[10px] font-mono text-purple-300 font-semibold mb-1">
                      {step.n}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">{step.label}</div>
                    <div className="text-[11px] text-white/40">{step.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-black/40">
              <pre className="font-mono text-xs sm:text-sm leading-relaxed text-white/60 overflow-x-auto m-0">
                <span className="text-white/30">// Example match report</span>{"\n"}
                {"{"}{"\n"}
                {"  "}<span className="text-purple-300">"matchScore"</span>: <span className="text-emerald-400 font-bold">88%</span>,{"\n"}
                {"  "}<span className="text-purple-300">"matchedSkills"</span>: <span className="text-blue-400">["React", "TypeScript", "Node.js", "PostgreSQL"]</span>,{"\n"}
                {"  "}<span className="text-purple-300">"suggestedKeywords"</span>: <span className="text-amber-300">["Redis", "GraphQL", "CI/CD"]</span>,{"\n"}
                {"  "}<span className="text-purple-300">"overallFeedback"</span>: <span className="text-white/60">"Strong background. Highlight cloud tools to boost score."</span>{"\n"}
                {"}"}
              </pre>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────── */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="mb-10 text-center">
            <p className="label-mono mb-2 text-xs text-purple-400 font-semibold uppercase tracking-wider">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Everything you need to <span className="text-purple-400">stand out.</span>
            </h2>
          </div>

          <MagicBento 
            cards={bentoCards}
            glowColor="132, 0, 255"
            particleCount={12}
            enableTilt={true}
            enableBorderGlow={true}
          />
        </section>

        {/* ── COMPARISON TABLE ─────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 border-t border-white/5">
          <div className="mb-8 text-center">
            <p className="label-mono mb-2 text-xs text-purple-400 font-semibold uppercase tracking-wider">Comparison</p>
            <h2 className="text-2xl font-bold">Why choose Resume Analyser?</h2>
          </div>

          <div className="panel overflow-x-auto bg-[#0f0918]/60 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-3 sm:p-4 text-white/40 font-mono font-semibold uppercase text-[11px]">Feature</th>
                  <th className="p-3 sm:p-4 text-rose-400/80 font-mono font-semibold uppercase text-[11px]">Traditional Tools</th>
                  <th className="p-3 sm:p-4 text-purple-300 font-mono font-semibold uppercase text-[11px]">Resume Analyser</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "Resume Parsing", old: "Basic text extraction", ours: "Accurate PDF section parsing" },
                  { f: "Job Match Analysis", old: "Basic word counts", ours: "Semantic relevance & skill gaps" },
                  { f: "Interview Practice", old: "Generic question banks", ours: "Tailored to your resume gaps" },
                  { f: "Voice Rehearsal", old: "Not supported", ours: "Real-time voice & speech evaluation" },
                  { f: "Data Privacy", old: "Stored in remote clouds", ours: "Local & secure" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-purple-900/10 transition-colors">
                    <td className="p-3 sm:p-4 font-medium text-white/80">{row.f}</td>
                    <td className="p-3 sm:p-4 text-white/40 flex items-center gap-2">
                      <X size={14} className="text-rose-500 shrink-0" /> {row.old}
                    </td>
                    <td className="p-3 sm:p-4 text-purple-200">
                      <div className="flex items-center gap-2 font-medium">
                        <Check size={14} className="text-emerald-400 shrink-0" /> {row.ours}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 bg-[#05020a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-white/40">
              Resume Analyser · Smart Resume Review & Interview Prep
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}