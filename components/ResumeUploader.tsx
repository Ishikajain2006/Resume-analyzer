"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, Trash2, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onResumeUpload: (text: string, resumeId: string, fileUrl?: string | null) => void;
  isProcessing?: boolean;
}

const SAMPLE = `Alex Mercer
Senior Full-Stack Software Engineer
San Francisco, CA • alex.mercer@devmail.io • github.com/alexmercer

SUMMARY
Senior Full-Stack Engineer with 6+ years of production experience building high-performance web applications. Expert in TypeScript, React, Next.js, Node.js, and PostgreSQL.

CORE SKILLS
• Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3/Tailwind
• Frontend: React 18, Next.js (App Router), Redux Toolkit, Zustand, Vite, Radix UI
• Backend: Node.js, Express, Fastify, RESTful APIs, WebSockets, Prisma ORM
• Cloud: AWS (EC2, S3, ECS), Docker, CI/CD (GitHub Actions), Linux
• Databases: PostgreSQL, Redis, MongoDB, Supabase

EXPERIENCE
Senior Software Engineer | CloudScale Systems | 2022–Present
• Next.js 14 dashboard — page load from 3.2s to 800ms.
• Migrated monolith to microservices (Node.js, TypeScript, Docker) — API latency -35%.
• Redis caching layer: 15,000+ req/s at 99.99% availability.

Full-Stack Engineer | DataVibe | 2019–2022
• Real-time analytics platform with WebSockets: 120,000+ DAU.
• Bundle size -42% via code-splitting and lazy loading.

EDUCATION
B.S. Computer Science | UC Berkeley | 2015–2019`;

export function ResumeUploader({ onResumeUpload, isProcessing = false }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (f: File) => {
    if (!f.type.includes("pdf") && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("PDF files only"); return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB"); return;
    }

    setFile(f); setSampleLoaded(false); setIsUploading(true); setUploadSuccess(false); setProgress(0);

    const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 200);

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      clearInterval(interval); setProgress(100);
      if (!res.ok || !data.success) throw new Error(data.error || "Parse failed");
      setUploadSuccess(true);
      toast.success("Resume parsed");
      onResumeUpload(data.text, data.resumeId, data.fileUrl);
    } catch (err) {
      clearInterval(interval); setProgress(0);
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setFile(null);
    } finally { setIsUploading(false); }
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) processFile(f);
  };

  const clear = () => {
    setFile(null); setUploadSuccess(false); setSampleLoaded(false); setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSample = () => {
    setSampleLoaded(true); setUploadSuccess(true); setFile(null);
    toast.success("Sample profile loaded");
    onResumeUpload(SAMPLE, "sample_" + Date.now(), null);
  };

  const hasFile = file || sampleLoaded;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: "'Geist', sans-serif" }}>
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileInput} />

      {!hasFile ? (
        /* Drop zone */
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={isDragging ? "dropzone-active" : "dropzone-idle"}
          style={{
            padding: "32px 20px", textAlign: "center", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isDragging ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isDragging ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            <UploadCloud size={22} style={{ color: isDragging ? "#a855f7" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
              Drop PDF here, or <span style={{ color: "#a855f7", textDecoration: "underline" }}>browse</span>
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Geist Mono', monospace" }}>PDF · max 5MB · server-side extraction</p>
          </div>
        </div>
      ) : (
        /* File card */
        <div className="panel-sm" style={{ padding: 14 }}>
          {isUploading && (
            <div style={{ marginBottom: 10 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #a855f7, #d8b4fe)" }} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 9, flexShrink: 0,
              background: isUploading ? "rgba(168,85,247,0.1)" : uploadSuccess ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isUploading ? "rgba(168,85,247,0.25)" : uploadSuccess ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: uploadSuccess ? "0 0 12px rgba(34,197,94,0.15)" : "none",
            }}>
              {isUploading
                ? <Loader2 size={18} style={{ color: "#a855f7", animation: "spin 1s linear infinite" }} />
                : <FileText size={18} style={{ color: uploadSuccess ? "#22c55e" : "rgba(255,255,255,0.4)" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                  {sampleLoaded ? "Alex_Mercer_Resume.pdf" : file?.name}
                </span>
                {sampleLoaded && <span style={{ fontSize: 10, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)", color: "#d8b4fe", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>Sample</span>}
                {uploadSuccess && !isUploading && <CheckCircle2 size={13} style={{ color: "#22c55e", flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace" }}>
                {sampleLoaded ? "Pre-loaded · 6+ YOE Senior Engineer"
                  : isUploading ? "Extracting text server-side…"
                  : `${((file?.size || 0) / 1024).toFixed(1)} KB · parsed`}
              </p>
            </div>
            <button
              onClick={clear} disabled={isUploading}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 6, borderRadius: 6, flexShrink: 0, transition: "color 0.12s" }}
              className="hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sample loader */}
      {!hasFile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>No PDF handy?</span>
          <button
            onClick={loadSample}
            style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500,
              color: "rgba(168,85,247,0.8)", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)",
              padding: "5px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.12s",
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Load sample profile <ArrowUpRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
