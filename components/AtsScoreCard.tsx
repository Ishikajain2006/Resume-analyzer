"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Award, Target, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { sounds } from "@/lib/sound";

interface AtsScoreCardProps {
  score: number | null;
  matchingCount?: number;
  missingCount?: number;
  skillGapsCount?: number;
  summary?: string;
}

export function AtsScoreCard({
  score,
  matchingCount = 0,
  missingCount = 0,
  skillGapsCount = 0,
  summary,
}: AtsScoreCardProps) {
  const safeScore = score !== null ? Math.max(0, Math.min(100, Math.round(score))) : null;

  // Animated Counter State
  const [displayScore, setDisplayScore] = useState<number>(0);

  useEffect(() => {
    if (safeScore === null) return;
    sounds.success();

    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * safeScore);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [safeScore]);

  // Rating and theme definition
  let grade = "Pending Evaluation";
  let description = "Submit a resume and job description to compute ATS match.";
  let strokeColor = "#64748b";
  let badgeBg = "bg-muted text-muted-foreground border-border";
  let gradientId = "neutralGrad";

  if (safeScore !== null) {
    if (safeScore >= 90) {
      grade = "Tier 1: Exceptional Match";
      description = "Your qualifications directly mirror the core stack, architecture, and senior scope of this role.";
      strokeColor = "#10b981";
      badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      gradientId = "emeraldGrad";
    } else if (safeScore >= 75) {
      grade = "Strong Alignment";
      description = "High technical keyword match. You have a very high probability of passing automated screening filters.";
      strokeColor = "#06b6d4";
      badgeBg = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      gradientId = "cyanGrad";
    } else if (safeScore >= 60) {
      grade = "Moderate Match";
      description = "Solid foundation with identifiable gaps. Review missing keywords to improve interview callback rates.";
      strokeColor = "#f59e0b";
      badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
      gradientId = "amberGrad";
    } else if (safeScore >= 40) {
      grade = "Needs Remediation";
      description = "Noticeable gaps in critical tools or architecture. Tailor your resume before submitting.";
      strokeColor = "#a855f7";
      badgeBg = "bg-purple-500/10 text-purple-400 border-purple-500/30";
      gradientId = "purpleGrad";
    } else {
      grade = "Low Overlap";
      description = "Significant divergence from job requirements. Target alternative positions or re-skill.";
      strokeColor = "#ef4444";
      badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
      gradientId = "roseGrad";
    }
  }

  // Circular gauge math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    safeScore !== null
      ? circumference - (displayScore / 100) * circumference
      : circumference;

  // Sub-scores computation
  const totalKeywords = matchingCount + missingCount;
  const keywordRatio = totalKeywords > 0 ? Math.round((matchingCount / totalKeywords) * 100) : safeScore || 0;
  const seniorityScore = safeScore ? Math.min(100, Math.round(safeScore * 1.05)) : 0;
  const impactScore = safeScore ? Math.max(50, Math.round(safeScore * 0.95)) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-card/80 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background ambient lighting */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: strokeColor }}
      />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Radial Gauge (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center group">
            <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.15)]" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-white/[0.06] fill-transparent"
                strokeWidth="11"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="fill-transparent transition-all duration-300 ease-out"
                stroke={`url(#${gradientId})`}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-extrabold tracking-tight text-white font-mono">
                {safeScore !== null ? displayScore : "--"}
                <span className="text-2xl text-white/50">%</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mt-0.5">
                ATS Index
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg} shadow-sm`}>
              <Target className="w-3.5 h-3.5" />
              {grade}
            </span>
          </div>
        </div>

        {/* Right: Detailed Breakdown Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NVIDIA Nemotron 3 Super ATS Diagnostic</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Granular Sub-scores Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Keyword Match</span>
                <span className="text-emerald-400 font-bold">{keywordRatio}%</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${keywordRatio}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Seniority Alignment</span>
                <span className="text-cyan-400 font-bold">{seniorityScore}%</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${seniorityScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Action & Impact</span>
                <span className="text-purple-400 font-bold">{impactScore}%</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${impactScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>Skill Deficiencies</span>
                <span className="text-amber-400 font-bold">{skillGapsCount}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, skillGapsCount * 20)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{matchingCount} Matching Skills</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              <XCircle className="w-3.5 h-3.5" />
              <span>{missingCount} Missing Keywords</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{skillGapsCount} Gap Topics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
