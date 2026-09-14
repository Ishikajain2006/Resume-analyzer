"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { ResumeUploader } from "@/components/ResumeUploader";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { DiagnosticSummary } from "@/components/DiagnosticSummary";
import { KeywordTaxonomy } from "@/components/KeywordTaxonomy";
import { InterviewTerminal } from "@/components/InterviewTerminal";
import { getUserResumesAction, deleteResumeAction } from "@/actions/resume-actions";
import {
  FileText, Loader2, CheckCircle2, Trash2, ExternalLink,
  Download, Search, Eye, X, RotateCcw, History, Terminal,
  AlertTriangle, Printer, Volume2, VolumeX, Code2,
  ArrowRight, Zap, ChevronDown, Play, Database,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AtsAnalysisResult, InterviewQuestion } from "@/lib/types";
import { sounds } from "@/lib/sound";
import GhostFibers from "@/components/react-bits/GhostFibers";
import LineSidebar from "@/components/react-bits/LineSidebar";
import BorderGlow from "@/components/react-bits/BorderGlow";

const MODELS = [
  { id: "nvidia/nemotron-3.5-lightning-30b-a3b", name: "Nemotron Lightning", sub: "30B · ~500ms", tag: "Fastest" },
  { id: "nvidia/nemotron-3-super-120b-a12b",      name: "Nemotron Super",    sub: "120B · ~2.5s", tag: "Best quality" },
  { id: "meta/llama-3.2-11b-vision-instruct",     name: "Llama 3.2 Vision",  sub: "11B · ~5s",   tag: "Vision" },
];

const SIDEBAR_ITEMS = [
  { id: "input",     label: "Resume & Job", icon: "document" },
  { id: "analysis",  label: "ATS Report",   icon: "chart" },
  { id: "interview", label: "Interview",    icon: "user" },
  { id: "history",   label: "History",      icon: "settings" },
];

export default function StudioPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeFileUrl, setResumeFileUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Full-Stack Engineer");
  const [activeTab, setActiveTab] = useState("input");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [pastResumes, setPastResumes] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [inspectorSearch, setInspectorSearch] = useState("");
  const modelRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  useEffect(() => {
    setSoundEnabled(sounds.isEnabled());
  }, []);

  // Close model dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getUserResumesAction();
      if (res.success && res.resumes) setPastResumes(res.resumes);
    } catch {}
    finally { setIsLoadingHistory(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (resumeText && jobDescription.trim() && !isAnalyzing) { e.preventDefault(); handleAnalyze(); }
      }
      if (e.key === "Escape") { setIsInspectorOpen(false); setIsMatchOpen(false); setModelOpen(false); }
      const t = e.target as HTMLElement;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") {
        const map: Record<string, string> = { "1": "input", "2": atsAnalysis ? "analysis" : "", "3": atsAnalysis ? "interview" : "", "4": "history" };
        if (map[e.key]) { setActiveTab(map[e.key]); sounds.tap(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resumeText, jobDescription, isAnalyzing, atsAnalysis]);

  const handleResumeUpload = useCallback((text: string, id: string, fileUrl?: string | null) => {
    setResumeText(text); setResumeId(id); setResumeFileUrl(fileUrl || null); sounds.success();
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText?.trim()) { toast.error("Upload a resume first"); return; }
    if (!jobDescription.trim()) { toast.error("Paste a job description"); return; }
    setIsAnalyzing(true); sounds.click();
    try {
      const [res] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription, resumeId: resumeId || undefined, model: selectedModel }),
        }),
        new Promise(r => setTimeout(r, 3000)) // Force at least 3s wait for terminal loading effect
      ]);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");
      setAtsAnalysis(data); setResumeId(data.resumeId); setActiveTab("analysis"); sounds.success();
      toast.success("Analysis complete");
      fetchHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally { setIsAnalyzing(false); }
  };

  const handleGenerateInterview = async () => {
    if (!atsAnalysis) { toast.error("Run analysis first"); return; }
    setIsGeneratingQuestions(true); sounds.click();
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillGaps: atsAnalysis.skillGaps || [], targetRole, resumeId: atsAnalysis.resumeId || resumeId, model: selectedModel }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setQuestions(data.interviewSession.questions); setActiveTab("interview"); sounds.success();
      toast.success("5 questions generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setIsGeneratingQuestions(false); }
  };

  const handleReset = () => {
    setResumeText(null); setResumeId(null); setResumeFileUrl(null);
    setJobDescription(""); setAtsAnalysis(null); setQuestions(null); setActiveTab("input");
    sounds.click(); toast.info("Session cleared");
  };

  const handleLoadHistory = (rec: any) => {
    setResumeId(rec.id); setResumeText(rec.parsedText || ""); setResumeFileUrl(rec.fileUrl || null);
    setJobDescription(rec.jobDescription || "");
    if (rec.atsScore != null) {
      setAtsAnalysis({ atsScore: rec.atsScore, matchingKeywords: rec.matchingKeywords || [], missingKeywords: rec.missingKeywords || [], skillGaps: rec.skillGaps || [], strengths: rec.strengths || [], summary: rec.summary || "" });
      setActiveTab("analysis");
    } else { setActiveTab("input"); }
    sounds.click(); toast.success("Loaded from history");
  };

  const exportMD = () => {
    if (!atsAnalysis) return;
    const md = `# ATS Report\n**Date**: ${new Date().toLocaleDateString()}\n**Role**: ${targetRole}\n**Score**: ${atsAnalysis.atsScore}/100\n\n## Summary\n${atsAnalysis.summary}\n\n## Matching\n${atsAnalysis.matchingKeywords.map(k => `- [x] ${k}`).join("\n")}\n\n## Missing\n${atsAnalysis.missingKeywords.map(k => `- [ ] ${k}`).join("\n")}\n\n## Strengths\n${atsAnalysis.strengths.map(s => `- ${s}`).join("\n")}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = `ats-report-${Date.now()}.md`; a.click();
    toast.success("Downloaded .md");
  };

  const exportJSON = () => {
    if (!atsAnalysis) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ atsAnalysis, questions, targetRole }, null, 2)], { type: "application/json" }));
    a.download = `ats-payload-${Date.now()}.json`; a.click();
    toast.success("Downloaded .json");
  };

  const handleTabChange = (id: string) => {
    if ((id === "analysis" || id === "interview") && !atsAnalysis) {
      toast.error("Complete the analysis first");
      return;
    }
    setActiveTab(id);
    sounds.tap();
  };

  const S = {
    page: { minHeight: "100vh", background: "#090510", color: "rgba(255,255,255,0.85)", display: "flex", flexDirection: "column" as const, fontFamily: "'Geist', system-ui, sans-serif", position: "relative" as const },
    nav: { borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(9,5,16,0.8)", backdropFilter: "blur(16px)", position: "sticky" as const, top: 0, zIndex: 40 },
    navInner: { maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
    workspace: { flex: 1, display: "flex", maxWidth: 1400, margin: "0 auto", width: "100%", zIndex: 1, position: "relative" as const },
    sidebar: { width: "240px", flexShrink: 0, padding: "32px 0 32px 12px" },
    main: { flex: 1, padding: "32px 24px", minWidth: 0 },
  };

  return (
    <div style={S.page}>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.15 }}>
        <GhostFibers lineColor="#a855f7" glowColor="#8400ff" layers={2} />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <header style={S.nav} className="no-print">
        <div className="max-w-[1400px] mx-auto px-4 py-3 md:py-0 md:h-14 flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
          {/* Brand */}
          <div className="order-1" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <img src="/logo.jpg" alt="NemotronATS Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.015em" }}>
                Nemotron<span style={{ color: "#a855f7" }}>ATS</span>
              </span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace" }}>Studio</span>
          </div>

          {/* Model picker */}
          <div ref={modelRef} className="order-3 md:order-2 w-full md:w-auto relative flex-shrink-0" style={{ flex: "0 0 auto" }}>
            <button
              onClick={() => setModelOpen(!modelOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer", fontFamily: "'Geist', sans-serif",
                transition: "all 0.15s"
              }}
              className="hover:bg-white/5"
            >
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Geist Mono', monospace" }}>model</span>
              <span style={{ fontWeight: 600 }}>{currentModel.name}</span>
              <span style={{ fontSize: 10, color: "#d8b4fe", background: "rgba(132,0,255,0.15)", border: "1px solid rgba(132,0,255,0.25)", padding: "1px 6px", borderRadius: 4 }}>{currentModel.tag}</span>
              <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", transition: "transform 0.15s", transform: modelOpen ? "rotate(180deg)" : "none" }} />
            </button>

            {modelOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: 240, zIndex: 100,
                background: "#120a1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)", overflow: "hidden",
              }}>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setModelOpen(false); sounds.tap(); toast.success(`Model: ${m.name}`); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", background: m.id === selectedModel ? "rgba(132,0,255,0.1)" : "transparent",
                      border: "none", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'Geist', sans-serif",
                      transition: "background 0.1s"
                    }}
                    className="hover:bg-white/5"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: m.id === selectedModel ? "#d8b4fe" : "#fff" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace", marginTop: 4 }}>{m.sub}</div>
                    </div>
                    {m.id === selectedModel && <CheckCircle2 size={16} style={{ color: "#a855f7" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => { const n = sounds.toggle(); setSoundEnabled(n); toast.info(n ? "Sound on" : "Sound off"); }}
              className="btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: "center" }}
            >
              {soundEnabled ? <Volume2 size={15} style={{ color: "#22c55e" }} /> : <VolumeX size={15} />}
            </button>
            <button onClick={handleReset} className="btn-ghost" style={{ height: 36 }}>
              <RotateCcw size={14} /> Reset
            </button>
            {isLoaded && isSignedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                <UserButton afterSignOutUrl="/" />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace", fontWeight: 500 }}>
                  {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "User"}
                </span>
              </div>
            ) : isLoaded ? (
              <SignInButton mode="modal">
                <button className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Sign in</button>
              </SignInButton>
            ) : null}
          </div>
        </div>
      </header>

      {/* ── WORKSPACE ────────────────────────────────────── */}
      <div style={S.workspace}>
        
        <aside style={S.sidebar} className="hidden md:block">
          <LineSidebar 
            items={SIDEBAR_ITEMS} 
            activeItem={activeTab} 
            onItemClick={handleTabChange}
            accentColor="#a855f7"
            bgColor="transparent"
          />
        </aside>

        <main style={S.main}>

          <div className="no-print md:hidden" style={{ marginBottom: 20 }}>
            {/* Mobile Tab Fallback */}
            <select 
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="input-dark w-full"
            >
              {SIDEBAR_ITEMS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Context actions */}
          <div className="no-print" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end", marginBottom: 24, minHeight: 40 }}>
            {atsAnalysis && activeTab === "analysis" && (
              <>
                <button onClick={exportMD} className="btn-ghost" style={{ fontSize: 13 }}>
                  <Download size={14} /> .MD
                </button>
                <button onClick={exportJSON} className="btn-ghost" style={{ fontSize: 13 }}>
                  <Code2 size={14} /> .JSON
                </button>
                <button onClick={() => window.print()} className="btn-ghost" style={{ fontSize: 13 }}>
                  <Printer size={14} /> Print
                </button>
              </>
            )}
            {activeTab === "input" && !isAnalyzing && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText || !jobDescription.trim()}
                className="btn-primary"
                style={{ height: 40, fontSize: 14 }}
              >
                {isAnalyzing ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><Zap size={15} /> Run ATS <kbd style={{ marginLeft: 6 }}>⌘↵</kbd></>}
              </button>
            )}
          </div>

          {/* ═══ TAB 1: INPUT ════════════════════════════════ */}
          {activeTab === "input" && !isAnalyzing && (
            <div className="anim-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>

              {/* Left: Resume */}
              <BorderGlow glowColor="270 100% 65%" backgroundColor="#0c0714" glowIntensity={0.6} animated={false} className="h-full">
                <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16, marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={16} style={{ color: "#d8b4fe" }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,0.95)" }}>Candidate Resume</span>
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace" }}>PDF → server-side extraction</p>
                    </div>
                    {resumeFileUrl && (
                      <a href={resumeFileUrl} target="_blank" rel="noopener" style={{ fontSize: 13, color: "#a855f7", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontWeight: 500 }} className="hover:text-purple-300">
                        <ExternalLink size={14} /> View PDF
                      </a>
                    )}
                  </div>

                  <ResumeUploader onUpload={handleResumeUpload} disabled={isAnalyzing} currentResumeId={resumeId} />

                  {resumeText && (
                    <div style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Text extracted
                          <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{resumeText.length.toLocaleString()} chars</span>
                        </span>
                        <button onClick={() => setIsInspectorOpen(true)} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} className="hover:text-white">
                          <Eye size={13} /> Inspect
                        </button>
                      </div>
                      <div style={{ maxHeight: 120, overflowY: "auto", fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {resumeText.slice(0, 500)}…
                      </div>
                    </div>
                  )}
                </div>
              </BorderGlow>

              {/* Right: Job */}
              <BorderGlow glowColor="270 100% 65%" backgroundColor="#0c0714" glowIntensity={0.6} animated={false} className="h-full">
                <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16, marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Code2 size={16} style={{ color: "#93c5fd" }} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,0.95)" }}>Job Description</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace" }}>Paste requirements to benchmark against</p>
                  </div>

                  <div style={{ flex: 1, minHeight: 250 }}>
                    <JobDescriptionInput value={jobDescription} onChange={setJobDescription} disabled={isAnalyzing} />
                  </div>

                  <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 20 }}>
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !resumeText || !jobDescription.trim()}
                      className="btn-primary"
                      style={{ width: "100%", height: 48, fontSize: 15 }}
                    >
                      {isAnalyzing
                        ? <><Loader2 size={16} className="animate-spin" /> Computing alignment…</>
                        : <><Zap size={16} /> Run ATS Diagnostic <kbd style={{ marginLeft: 8 }}>⌘↵</kbd></>}
                    </button>
                  </div>
                </div>
              </BorderGlow>
            </div>
          )}

          {activeTab === "input" && isAnalyzing && (
            <div className="anim-fade-up">
              <TerminalLoader />
            </div>
          )}

          {/* ═══ TAB 2: ANALYSIS ══════════════════════════════ */}
          {activeTab === "analysis" && atsAnalysis && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <DiagnosticSummary
                score={atsAnalysis.atsScore}
                matchingCount={atsAnalysis.matchingKeywords.length}
                missingCount={atsAnalysis.missingKeywords.length}
                skillGapsCount={atsAnalysis.skillGaps.length}
                summary={atsAnalysis.summary}
                subScores={atsAnalysis.subScores}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {resumeText && (
                  <button onClick={() => setIsMatchOpen(true)} style={{ fontSize: 13, color: "#d8b4fe", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} className="hover:text-purple-300">
                    <Eye size={14} /> View keyword matches in resume text
                  </button>
                )}
              </div>

              <KeywordTaxonomy
                matchingKeywords={atsAnalysis.matchingKeywords}
                missingKeywords={atsAnalysis.missingKeywords}
                categorizedKeywords={atsAnalysis.categorizedKeywords}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                <BorderGlow glowColor="40 100% 60%" backgroundColor="#16120b" glowIntensity={0.5}>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontFamily: "'Geist Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      <AlertTriangle size={16} /> Skill Gaps ({atsAnalysis.skillGaps.length})
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Requirements not evidenced in your resume.</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {atsAnalysis.skillGaps.map((g, i) => (
                        <span key={i} className="tag-gap" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontFamily: "'Geist Mono', monospace" }}>{g}</span>
                      ))}
                    </div>
                  </div>
                </BorderGlow>
                
                <BorderGlow glowColor="140 100% 60%" backgroundColor="#08140b" glowIntensity={0.5}>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontFamily: "'Geist Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      <CheckCircle2 size={16} /> Strengths ({atsAnalysis.strengths.length})
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Verified qualifications matching role requirements.</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {atsAnalysis.strengths.map((s, i) => (
                        <span key={i} className="tag-strength" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontFamily: "'Geist Mono', monospace" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </BorderGlow>
              </div>

              <div className="panel no-print" style={{ padding: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20, background: "rgba(132,0,255,0.05)", borderColor: "rgba(132,0,255,0.2)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "#fff" }}>Ready for interview simulation?</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                    Generate 5 questions targeting: <span style={{ color: "#d8b4fe" }}>{atsAnalysis.skillGaps.slice(0, 3).join(", ")}{atsAnalysis.skillGaps.length > 3 && "…"}</span>
                  </div>
                </div>
                <button onClick={handleGenerateInterview} disabled={isGeneratingQuestions} className="btn-primary" style={{ height: 44, fontSize: 14, whiteSpace: "nowrap" }}>
                  {isGeneratingQuestions ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Terminal size={15} /> Generate Interview <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB 3: INTERVIEW ═════════════════════════════ */}
          {activeTab === "interview" && (
            <div className="anim-fade-up">
              {questions && questions.length > 0 ? (
                <InterviewTerminal questions={questions} targetRole={targetRole} />
              ) : atsAnalysis ? (
                <div className="panel" style={{ padding: "80px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                    <Terminal size={32} style={{ color: "#d8b4fe" }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Ready to simulate an interview</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.6 }}>
                    5 targeted questions on your skill gaps: <br/>
                    <span style={{ color: "#d8b4fe" }}>{atsAnalysis.skillGaps.slice(0, 4).join(", ")}</span>
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Target role"
                      className="input-dark"
                      style={{ maxWidth: 300, height: 44, fontSize: 14 }}
                    />
                    <button onClick={handleGenerateInterview} disabled={isGeneratingQuestions} className="btn-primary" style={{ height: 44, fontSize: 14, whiteSpace: "nowrap", padding: "0 24px" }}>
                      {isGeneratingQuestions ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Play size={15} /> Start Simulation</>}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ═══ TAB 4: HISTORY ═══════════════════════════════ */}
          {activeTab === "history" && (
            <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 18, display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
                    <Database size={20} style={{ color: "#a855f7" }} /> Resume History
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>Local · .data/db.json</p>
                </div>
                <button onClick={fetchHistory} disabled={isLoadingHistory} className="btn-secondary" style={{ height: 36 }}>
                  {isLoadingHistory ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Refresh
                </button>
              </div>

              {pastResumes.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                  {pastResumes.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleLoadHistory(rec)}
                      className="panel hover:bg-white/5"
                      style={{
                        padding: 24, cursor: "pointer", transition: "all 0.2s",
                        borderColor: resumeId === rec.id ? "rgba(168,85,247,0.4)" : undefined,
                        boxShadow: resumeId === rec.id ? "0 0 20px rgba(132,0,255,0.15)" : undefined
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <span style={{ fontWeight: 800, fontSize: 20, color: rec.atsScore != null ? "#a855f7" : "rgba(255,255,255,0.5)" }}>
                              {rec.atsScore != null ? `${rec.atsScore}%` : "—"}
                            </span>
                            {rec.atsScore != null && (
                              <span className={rec.atsScore >= 75 ? "badge-green" : "badge-purple"}>
                                {rec.atsScore >= 75 ? "Tier 1" : "Tier 2"}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {rec.summary || rec.parsedText?.slice(0, 100) || "No summary"}
                          </p>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Geist Mono', monospace" }}>
                            {new Date(rec.createdAt).toLocaleDateString()} · {new Date(rec.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteResumeAction(rec.id).then(() => { toast.success("Deleted"); if (resumeId === rec.id) handleReset(); fetchHistory(); }); }}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 8, borderRadius: 8, transition: "color 0.15s, background 0.15s", flexShrink: 0 }}
                          className="hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel" style={{ padding: "80px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
                  <History size={32} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto 16px" }} />
                  <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", fontSize: 16 }}>No history yet</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Analyze a resume to save your first record.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── RAW TEXT INSPECTOR ─────────────────────────────── */}
      {isInspectorOpen && resumeText && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }} onClick={() => setIsInspectorOpen(false)}>
          <div className="panel" style={{ width: "100%", maxWidth: 800, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#0c0714" }} onClick={(e) => e.stopPropagation()}>
            <div className="terminal-chrome" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'Geist Mono', monospace" }}>resume_text_buffer.txt</span>
              </div>
              <button onClick={() => setIsInspectorOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }} className="hover:text-white"><X size={18} /></button>
            </div>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input type="text" value={inspectorSearch} onChange={(e) => setInspectorSearch(e.target.value)} placeholder="Search extracted text…" className="input-dark" style={{ paddingLeft: 40, height: 40, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "24px", fontFamily: "'Geist Mono', monospace", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-wrap" }}>
              {inspectorSearch
                ? resumeText.split(new RegExp(`(${inspectorSearch})`, "gi")).map((part, i) =>
                    part.toLowerCase() === inspectorSearch.toLowerCase()
                      ? <mark key={i} style={{ background: "rgba(168,85,247,0.4)", color: "#fff", borderRadius: 4, padding: "0 2px" }}>{part}</mark>
                      : part
                  )
                : resumeText}
            </div>
          </div>
        </div>
      )}

      {/* ── KEYWORD MATCH MODAL ─────────────────────────────── */}
      {isMatchOpen && resumeText && atsAnalysis && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }} onClick={() => setIsMatchOpen(false)}>
          <div className="panel" style={{ width: "100%", maxWidth: 1000, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#0c0714" }} onClick={(e) => e.stopPropagation()}>
            <div className="terminal-chrome" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Keyword Match Inspector</span>
              <button onClick={() => setIsMatchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }} className="hover:text-white"><X size={18} /></button>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr", overflow: "hidden" }}>
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24, background: "rgba(0,0,0,0.2)" }}>
                <div>
                  <div className="badge-green" style={{ marginBottom: 12, display: "inline-flex", fontSize: 12 }}>✓ Matched ({atsAnalysis.matchingKeywords.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {atsAnalysis.matchingKeywords.map((k, i) => <span key={i} className="tag-match" style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>{k}</span>)}
                  </div>
                </div>
                <div>
                  <div className="badge-red" style={{ marginBottom: 12, display: "inline-flex", fontSize: 12 }}>✗ Missing ({atsAnalysis.missingKeywords.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {atsAnalysis.missingKeywords.map((k, i) => <span key={i} className="tag-missing" style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>{k}</span>)}
                  </div>
                </div>
              </div>
              <div style={{ overflowY: "auto", padding: 32, fontFamily: "'Geist Mono', monospace", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", whiteSpace: "pre-wrap" }}>
                {resumeText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
