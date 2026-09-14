"use client";

import React from "react";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const JD_FULLSTACK = `Role: Senior Full-Stack Engineer
Location: Remote (US / Global)

About the Role:
We are seeking a Senior Full-Stack Engineer to architect and expand our cloud-native enterprise platform.

Key Responsibilities:
• Lead frontend development using Next.js 14, React, TypeScript.
• Build high-throughput microservices using Node.js and Go.
• GraphQL APIs and RESTful services with strict type safety.
• PostgreSQL schema optimization and distributed caching using Redis.
• CI/CD pipelines on Kubernetes.

Required Qualifications:
• 5+ years full-stack engineering with React, TypeScript, Node.js.
• Next.js (App Router, Server Components).
• GraphQL, Redis, PostgreSQL production experience.
• Docker/Kubernetes container orchestration.`;

const JD_AI = `Role: Staff AI Systems Engineer
Location: San Francisco, CA / Remote

About the Role:
Join our AI Infrastructure team building the next generation of LLM-powered applications.

Key Responsibilities:
• Design low-latency inference pipelines with NVIDIA Nemotron.
• RAG vector pipelines and prompt evaluation systems.
• Backend microservices in Python (FastAPI) and TypeScript.
• Streaming responses, rate limiting, LLM observability.

Required Qualifications:
• 6+ years software engineering with AI/ML architecture experience.
• NVIDIA API, embeddings, vector databases (pgvector/Pinecone).
• TypeScript, Python, Docker, Kubernetes.`;

const JD_DEVOPS = `Role: Principal Cloud Platform & DevOps Architect
Location: Remote

Key Responsibilities:
• Lead multi-cluster Kubernetes on AWS (EKS) using Terraform, Helm, ArgoCD.
• Prometheus metrics, OpenTelemetry logging, distributed tracing.
• Canary deployments and zero-downtime rollback.

Required:
• 7+ years Cloud Infrastructure, Kubernetes, Terraform, Go/Python, CI/CD.`;

const SAMPLES = [
  { label: "Senior Full-Stack", content: JD_FULLSTACK, color: "#a855f7" },
  { label: "Staff AI Engineer",  content: JD_AI,       color: "#3b82f6" },
  { label: "DevOps Architect",   content: JD_DEVOPS,   color: "#22c55e" },
];

export function JobDescriptionInput({ value, onChange, disabled = false }: JobDescriptionInputProps) {
  const max = 8000;
  const pct = Math.min((value.length / max) * 100, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Geist', sans-serif", height: "100%" }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)", cursor: "default" }}>
          <Briefcase size={13} /> Target Job Specification
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 48, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: pct > 90 ? "#ef4444" : "#a855f7", width: `${pct}%`, transition: "width 0.2s" }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Geist Mono', monospace" }}>
            {value.length.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={max}
        placeholder="Paste the full job description — responsibilities, qualifications, tech stack…"
        className="textarea-dark"
        style={{ flex: 1, minHeight: 180, resize: "none" }}
      />

      {/* Sample loaders */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)" }}>Quick load:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            disabled={disabled}
            onClick={() => { onChange(s.content); toast.success(`Loaded: ${s.label}`); }}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 500,
              padding: "4px 10px", borderRadius: 6, border: `1px solid ${s.color}28`,
              background: `${s.color}10`, color: `${s.color}cc`,
              cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
              transition: "all 0.12s", fontFamily: "'Geist', sans-serif",
            }}
          >
            {s.label} <ArrowUpRight size={11} />
          </button>
        ))}
      </div>
    </div>
  );
}
