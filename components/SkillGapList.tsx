"use client";

import React, { useState } from "react";
import { AlertTriangle, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { sounds } from "@/lib/sound";

interface SkillGapListProps {
  skillGaps: string[];
  strengths: string[];
}

export function SkillGapList({ skillGaps, strengths }: SkillGapListProps) {
  const [copiedGaps, setCopiedGaps] = useState(false);

  const handleCopyGaps = () => {
    if (!skillGaps?.length) return;
    sounds.click();
    navigator.clipboard.writeText(skillGaps.join(", "));
    setCopiedGaps(true);
    toast.success("Copied skill gaps to clipboard");
    setTimeout(() => setCopiedGaps(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Skill Gaps Card */}
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.03] p-6 space-y-4 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Target Role Skill Gaps
              </h3>
              <span className="text-[11px] font-mono text-amber-400/80">
                {skillGaps?.length || 0} gaps detected
              </span>
            </div>
          </div>

          {skillGaps && skillGaps.length > 0 && (
            <button
              onClick={handleCopyGaps}
              className="text-xs text-muted-foreground hover:text-white px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08]"
              title="Copy gaps"
            >
              {copiedGaps ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Specific architectural, domain, or tooling competencies required by the job but missing from your profile.
        </p>

        {skillGaps && skillGaps.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {skillGaps.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            ✓ Zero critical skill gaps identified against this job description!
          </div>
        )}
      </div>

      {/* Strengths Card */}
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] p-6 space-y-4 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Demonstrated Core Strengths
            </h3>
            <span className="text-[11px] font-mono text-emerald-400/80">
              {strengths?.length || 0} key advantages
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          High-value achievements and technical proficiencies where your resume strongly aligns or exceeds the hiring bar.
        </p>

        {strengths && strengths.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {strengths.map((strength, index) => (
              <span
                key={index}
                className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                {strength}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Analyze with a complete job description to benchmark strengths.
          </p>
        )}
      </div>
    </div>
  );
}
