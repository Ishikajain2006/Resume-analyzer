"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { CategorizedKeywordGroup } from "@/lib/types";

interface Props {
  matchingKeywords: string[];
  missingKeywords: string[];
  categorizedKeywords?: CategorizedKeywordGroup[];
}

export function KeywordTaxonomy({ matchingKeywords, missingKeywords, categorizedKeywords }: Props) {
  const [filter, setFilter] = useState<"all" | "matching" | "missing">("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (items: string[], label: string) => {
    navigator.clipboard.writeText(items.join(", "));
    setCopied(label); toast.success(`Copied ${items.length} ${label}`);
    setTimeout(() => setCopied(null), 1800);
  };

  const rawGroups: CategorizedKeywordGroup[] = categorizedKeywords?.length ? categorizedKeywords : [
    { category: "Languages & Runtimes",     matching: matchingKeywords.filter(k => /typescript|javascript|python|go|rust|java|node|html|css|sql/i.test(k)), missing: missingKeywords.filter(k => /typescript|javascript|python|go|rust|java|node|html|css|sql/i.test(k)) },
    { category: "Frameworks & Frontend",    matching: matchingKeywords.filter(k => /react|next|vue|angular|svelte|tailwind|redux|zustand|graphql|express/i.test(k)), missing: missingKeywords.filter(k => /react|next|vue|angular|svelte|tailwind|redux|zustand|graphql|express/i.test(k)) },
    { category: "Cloud & DevOps",           matching: matchingKeywords.filter(k => /aws|gcp|azure|docker|kubernetes|k8s|ci.cd|github actions|terraform|linux/i.test(k)), missing: missingKeywords.filter(k => /aws|gcp|azure|docker|kubernetes|k8s|ci.cd|github actions|terraform|linux/i.test(k)) },
    { category: "Databases & Data",         matching: matchingKeywords.filter(k => /postgres|mysql|mongodb|redis|supabase|prisma|sqlite|elastic|kafka/i.test(k)), missing: missingKeywords.filter(k => /postgres|mysql|mongodb|redis|supabase|prisma|sqlite|elastic|kafka/i.test(k)) },
    { category: "Architecture & Practices", matching: matchingKeywords.filter(k => /microservice|api|rest|event.driven|distributed|testing|tdd|agile/i.test(k)), missing: missingKeywords.filter(k => /microservice|api|rest|event.driven|distributed|testing|tdd|agile/i.test(k)) },
  ].filter(g => (g.matching?.length || 0) + (g.missing?.length || 0) > 0);

  const groups = rawGroups.map(g => ({
    ...g,
    matching: filter !== "missing" ? (g.matching || []).filter(k => !search || k.toLowerCase().includes(search.toLowerCase())) : [],
    missing:  filter !== "matching" ? (g.missing  || []).filter(k => !search || k.toLowerCase().includes(search.toLowerCase())) : [],
  })).filter(g => g.matching.length + g.missing.length > 0);

  const total = matchingKeywords.length + missingKeywords.length;
  const coverage = total > 0 ? Math.round((matchingKeywords.length / total) * 100) : 0;

  return (
    <div className="panel" style={{ padding: 24, fontFamily: "'Geist', sans-serif", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>Skills Taxonomy</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace" }}>
            {matchingKeywords.length} matched · {missingKeywords.length} missing
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 60, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #a855f7, #22c55e)", width: `${coverage}%`, transition: "width 0.8s" }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{coverage}%</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keywords…" className="input-dark" style={{ paddingLeft: 30, height: 34, fontSize: 12 }} />
        </div>
        {/* Filter */}
        <div style={{ display: "flex", gap: 3, padding: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
          {(["all", "matching", "missing"] as const).map(mode => (
            <button key={mode} onClick={() => setFilter(mode)} style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: filter === mode ? 600 : 400, cursor: "pointer", transition: "all 0.12s",
              background: filter === mode ? (mode === "matching" ? "rgba(34,197,94,0.12)" : mode === "missing" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.07)") : "transparent",
              border: filter === mode ? `1px solid ${mode === "matching" ? "rgba(34,197,94,0.25)" : mode === "missing" ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.12)"}` : "1px solid transparent",
              color: filter === mode ? (mode === "matching" ? "#4ade80" : mode === "missing" ? "#f87171" : "rgba(255,255,255,0.8)") : "rgba(255,255,255,0.4)",
              fontFamily: "'Geist', sans-serif", textTransform: "capitalize",
            }}>{mode}</button>
          ))}
        </div>
        {/* Copy buttons */}
        <button onClick={() => copy(matchingKeywords, "matched")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.16)", color: "rgba(34,197,94,0.8)", cursor: "pointer", fontFamily: "'Geist', sans-serif" }}>
          {copied === "matched" ? <Check size={12} /> : <Copy size={12} />} Matched ({matchingKeywords.length})
        </button>
        <button onClick={() => copy(missingKeywords, "missing")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.16)", color: "rgba(239,68,68,0.8)", cursor: "pointer", fontFamily: "'Geist', sans-serif" }}>
          {copied === "missing" ? <Check size={12} /> : <Copy size={12} />} Missing ({missingKeywords.length})
        </button>
      </div>

      {/* Taxonomy groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(groups.length > 0 ? groups : [{ category: "All Keywords", matching: filter !== "missing" ? matchingKeywords.filter(k => !search || k.toLowerCase().includes(search.toLowerCase())) : [], missing: filter !== "matching" ? missingKeywords.filter(k => !search || k.toLowerCase().includes(search.toLowerCase())) : [] }]).map((g, i) => (
          <div key={i} className="panel-sm" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{g.category}</span>
              <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "'Geist Mono', monospace' " }}>
                {g.matching.length > 0 && <span style={{ color: "rgba(34,197,94,0.6)" }}>{g.matching.length} ✓</span>}
                {g.missing.length > 0  && <span style={{ color: "rgba(239,68,68,0.6)" }}>{g.missing.length} ✗</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {g.matching.map((k, j) => (
                <span key={`m${j}`} className="tag-match" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>
                  <CheckCircle2 size={10} /> {k}
                </span>
              ))}
              {g.missing.map((k, j) => (
                <span key={`x${j}`} className="tag-missing" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>
                  <XCircle size={10} /> {k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.25)", paddingTop: 4 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.7, display: "inline-block" }} /> Found in resume</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", opacity: 0.7, display: "inline-block" }} /> Missing from resume</span>
      </div>
    </div>
  );
}
