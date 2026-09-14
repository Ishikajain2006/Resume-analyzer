"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { InterviewQuestion } from "@/lib/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  Clock,
  List,
  Layers,
  ChevronRight,
  ChevronLeft,
  Loader2,
  BookOpen,
  Mic,
  MicOff,
  Star,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { sounds } from "@/lib/sound";

interface InterviewQuestionsProps {
  resumeId: string;
  skillGaps: string[];
  initialRole?: string;
  onSessionCreated?: (questions: InterviewQuestion[]) => void;
}

export function InterviewQuestions({
  resumeId,
  skillGaps,
  initialRole = "Senior Full-Stack Engineer",
  onSessionCreated,
}: InterviewQuestionsProps) {
  const [targetRole, setTargetRole] = useState(initialRole);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "accordion">("card");

  // Interactive Stopwatch
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // User practice answers and notes per question
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<number, number>>({});

  // Voice Speech-to-Text State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    sounds.tap();
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in textarea or input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!questions || questions.length === 0) return;

      if (e.code === "Space") {
        e.preventDefault();
        sounds.click();
        setIsTimerRunning((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        sounds.flip();
        setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        sounds.flip();
        setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < questions.length) {
          sounds.flip();
          setActiveQuestionIdx(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions]);

  // Voice Speech Recognition Setup
  const toggleVoiceRecording = (questionId: number) => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      sounds.tap();
      toast.info("Voice recording stopped.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        sounds.click();
        if (!isTimerRunning) {
          setIsTimerRunning(true);
        }
        toast.success("Listening... Speak your interview answer!");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setUserNotes((prev) => {
          const currentText = prev[questionId] || "";
          const newText = currentText ? `${currentText.trim()} ${transcript.trim()}` : transcript.trim();
          return { ...prev, [questionId]: newText };
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      toast.error("Microphone access denied or unsupported.");
      setIsRecordingVoice(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!targetRole.trim()) {
      toast.error("Please provide a target role");
      return;
    }

    sounds.click();
    setIsGenerating(true);
    resetTimer();

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillGaps,
          targetRole,
          resumeId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate interview questions");
      }

      const generated = data.interviewSession.questions as InterviewQuestion[];
      setQuestions(generated);
      setActiveQuestionIdx(0);
      setRevealedAnswers({});
      sounds.success();
      toast.success("5 high-signal technical interview questions generated!");
      if (onSessionCreated) {
        onSessionCreated(generated);
      }
    } catch (err) {
      console.error("Interview generator error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate interview questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAnswerReveal = (id: number) => {
    sounds.tap();
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setRating = (qId: number, rating: number) => {
    sounds.click();
    setConfidenceRatings((prev) => ({
      ...prev,
      [qId]: rating,
    }));
  };

  const currentQ = questions ? questions[activeQuestionIdx] : null;

  // Words per minute calculation
  const noteWordCount = (userNotes[currentQ?.id || 1] || "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(timerSeconds / 60, 0.1);
  const wpm = timerSeconds > 5 ? Math.round(noteWordCount / minutes) : 0;

  return (
    <div className="space-y-6">
      {/* Role Config Panel */}
      <div className="rounded-2xl border border-white/[0.08] bg-card/80 p-6 space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="target-role" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Target Position for Interview Simulation
            </Label>
            <Input
              id="target-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer, Staff Cloud Architect"
              className="bg-card border-white/[0.1] focus:border-cyan-500 font-sans"
              disabled={isGenerating}
            />
          </div>

          <Button
            type="button"
            variant="gradient"
            onClick={handleGenerateClick}
            disabled={isGenerating || !targetRole.trim()}
            className="h-10 px-6 shrink-0 shadow-lg shadow-emerald-500/15 font-bold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Nemotron AI Formulating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {questions ? "Regenerate 5 Questions" : "Generate 5 Questions"}
              </>
            )}
          </Button>
        </div>

        {/* Skill gaps targeted pill */}
        {skillGaps && skillGaps.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-white/[0.06]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Targeting Skill Gaps:
            </span>
            {skillGaps.map((gap, i) => (
              <span
                key={i}
                className="bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-md text-[11px] font-medium border border-amber-500/20"
              >
                {gap}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generated Questions Studio */}
      {questions && questions.length > 0 && (
        <div className="space-y-4">
          {/* Controls Bar: Mode Switch, Stopwatch, Shortcuts Hint */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-card p-1 rounded-xl border border-white/[0.08]">
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3 rounded-lg font-medium"
                onClick={() => {
                  sounds.tap();
                  setViewMode("card");
                }}
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Focus Card Rehearsal
              </Button>
              <Button
                variant={viewMode === "accordion" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs px-3 rounded-lg font-medium"
                onClick={() => {
                  sounds.tap();
                  setViewMode("accordion");
                }}
              >
                <List className="w-3.5 h-3.5 mr-1.5" />
                Accordion List
              </Button>
            </div>

            {/* Stopwatch & Speech Controls */}
            <div className="flex items-center space-x-3">
              {/* Keyboard helper */}
              <div className="hidden lg:flex items-center space-x-1.5 text-xs text-muted-foreground mr-2 font-mono">
                <kbd>Space</kbd> <span>Timer</span>
                <kbd>←</kbd><kbd>→</kbd> <span>Navigate</span>
              </div>

              {/* Stopwatch Widget */}
              <div className="flex items-center space-x-2 bg-card px-3.5 py-1.5 rounded-xl border border-white/[0.08] shadow-inner">
                <div className="flex items-center space-x-1.5 font-mono text-sm font-bold text-white">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
                <div className="flex items-center space-x-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                    onClick={() => {
                      sounds.click();
                      setIsTimerRunning(!isTimerRunning);
                    }}
                    title={isTimerRunning ? "Pause (Space)" : "Start (Space)"}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-white"
                    onClick={resetTimer}
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD MODE: Rehearsal Studio */}
          {viewMode === "card" && currentQ && (
            <div className="space-y-4">
              {/* Question Navigation Tabs */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex items-center space-x-2">
                  {questions.map((q, idx) => {
                    const rating = confidenceRatings[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          sounds.flip();
                          setActiveQuestionIdx(idx);
                        }}
                        className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          activeQuestionIdx === idx
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                            : "bg-card hover:bg-white/[0.05] border-white/[0.08] text-muted-foreground"
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        {rating && (
                          <span className="text-[10px] text-amber-300">
                            {"★".repeat(rating)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border-white/[0.1]"
                    disabled={activeQuestionIdx === 0}
                    onClick={() => {
                      sounds.flip();
                      setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border-white/[0.1]"
                    disabled={activeQuestionIdx === questions.length - 1}
                    onClick={() => {
                      sounds.flip();
                      setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1));
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Main Rehearsal Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-card p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Question {currentQ.id} of 5
                    </span>
                    <span className="bg-white/[0.06] text-foreground text-xs font-semibold px-2.5 py-1 rounded-md border border-white/[0.08]">
                      {currentQ.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Confidence Rating Stars */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="text-[11px] font-mono mr-1">Confidence:</span>
                      {[1, 2, 3].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(currentQ.id, star)}
                          className={`p-0.5 transition-colors ${
                            (confidenceRatings[currentQ.id] || 0) >= star
                              ? "text-amber-400"
                              : "text-muted-foreground/40 hover:text-amber-300"
                          }`}
                          title={`Rate ${star} star`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ))}
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        currentQ.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : currentQ.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {currentQ.difficulty} Difficulty
                    </span>
                  </div>
                </div>

                {/* Question Typography */}
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-snug tracking-tight">
                  {currentQ.question}
                </h3>

                {/* Practice Workspace: Voice + Textarea */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-foreground">
                        Your Spoken / Typed Practice Response:
                      </Label>
                      {isRecordingVoice && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Recording Audio...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span>{noteWordCount} words</span>
                      {wpm > 0 && <span className="text-cyan-400">{wpm} WPM pace</span>}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={userNotes[currentQ.id] || ""}
                      onChange={(e) =>
                        setUserNotes((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                      }
                      placeholder="Practice explaining your answer: State core principles, architectural tradeoffs, failure modes, and past production experience..."
                      className="w-full h-32 rounded-xl border border-white/[0.1] bg-background/50 p-4 text-sm focus:border-emerald-500 focus:outline-none font-sans leading-relaxed text-foreground placeholder:text-muted-foreground"
                    />

                    {/* Microphone Voice Button inside textarea corner */}
                    <button
                      type="button"
                      onClick={() => toggleVoiceRecording(currentQ.id)}
                      className={`absolute right-3 bottom-3 p-2 rounded-lg border transition-all ${
                        isRecordingVoice
                          ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 animate-pulse"
                          : "bg-card hover:bg-white/[0.08] border-white/[0.12] text-muted-foreground hover:text-white"
                      }`}
                      title={isRecordingVoice ? "Stop Voice Recording" : "Start Voice Speech-to-Text"}
                    >
                      {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model Answer Drawer */}
                <div className="border-t border-white/[0.08] pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAnswerReveal(currentQ.id)}
                    className="text-xs font-semibold border-white/[0.1] hover:bg-white/[0.05]"
                  >
                    {revealedAnswers[currentQ.id] ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                        Hide Model Key Points
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                        Reveal Model Answer Key Points
                      </>
                    )}
                  </Button>

                  {revealedAnswers[currentQ.id] && (
                    <div className="mt-4 p-5 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/25 space-y-3 animate-in fade-in-50 duration-300">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Key Technical Concepts to Cover for Full Marks:
                      </div>
                      <ul className="space-y-2 text-sm text-foreground/90 pt-1">
                        {currentQ.sampleAnswerKeyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start space-x-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_#06b6d4]" />
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACCORDION MODE: Overview List */}
          {viewMode === "accordion" && (
            <Accordion type="single" collapsible className="space-y-3">
              {questions.map((q) => (
                <AccordionItem
                  key={q.id}
                  value={`q-${q.id}`}
                  className="rounded-2xl border border-white/[0.08] bg-card overflow-hidden backdrop-blur-md"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-left gap-3 w-full pr-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            Question {q.id}
                          </span>
                          <span className="bg-white/[0.06] text-foreground text-[11px] font-semibold px-2 py-0.5 rounded border border-white/[0.08]">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {q.question}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md border self-start sm:self-center shrink-0 ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : q.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6 pt-2 space-y-3 border-t border-white/[0.06]">
                    <div className="rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 p-4 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sample Answer Key Points:
                      </div>
                      <ul className="space-y-2 text-xs text-foreground/90">
                        {q.sampleAnswerKeyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}

      {/* Empty State */}
      {!questions && (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-card/40 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-foreground">
              Technical Interview Studio Ready
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click &quot;Generate 5 Questions&quot; above to simulate real technical screening questions formulated by NVIDIA Nemotron 3 Super.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
