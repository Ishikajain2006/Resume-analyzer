"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Cpu } from "lucide-react";
import { AtsSubScores } from "@/lib/types";

interface DiagnosticSummaryProps {
  score: number;
  matchingCount: number;
  missingCount: number;
  skillGapsCount: number;
  summary: string;
  subScores?: AtsSubScores;
}

export function DiagnosticSummary({
  score, matchingCount, missingCount, skillGapsCount, summary, subScores,
}: DiagnosticSummaryProps) {
  const [animated, setAnimated] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dur = 1100;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(e * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const tier =
    score >= 85 ? { label: "High match", tag: "Strong candidate", ring: "#22c55e", ringGlow: "rgba(34,197,94,0.35)", text: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.22)" } :
    score >= 70 ? { label: "Competitive match", tag: "Good potential", ring: "#3b82f6", ringGlow: "rgba(59,130,246,0.3)", text: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.22)" } :
    score >= 50 ? { label: "Moderate match", tag: "Needs work", ring: "#a855f7", ringGlow: "rgba(168,85,247,0.3)", text: "#d8b4fe", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.22)" } :
                  { label: "Low match", tag: "Significant gaps", ring: "#ef4444", ringGlow: "rgba(239,68,68,0.3)", text: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.22)" };

  const ds = subScores || {
    keywordCoverage: matchingCount + missingCount > 0 ? Math.round((matchingCount / (matchingCount + missingCount)) * 100) : score,
    experienceAlignment: Math.min(100, Math.round(score * 1.05)),
    technicalDepth: Math.max(40, Math.round(score * 0.95)),
  };

  const circ = 2 * Math.PI * 50;
  const offset = circ - (animated / 100) * circ;

  const bars = [
    { label: "Keyword match", value: ds.keywordCoverage, color: "#22c55e" },
    { label: "Experience scope", value: ds.experienceAlignment, color: "#3b82f6" },
    { label: "Technical depth", value: ds.technicalDepth, color: "#a78bfa" },
  ];

  return (
    <div className="panel" style={{ padding: "24px 28px", fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 18, marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <Cpu size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              ATS Diagnostic Report
            </span>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.9)" }}>
            Candidate Alignment Report
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", fontWeight: 600, padding: "4px 12px", borderRadius: 6, background: tier.bg, border: `1px solid ${tier.border}`, color: tier.text }}>
            {tier.label}
          </span>
          <span style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)" }}>
            {tier.tag}
          </span>
        </div>
      </div>

      {/* Body: ring + bars */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "start" }}>

        {/* Score ring */}
        <div className="panel-sm" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 160 }}>
          <div style={{ position: "relative", width: 120, height: 120 }}>
            {/* Glow */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: `radial-gradient(circle, ${tier.ringGlow} 0%, transparent 70%)`,
              opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease",
            }} />
            <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${tier.ring}60)` }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={tier.ring} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={mounted ? offset : circ}
                style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: tier.text, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "'Geist Mono', monospace" }}>{animated}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace", letterSpacing: "0.06em" }}>/ 100</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: tier.text, textAlign: "center" }}>{tier.tag}</span>
        </div>

        {/* Sub-scores + stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Progress bars */}
          {bars.map((bar) => (
            <div key={bar.label} className="panel-sm" style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{bar.label}</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{bar.value}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: mounted ? `${bar.value}%` : "0%", background: bar.color }} />
              </div>
            </div>
          ))}

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { n: matchingCount, label: "Matched", icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
              { n: missingCount, label: "Missing", icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
              { n: skillGapsCount, label: "Gaps", icon: AlertTriangle, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)" },
            ].map(({ n, label, icon: Icon, color, bg, border }) => (
              <div key={label} className="panel-sm" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.9)", lineHeight: 1, fontFamily: "'Geist Mono', monospace" }}>{n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary callout */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${tier.ring}`, paddingLeft: 18 }}>
        <div style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.3)", marginBottom: 7, display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          <ShieldCheck size={12} /> Executive Summary
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, fontWeight: 400 }}>{summary}</p>
      </div>
    </div>
  );
}
