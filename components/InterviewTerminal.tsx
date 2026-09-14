"use client";

import React, { useState, useEffect, useRef } from "react";
import { InterviewQuestion } from "@/lib/types";
import {
  Terminal, Clock, Play, Pause, RotateCcw,
  Mic, MicOff, Star, CheckCircle2, ChevronLeft, ChevronRight, Code2,
} from "lucide-react";
import { toast } from "sonner";

interface Props { questions: InterviewQuestion[]; targetRole: string; }

export function InterviewTerminal({ questions, targetRole }: Props) {
  const [idx, setIdx] = useState(0);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [rubricShown, setRubricShown] = useState<Record<number, boolean>>({});
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => setTimerSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const q = questions[idx] || questions[0];
  const words = (notes[q.id] || "").split(/\s+/).filter(Boolean).length;
  const done = Object.keys(ratings).length;

  const voiceToggle = (id: number) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported"); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    try {
      const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = "en-US";
      r.onstart = () => { setRecording(true); if (!timerRunning) setTimerRunning(true); toast.success("Recording…"); };
      r.onresult = (e: any) => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setNotes((n) => ({ ...n, [id]: (n[id] ? n[id] + " " : "") + t })); };
      r.onerror = () => setRecording(false); r.onend = () => setRecording(false);
      recRef.current = r; r.start();
    } catch { toast.error("Microphone unavailable"); setRecording(false); }
  };

  const S = { root: { fontFamily: "'Geist', system-ui, sans-serif" } };

  return (
    <div className="panel" style={{ overflow: "hidden", ...S.root }}>

      {/* ── CHROME BAR ─────────────────────────────────── */}
      <div className="terminal-chrome" style={{ padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f" }} />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal size={13} style={{ color: "rgba(59,130,246,0.7)" }} />
            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Interview Terminal</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>{targetRole}</span>
          </span>
        </div>

        {/* Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.25)", padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)" }}>
          <Clock size={13} style={{ color: "#3b82f6" }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 700, color: timerSecs > 300 ? "#a855f7" : "rgba(255,255,255,0.85)" }}>{fmt(timerSecs)}</span>
          <button onClick={() => setTimerRunning(!timerRunning)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>
            {timerRunning ? <Pause size={13} style={{ color: "#a855f7" }} /> : <Play size={13} style={{ color: "#22c55e" }} />}
          </button>
          <button onClick={() => { setTimerRunning(false); setTimerSecs(0); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ───────────────────────────────── */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace", marginBottom: 6 }}>
          <span>Progress</span><span>{done}/{questions.length} rated</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(done / questions.length) * 100}%`, background: "linear-gradient(90deg, #a855f7, #3b82f6)" }} />
        </div>
      </div>

      {/* ── QUESTION SELECTOR ──────────────────────────── */}
      <div style={{ padding: "14px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {questions.map((q, i) => {
              const active = i === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => { setIdx(i); setTimerSecs(0); setTimerRunning(false); }}
                  style={{
                    padding: "5px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: active ? 700 : 500,
                    background: active ? "rgba(168,85,247,0.12)" : "transparent",
                    border: `1px solid ${active ? "rgba(168,85,247,0.28)" : "transparent"}`,
                    color: active ? "#a855f7" : "rgba(255,255,255,0.35)",
                    cursor: "pointer", transition: "all 0.12s", flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Q{i + 1}
                  {ratings[q.id] && <span style={{ fontSize: 9, color: "#fbbf24" }}>{"★".repeat(ratings[q.id])}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} style={{ padding: 5, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", opacity: idx === 0 ? 0.25 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} style={{ padding: 5, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", opacity: idx === questions.length - 1 ? 0.25 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── QUESTION CONTENT ───────────────────────────── */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Geist Mono', monospace", letterSpacing: "0.05em" }}>SCENARIO {q.id} OF {questions.length}</span>
            <span style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", padding: "2px 8px", borderRadius: 5, color: "rgba(255,255,255,0.6)", fontFamily: "'Geist Mono', monospace" }}>{q.category}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Star rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginRight: 4 }}>Confidence</span>
              {[1, 2, 3].map((s) => (
                <button key={s} onClick={() => setRatings((r) => ({ ...r, [q.id]: s }))}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 1, color: (ratings[q.id] || 0) >= s ? "#fbbf24" : "rgba(255,255,255,0.15)", transition: "color 0.1s" }}>
                  <Star size={14} style={{ fill: (ratings[q.id] || 0) >= s ? "#fbbf24" : "none" }} />
                </button>
              ))}
            </div>
            <span style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 5, fontFamily: "'Geist Mono', monospace", fontWeight: 600,
              background: q.difficulty === "Easy" ? "rgba(34,197,94,0.1)" : q.difficulty === "Medium" ? "rgba(168,85,247,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${q.difficulty === "Easy" ? "rgba(34,197,94,0.22)" : q.difficulty === "Medium" ? "rgba(168,85,247,0.22)" : "rgba(239,68,68,0.22)"}`,
              color: q.difficulty === "Easy" ? "#4ade80" : q.difficulty === "Medium" ? "#d8b4fe" : "#f87171",
            }}>{q.difficulty}</span>
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid #3b82f6", borderRadius: 8, padding: 18 }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{q.question}</p>
        </div>

        {/* Notes textarea */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>Your answer / notes</span>
            <span style={{ fontFamily: "'Geist Mono', monospace" }}>{words} words{words > 0 ? ` · ~${(words / 130).toFixed(1)} min` : ""}</span>
          </div>
          <div style={{ position: "relative" }}>
            <textarea
              value={notes[q.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
              placeholder="Structure: 1. Core concept  2. Tradeoffs & architecture  3. Edge cases & failure modes…"
              className="textarea-dark"
              style={{ minHeight: 128 }}
            />
            <button
              onClick={() => voiceToggle(q.id)}
              className={recording ? "voice-active" : ""}
              style={{
                position: "absolute", right: 10, bottom: 10, display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontFamily: "'Geist', sans-serif",
                background: recording ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${recording ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.09)"}`,
                color: recording ? "#f87171" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {recording ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Voice</>}
            </button>
          </div>
        </div>

        {/* Rubric */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
          <button
            onClick={() => setRubricShown((r) => ({ ...r, [q.id]: !r[q.id] }))}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "rgba(59,130,246,0.8)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Geist', sans-serif", transition: "color 0.12s" }}
          >
            <Code2 size={13} />
            {rubricShown[q.id] ? "Hide rubric" : "Show grading rubric & key concepts"}
          </button>

          {rubricShown[q.id] && (
            <div className="anim-fade-in" style={{ marginTop: 12, padding: 16, borderRadius: 8, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.14)", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "rgba(59,130,246,0.7)", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Key concepts to cover</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.sampleAnswerKeyPoints.map((pt, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                      <span style={{ color: "#60a5fa", marginTop: 2, flexShrink: 0 }}>→</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {q.rubric && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {q.rubric.tradeoffs?.length > 0 && (
                    <div style={{ padding: 12, borderRadius: 7, background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.14)" }}>
                      <p style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: "#d8b4fe", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>Tradeoffs to mention</p>
                      {q.rubric.tradeoffs.map((t, i) => <p key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 4 }}>• {t}</p>)}
                    </div>
                  )}
                  {q.rubric.pitfalls?.length > 0 && (
                    <div style={{ padding: 12, borderRadius: 7, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)" }}>
                      <p style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: "#f87171", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>Anti-patterns to avoid</p>
                      {q.rubric.pitfalls.map((p, i) => <p key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 4 }}>• {p}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
