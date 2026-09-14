"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { sounds } from "@/lib/sound";

interface KeywordListProps {
  keywords: string[];
  title: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | "info";
  type?: "matching" | "missing";
}

export function KeywordList({
  keywords,
  title,
  type = "matching",
}: KeywordListProps) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("");

  const handleCopy = () => {
    if (!keywords.length) return;
    sounds.click();
    navigator.clipboard.writeText(keywords.join(", "));
    setCopied(true);
    toast.success(`Copied ${keywords.length} keywords to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatching = type === "matching";
  const filteredKeywords = keywords.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase().trim())
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-card/70 p-5 md:p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isMatching ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
            }`}
          >
            {isMatching ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">
              {keywords.length} terms identified
            </span>
          </div>
        </div>

        {keywords.length > 0 && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
            title="Copy all keywords"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </>
            )}
          </button>
        )}
      </div>

      {keywords.length > 8 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter keywords..."
            className="w-full bg-background/50 border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-white/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      {filteredKeywords.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {filteredKeywords.map((kw, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-default ${
                isMatching
                  ? "bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15"
                  : "bg-rose-500/[0.08] text-rose-300 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/15"
              }`}
            >
              {kw}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic py-2">
          {filter ? "No keywords match your search." : isMatching ? "No matching keywords detected." : "No missing keywords detected."}
        </p>
      )}
    </div>
  );
}
