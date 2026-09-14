/**
 * @component InterviewTerminal
 * @watermark Made by PookieStudios
 * @author PookieStudios
 * @copyright (c) PookieStudios. All rights reserved.
 * Real-time AI technical interview simulator with dynamic audio/video I/O hot-swapping.
 */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { InterviewQuestion } from "@/lib/types";
import {
  Terminal, Clock, Play, Pause, RotateCcw,
  Mic, MicOff, Star, CheckCircle2, ChevronLeft, ChevronRight, Code2,
  Volume2, VolumeX, Video, VideoOff, Sparkles, Send, Award, AlertCircle, Loader2,
  Settings, Sliders, Headphones, Camera, RefreshCw, Check,
  Bell, Volume1, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  questions: InterviewQuestion[];
  targetRole: string;
}

// Strictly extract only high-quality English voices
function getEnglishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter((v) => {
    const lang = (v.lang || "").toLowerCase();
    // Exclude any Russian or non-English voice
    if (lang.includes("ru") || lang.includes("russian")) return false;
    return lang.startsWith("en-") || lang === "en" || /english/i.test(v.name);
  });
}

function getBestEnglishVoice(voices: SpeechSynthesisVoice[], preferredGender?: "female" | "male"): SpeechSynthesisVoice | null {
  const english = getEnglishVoices(voices);
  if (english.length === 0) return null;

  if (preferredGender === "female") {
    const female = english.find((v) =>
      /aria|jenny|sonia|michelle|samantha|karen|serena|zira|google.*female/i.test(v.name)
    );
    if (female) return female;
  } else if (preferredGender === "male") {
    const male = english.find((v) =>
      /guy|christopher|steffan|ryan|daniel|oliver|tom|david|mark|google.*male/i.test(v.name)
    );
    if (male) return male;
  }

  // General natural tier
  const natural = english.find((v) =>
    /natural.*(aria|jenny|guy|christopher|steffan)|online.*(natural)/i.test(v.name)
  );
  if (natural) return natural;

  // Google US English
  const google = english.find((v) => /google.*(us|english)/i.test(v.name));
  if (google) return google;

  // Apple voices
  const apple = english.find((v) => /samantha|daniel/i.test(v.name));
  if (apple) return apple;

  // Standard Windows English
  const ms = english.find((v) => /microsoft.*(zira|david|mark)/i.test(v.name));
  if (ms) return ms;

  // Default en-US
  const enUs = english.find((v) => v.lang.toLowerCase() === "en-us");
  return enUs || english[0];
}

export function InterviewTerminal({ questions, targetRole }: Props) {
  const [idx, setIdx] = useState(0);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [rubricShown, setRubricShown] = useState<Record<number, boolean>>({});

  // Voice Speech-to-Text State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState("");
  const recognitionRef = useRef<any>(null);

  // AI Voice Speech Synthesis (TTS)
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.94);

  // Live Video Interview State
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Hardware Device Selection State
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Live Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<number, any>>({});

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => setTimerSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const q = questions[idx] || questions[0];
  const words = (notes[q.id] || "").split(/\s+/).filter(Boolean).length;
  const done = Object.keys(ratings).length;

  // ── 0. POPULATE ENGLISH VOICES ON MOUNT ──────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const english = getEnglishVoices(all);
      setAvailableVoices(english);

      // Auto-select best English voice if none selected
      if (english.length > 0 && !selectedVoiceName) {
        const best = getBestEnglishVoice(all);
        if (best) setSelectedVoiceName(best.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceName]);

  // ── 0.1 HARDWARE DEVICE ENUMERATION & PERMISSION ─────────────────
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const v = devices.filter((d) => d.kind === "videoinput");
      const aIn = devices.filter((d) => d.kind === "audioinput");
      const aOut = devices.filter((d) => d.kind === "audiooutput");

      setVideoDevices(v);
      setAudioInputDevices(aIn);
      setAudioOutputDevices(aOut);

      setSelectedCameraId((prev) => prev || (v[0]?.deviceId ?? ""));
      setSelectedMicId((prev) => prev || (aIn[0]?.deviceId ?? ""));
      setSelectedSpeakerId((prev) => prev || (aOut[0]?.deviceId ?? ""));
    } catch (err) {
      console.warn("Could not enumerate media devices:", err);
    }
  }, []);

  const requestDevicePermissions = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      tempStream.getTracks().forEach((t) => t.stop());
      await refreshDevices();
      toast.success("Hardware access granted! Device names loaded.");
    } catch (err) {
      toast.error("Please grant camera/microphone permission in your browser address bar.");
    }
  };

  useEffect(() => {
    refreshDevices();
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
      return () => navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
    }
  }, [refreshDevices]);

  // ── 1. ROBUST SPEECH-TO-TEXT (MICROPHONE) ──────────────────────────
  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecordingVoice(false);
    setInterimVoiceText("");
  }, []);

  const startVoiceRecording = async (questionId: number) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Use Chrome, Edge, or Safari.");
      return;
    }

    try {
      // Ensure microphone access is granted with preferred mic
      const audioConstraint = selectedMicId ? { deviceId: { ideal: selectedMicId } } : true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
      stream.getTracks().forEach((t) => t.stop());
    } catch (micErr) {
      toast.error("Microphone permission denied. Please allow microphone access in browser settings.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let accumulatedFinal = notes[questionId] || "";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        if (!timerRunning) setTimerRunning(true);
        toast.success("Microphone listening… Speak your response!");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += (accumulatedFinal.length > 0 && !accumulatedFinal.endsWith(" ") ? " " : "") + transcript.trim();
            setNotes((prev) => ({ ...prev, [questionId]: accumulatedFinal }));
          } else {
            interim += transcript;
          }
        }
        setInterimVoiceText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access blocked.");
        } else if (event.error === "network") {
          toast.error("Speech service network timeout. You can also type directly.");
        }
        stopVoiceRecording();
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
        setInterimVoiceText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Voice start failure:", err);
      toast.error("Could not activate voice service. Please type your response.");
      setIsRecordingVoice(false);
    }
  };

  const toggleVoiceRecording = (questionId: number) => {
    if (isRecordingVoice) {
      stopVoiceRecording();
      toast.info("Voice recording paused.");
    } else {
      startVoiceRecording(questionId);
    }
  };

  // ── 2. AI INTERVIEWER VOICE (STRICTLY NATURAL ENGLISH TTS) ─────────
  const toggleSpeakQuestion = (customText?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported in this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = customText || q.question;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Natural human conversational pacing
    utterance.rate = speechSpeed;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    // Strictly resolve chosen English voice or best English fallback
    const allVoices = window.speechSynthesis.getVoices();
    let voiceToUse: SpeechSynthesisVoice | null = allVoices.find((v) => v.name === selectedVoiceName) || null;

    // Guarantee it is English, never Russian or other languages
    if (!voiceToUse || (!voiceToUse.lang.toLowerCase().startsWith("en") && !/english/i.test(voiceToUse.name))) {
      voiceToUse = getBestEnglishVoice(allVoices);
    }

    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang || "en-US";
    }

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setIsSpeakingQuestion(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const testVoiceSample = (voice: SpeechSynthesisVoice) => {
    window.speechSynthesis.cancel();
    setSelectedVoiceName(voice.name);
    const utterance = new SpeechSynthesisUtterance("Hello candidate. I will be your engineering interviewer today.");
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-US";
    utterance.rate = speechSpeed;
    window.speechSynthesis.speak(utterance);
    toast.success(`Interviewer voice set: ${voice.name.replace(/(Microsoft|Google|Apple)\s*/gi, "").slice(0, 24)}`);
  };

  // ── 3. LIVE WEBCAM & AUDIO STREAM (WITH DEVICE SWITCHING) ─────────
  const startCamera = async (camId?: string, micId?: string) => {
    const targetCamId = camId !== undefined ? camId : selectedCameraId;
    const targetMicId = micId !== undefined ? micId : selectedMicId;

    // Stop any existing stream before starting a new one
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
    };
    if (targetCamId) {
      videoConstraints.deviceId = { ideal: targetCamId };
    }

    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
    };
    if (targetMicId) {
      audioConstraints.deviceId = { ideal: targetMicId };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);

      // Re-query devices so labels are populated after permission
      await refreshDevices();

      // Audio Analyser Setup
      try {
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioMeter = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateAudioMeter);
          };
          updateAudioMeter();
        }
      } catch (audioErr) {
        console.warn("Audio meter setup skipped:", audioErr);
      }

      toast.success("Live video & studio mic active!");
    } catch (err) {
      console.warn("Camera/mic access failed with constraints, trying fallback:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setCameraActive(true);
        setMicActive(true);
        await refreshDevices();
        toast.success("Connected to default camera & mic");
      } catch (fallbackErr) {
        console.error("Camera access failed:", fallbackErr);
        toast.error("Could not access camera or microphone. Check browser permissions.");
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAudioLevel(0);
  };

  const toggleVideoMode = () => {
    const next = !isVideoMode;
    setIsVideoMode(next);
    if (next) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const toggleCameraMute = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getVideoTracks();
      const next = !cameraActive;
      tracks.forEach((t) => (t.enabled = next));
      setCameraActive(next);
      toast.info(next ? "Camera resumed 📹" : "Camera paused 🚫");
    } else {
      startCamera();
    }
  };

  const toggleMicMute = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getAudioTracks();
      const next = !micActive;
      tracks.forEach((t) => (t.enabled = next));
      setMicActive(next);
      if (!next) setAudioLevel(0);
      toast.info(next ? "Microphone unmuted 🎙️" : "Microphone muted 🔇");
    }
  };

  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    if (isVideoMode) {
      await startCamera(newCamId, selectedMicId);
    }
    const matched = videoDevices.find((d) => d.deviceId === newCamId);
    toast.success(`Camera: ${matched?.label || "Switched camera device"}`);
  };

  const handleMicChange = async (newMicId: string) => {
    setSelectedMicId(newMicId);
    if (isVideoMode) {
      await startCamera(selectedCameraId, newMicId);
    }
    const matched = audioInputDevices.find((d) => d.deviceId === newMicId);
    toast.success(`Microphone: ${matched?.label || "Switched microphone device"}`);
  };

  const playSpeakerTestTone = async (sinkId?: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const targetSink = sinkId || selectedSpeakerId;
      if (targetSink && typeof (audioCtx as any).setSinkId === "function") {
        try {
          await (audioCtx as any).setSinkId(targetSink);
        } catch (e) {
          console.warn("AudioContext setSinkId notice:", e);
        }
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      // Crisp 3-note melodic chime
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      toast.success("Playing test chime on audio output 🔔");
    } catch (err) {
      console.warn("Speaker test notice:", err);
    }
  };

  const handleSpeakerChange = async (newSpeakerId: string) => {
    setSelectedSpeakerId(newSpeakerId);
    if (videoRef.current && "setSinkId" in videoRef.current) {
      try {
        await (videoRef.current as any).setSinkId(newSpeakerId);
      } catch (err) {
        console.warn("setSinkId failed:", err);
      }
    }
    const matched = audioOutputDevices.find((d) => d.deviceId === newSpeakerId);
    toast.success(`Audio Output: ${matched?.label || "Switched output speaker"}`);
    playSpeakerTestTone(newSpeakerId);
  };

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // ── 4. LIVE AI ANSWER EVALUATION ──────────────────────────────────
  const handleEvaluateAnswer = async (questionId: number) => {
    const candidateAnswer = notes[questionId] || "";
    if (!candidateAnswer.trim() || candidateAnswer.trim().length < 10) {
      toast.error("Speak or type your answer before evaluating!");
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.question,
          candidateAnswer,
          keyPoints: q.sampleAnswerKeyPoints || [],
          rubric: q.rubric,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Evaluation could not be processed");
      }

      setEvaluations((prev) => ({ ...prev, [questionId]: data.evaluation }));
      toast.success(`Answer evaluated: Score ${data.evaluation.score}/100!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentEval = evaluations[q.id];
  const activeVoiceObj = availableVoices.find((v) => v.name === selectedVoiceName) || availableVoices[0];

  return (
    <div className="panel" style={{ overflow: "hidden", fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* ── CHROME BAR ─────────────────────────────────── */}
      <div className="terminal-chrome" style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f" }} />
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={14} style={{ color: "#a855f7" }} />
            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>AI Technical Interview Studio</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{targetRole}</span>
          </span>
        </div>

        {/* View Mode, Device Settings & Timer Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

          {/* Device & Voice Settings Button */}
          <button
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              background: showDeviceSettings ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${showDeviceSettings ? "#a855f7" : "rgba(255,255,255,0.12)"}`,
              color: showDeviceSettings ? "#d8b4fe" : "#ffffff",
              boxShadow: showDeviceSettings ? "0 0 12px rgba(168,85,247,0.3)" : "none",
            }}
            title="Configure Camera, Microphone, and Audio Output"
          >
            <Sliders size={13} style={{ color: "#c084fc" }} />
            <span>Cam / Mic / Speaker Settings</span>
          </button>

          {/* Live Video Toggle Button */}
          <button
            onClick={toggleVideoMode}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              background: isVideoMode ? "linear-gradient(135deg, #ec4899, #9333ea)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isVideoMode ? "#ec4899" : "rgba(255,255,255,0.1)"}`,
              color: "#ffffff",
              boxShadow: isVideoMode ? "0 0 16px rgba(236,72,153,0.35)" : "none",
            }}
          >
            {isVideoMode ? <><Video size={13} /> Live Camera Active</> : <><Video size={13} /> Live Video Mode</>}
          </button>

          {/* Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Clock size={13} style={{ color: "#a855f7" }} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 700, color: timerSecs > 300 ? "#ec4899" : "rgba(255,255,255,0.9)" }}>
              {fmt(timerSecs)}
            </span>
            <button onClick={() => setTimerRunning(!timerRunning)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>
              {timerRunning ? <Pause size={13} style={{ color: "#ec4899" }} /> : <Play size={13} style={{ color: "#22c55e" }} />}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSecs(0); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DEVICE & VOICE SETTINGS DRAWER ──────────────── */}
      {showDeviceSettings && (
        <div style={{
          padding: "16px 20px", background: "rgba(14, 8, 24, 0.97)", borderBottom: "1px solid rgba(168,85,247,0.35)",
          display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.2s"
        }}>
          {/* Top Bar inside Drawer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sliders size={14} style={{ color: "#a855f7" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Hardware & Audio I/O Configuration</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Hot-swap video, mic, and speaker channels live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={refreshDevices}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6,
                  fontSize: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", cursor: "pointer"
                }}
              >
                <RefreshCw size={11} /> Refresh Devices
              </button>
              {(!videoDevices[0]?.label || !audioInputDevices[0]?.label) && (
                <button
                  onClick={requestDevicePermissions}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6,
                    fontSize: 11, background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))",
                    border: "1px solid rgba(168,85,247,0.5)", color: "#f472b6", cursor: "pointer", fontWeight: 600
                  }}
                >
                  Detect Hardware Names
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16
          }}>
            {/* Camera Selector */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#d8b4fe" }}>
                  <Camera size={13} /> Camera (Video Input)
                </label>
                <button
                  onClick={toggleCameraMute}
                  style={{ background: "none", border: "none", fontSize: 11, color: cameraActive ? "#4ade80" : "#f87171", cursor: "pointer", fontWeight: 600 }}
                >
                  {cameraActive ? "Active" : "Paused"}
                </button>
              </div>
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="input-dark w-full"
                style={{ fontSize: 12, height: 36 }}
              >
                {videoDevices.length > 0 ? (
                  videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default Integrated Camera</option>
                )}
              </select>
            </div>

            {/* Microphone Selector */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#f472b6" }}>
                  <Mic size={13} /> Microphone (Audio Input)
                </label>
                <button
                  onClick={toggleMicMute}
                  style={{ background: "none", border: "none", fontSize: 11, color: micActive ? "#4ade80" : "#f87171", cursor: "pointer", fontWeight: 600 }}
                >
                  {micActive ? "Live" : "Muted"}
                </button>
              </div>
              <select
                value={selectedMicId}
                onChange={(e) => handleMicChange(e.target.value)}
                className="input-dark w-full"
                style={{ fontSize: 12, height: 36, marginBottom: 8 }}
              >
                {audioInputDevices.length > 0 ? (
                  audioInputDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default Audio Input</option>
                )}
              </select>

              {/* Live VU Meter indicator inside drawer */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Level</span>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <div style={{ width: micActive ? `${audioLevel}%` : "0%", height: "100%", background: "linear-gradient(90deg, #22c55e, #eab308, #ef4444)", transition: "width 0.05s" }} />
                </div>
                <span style={{ fontSize: 10, color: audioLevel > 15 ? "#4ade80" : "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace", width: 26, textAlign: "right" }}>
                  {micActive ? `${audioLevel}%` : "OFF"}
                </span>
              </div>
            </div>

            {/* Speaker Selector */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#38bdf8" }}>
                  <Headphones size={13} /> Speaker / Output Device
                </label>
                <button
                  onClick={() => playSpeakerTestTone()}
                  style={{ background: "none", border: "none", fontSize: 11, color: "#38bdf8", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Bell size={11} /> Test Sound 🔔
                </button>
              </div>
              <select
                value={selectedSpeakerId}
                onChange={(e) => handleSpeakerChange(e.target.value)}
                className="input-dark w-full"
                style={{ fontSize: 12, height: 36 }}
              >
                {audioOutputDevices.length > 0 ? (
                  audioOutputDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Audio Output ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default Speaker / Headphones</option>
                )}
              </select>
            </div>

            {/* AI Voice Selector (Strictly English Only) */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#4ade80" }}>
                  <Volume2 size={13} /> AI Interviewer Accent
                </label>
                {activeVoiceObj && (
                  <button
                    onClick={() => testVoiceSample(activeVoiceObj)}
                    style={{ fontSize: 11, color: "#4ade80", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                  >
                    Test Voice 🔊
                  </button>
                )}
              </div>
              <select
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  const v = availableVoices.find((x) => x.name === e.target.value);
                  if (v) testVoiceSample(v);
                }}
                className="input-dark w-full"
                style={{ fontSize: 12, height: 36 }}
              >
                {availableVoices.length > 0 ? (
                  availableVoices.map((v, i) => (
                    <option key={v.name + i} value={v.name}>
                      {v.name.replace(/(Microsoft|Google|Apple)\s*/gi, "").slice(0, 30)} ({v.lang})
                    </option>
                  ))
                ) : (
                  <option value="">🇺🇸 US English (Natural)</option>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS BAR ───────────────────────────────── */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace", marginBottom: 6 }}>
          <span>Interview Progression</span>
          <span>{done}/{questions.length} rated</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(done / questions.length) * 100}%`, background: "linear-gradient(90deg, #a855f7, #ec4899)" }} />
        </div>
      </div>

      {/* ── QUESTION SELECTOR ──────────────────────────── */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {questions.map((item, i) => {
              const active = i === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => { setIdx(i); setTimerSecs(0); setTimerRunning(false); }}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: active ? 700 : 500,
                    background: active ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))" : "transparent",
                    border: `1px solid ${active ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: active ? "#ffffff" : "rgba(255,255,255,0.45)",
                    cursor: "pointer", transition: "all 0.12s", flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Q{i + 1}
                  {ratings[item.id] && <span style={{ fontSize: 9, color: "#fbbf24" }}>{"★".repeat(ratings[item.id])}</span>}
                  {evaluations[item.id] && <CheckCircle2 size={11} style={{ color: "#22c55e" }} />}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} style={{ padding: 6, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", opacity: idx === 0 ? 0.25 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} style={{ padding: 6, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", opacity: idx === questions.length - 1 ? 0.25 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN STUDIO CONTENT AREA ─────────────────────── */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* LIVE WEBCAM & AUDIO STUDIO DOCK (WHEN ACTIVE) */}
        {isVideoMode && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16,
            padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(236,72,153,0.25)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)"
          }}>
            {/* Left: Candidate Video Feed & In-Studio Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#0a0512", minHeight: 250, border: "1px solid rgba(255,255,255,0.1)" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", minHeight: 250 }}
                />
                
                {!cameraActive && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(10,5,18,0.88)", color: "rgba(255,255,255,0.7)" }}>
                    <VideoOff size={34} style={{ color: "#ec4899" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Camera Paused</span>
                    <button
                      onClick={toggleCameraMute}
                      style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(168,85,247,0.3)", border: "1px solid rgba(168,85,247,0.5)", color: "#fff", fontSize: 11, cursor: "pointer" }}
                    >
                      Click to Resume Feed
                    </button>
                  </div>
                )}

                {/* Watermarks & Live Badge */}
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 4, background: "rgba(239,68,68,0.85)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
                  LIVE FEED
                </div>

                {/* Quick Overlay Action Buttons */}
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <button
                    onClick={toggleCameraMute}
                    title={cameraActive ? "Pause Camera" : "Resume Camera"}
                    style={{
                      padding: "4px 8px", borderRadius: 6, background: cameraActive ? "rgba(0,0,0,0.6)" : "rgba(239,68,68,0.85)",
                      border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, backdropFilter: "blur(6px)"
                    }}
                  >
                    {cameraActive ? <Video size={12} /> : <VideoOff size={12} />}
                  </button>
                  <button
                    onClick={toggleMicMute}
                    title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                    style={{
                      padding: "4px 8px", borderRadius: 6, background: micActive ? "rgba(0,0,0,0.6)" : "rgba(239,68,68,0.85)",
                      border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, backdropFilter: "blur(6px)"
                    }}
                  >
                    {micActive ? <Mic size={12} /> : <MicOff size={12} />}
                  </button>
                  <button
                    onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                    title="Open Full Hardware & Voice Settings"
                    style={{
                      padding: "4px 8px", borderRadius: 6, background: "rgba(168,85,247,0.35)", border: "1px solid rgba(168,85,247,0.5)",
                      color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(6px)"
                    }}
                  >
                    <Settings size={12} /> Options
                  </button>
                </div>

                {/* Real-time Voice VU Meter Overlay */}
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.7)", padding: "6px 12px", borderRadius: 6, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mic size={12} style={{ color: !micActive ? "#ef4444" : audioLevel > 15 ? "#4ade80" : "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: 11, color: micActive ? "rgba(255,255,255,0.8)" : "#f87171", fontFamily: "'Geist Mono', monospace" }}>
                      {micActive ? "Candidate Mic" : "Mic Muted"}
                    </span>
                  </div>
                  <div style={{ width: 100, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                    <div style={{ width: micActive ? `${audioLevel}%` : "0%", height: "100%", background: "linear-gradient(90deg, #22c55e, #eab308, #ef4444)", transition: "width 0.05s" }} />
                  </div>
                </div>
              </div>

              {/* In-Studio Hardware Selector Bar */}
              <div style={{
                background: "rgba(18, 10, 30, 0.9)",
                border: "1px solid rgba(168, 85, 247, 0.28)",
                borderRadius: 9,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#d8b4fe", display: "flex", alignItems: "center", gap: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    <Sliders size={12} /> Hardware Input & Output
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={refreshDevices}
                      title="Refresh detected cameras and microphones"
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <RefreshCw size={10} /> Refresh
                    </button>
                    {(!videoDevices[0]?.label || !audioInputDevices[0]?.label) && (
                      <button
                        onClick={requestDevicePermissions}
                        title="Grant permission to reveal exact hardware names"
                        style={{ background: "rgba(168,85,247,0.25)", border: "1px solid rgba(168,85,247,0.4)", borderRadius: 4, padding: "2px 6px", color: "#d8b4fe", fontSize: 10, cursor: "pointer" }}
                      >
                        Detect Names
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {/* Camera Select */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Camera size={11} style={{ color: "#d8b4fe" }} /> Camera
                      </span>
                      <button onClick={toggleCameraMute} style={{ background: "none", border: "none", fontSize: 10, color: cameraActive ? "#4ade80" : "#f87171", cursor: "pointer", fontWeight: 600 }}>
                        {cameraActive ? "On" : "Paused"}
                      </button>
                    </div>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      className="input-dark w-full"
                      style={{ fontSize: 11, height: 32, padding: "2px 6px" }}
                    >
                      {videoDevices.length > 0 ? (
                        videoDevices.map((d, i) => (
                          <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Camera ${i + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="">Default Camera</option>
                      )}
                    </select>
                  </div>

                  {/* Mic Select */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mic size={11} style={{ color: "#f472b6" }} /> Mic Input
                      </span>
                      <button onClick={toggleMicMute} style={{ background: "none", border: "none", fontSize: 10, color: micActive ? "#4ade80" : "#f87171", cursor: "pointer", fontWeight: 600 }}>
                        {micActive ? "Live" : "Muted"}
                      </button>
                    </div>
                    <select
                      value={selectedMicId}
                      onChange={(e) => handleMicChange(e.target.value)}
                      className="input-dark w-full"
                      style={{ fontSize: 11, height: 32, padding: "2px 6px" }}
                    >
                      {audioInputDevices.length > 0 ? (
                        audioInputDevices.map((d, i) => (
                          <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Microphone ${i + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="">Default Microphone</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Speaker Output Select */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Headphones size={11} style={{ color: "#38bdf8" }} /> Speaker / Output
                    </span>
                    <button
                      onClick={() => playSpeakerTestTone()}
                      style={{ background: "none", border: "none", fontSize: 10, color: "#38bdf8", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <Bell size={10} /> Test Chime
                    </button>
                  </div>
                  <select
                    value={selectedSpeakerId}
                    onChange={(e) => handleSpeakerChange(e.target.value)}
                    className="input-dark w-full"
                    style={{ fontSize: 11, height: 32, padding: "2px 6px" }}
                  >
                    {audioOutputDevices.length > 0 ? (
                      audioOutputDevices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                          {d.label || `Audio Output ${i + 1}`}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Speaker / Headphones</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: AI Interviewer Persona Card */}
            <div style={{
              borderRadius: 10, background: "radial-gradient(circle at 50% 30%, #1e1035 0%, #120722 100%)",
              border: "1px solid rgba(168,85,247,0.25)", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>
                      NV
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Principal Interviewer</div>
                      <div style={{ fontSize: 11, color: "#d8b4fe", fontFamily: "'Geist Mono', monospace" }}>
                        🗣️ {activeVoiceObj ? activeVoiceObj.name.replace(/(Microsoft|Google|Apple)\s*/gi, "").slice(0, 18) : "US English"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 12, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", fontSize: 10, color: "#4ade80", fontWeight: 600 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} /> Connected
                  </div>
                </div>

                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
                  I will review your technical depth, architecture tradeoffs, and communication live. Click &quot;Hear Question&quot; to have me read it aloud in natural English, then answer via voice or notes.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => toggleSpeakQuestion()}
                  style={{
                    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    background: isSpeakingQuestion ? "rgba(236,72,153,0.25)" : "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25))",
                    border: `1px solid ${isSpeakingQuestion ? "#ec4899" : "rgba(168,85,247,0.4)"}`,
                    color: "#fff",
                  }}
                >
                  {isSpeakingQuestion ? <><VolumeX size={14} /> Stop Speaking</> : <><Volume2 size={14} /> Hear Question Aloud 🔊</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Header & Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist Mono', monospace", letterSpacing: "0.05em" }}>
              SCENARIO {q.id} OF {questions.length}
            </span>
            <span style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 5, color: "rgba(255,255,255,0.7)", fontFamily: "'Geist Mono', monospace" }}>
              {q.category}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Read aloud button if not in video mode */}
            {!isVideoMode && (
              <button
                onClick={() => toggleSpeakQuestion()}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6,
                  fontSize: 12, color: isSpeakingQuestion ? "#ec4899" : "#d8b4fe",
                  background: isSpeakingQuestion ? "rgba(236,72,153,0.15)" : "rgba(168,85,247,0.12)",
                  border: `1px solid ${isSpeakingQuestion ? "rgba(236,72,153,0.35)" : "rgba(168,85,247,0.3)"}`,
                  cursor: "pointer", fontWeight: 500,
                }}
              >
                {isSpeakingQuestion ? <><VolumeX size={13} /> Stop</> : <><Volume2 size={13} /> Hear Question Aloud 🔊</>}
              </button>
            )}

            {/* Confidence Star rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 4 }}>Confidence</span>
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatings((r) => ({ ...r, [q.id]: s }))}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 1,
                    color: (ratings[q.id] || 0) >= s ? "#fbbf24" : "rgba(255,255,255,0.15)",
                    transition: "color 0.1s",
                  }}
                >
                  <Star size={14} style={{ fill: (ratings[q.id] || 0) >= s ? "#fbbf24" : "none" }} />
                </button>
              ))}
            </div>

            <span style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 5, fontFamily: "'Geist Mono', monospace", fontWeight: 600,
              background: q.difficulty === "Easy" ? "rgba(34,197,94,0.1)" : q.difficulty === "Medium" ? "rgba(168,85,247,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${q.difficulty === "Easy" ? "rgba(34,197,94,0.22)" : q.difficulty === "Medium" ? "rgba(168,85,247,0.22)" : "rgba(239,68,68,0.22)"}`,
              color: q.difficulty === "Easy" ? "#4ade80" : q.difficulty === "Medium" ? "#d8b4fe" : "#f87171",
            }}>
              {q.difficulty}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(168,85,247,0.25)", borderLeft: "4px solid #a855f7", borderRadius: 10, padding: 20
        }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.92)", lineHeight: 1.65 }}>
            {q.question}
          </p>
        </div>

        {/* Spoken Answer & Notes Workspace */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 6 }}>
                Candidate Spoken / Written Response
                {isRecordingVoice && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#f472b6", fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f472b6", animation: "pulse 1s infinite" }} />
                    Listening live…
                  </span>
                )}
              </span>

              {/* Quick Audio Routing Pill */}
              <button
                onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 6,
                  fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)", cursor: "pointer"
                }}
                title="Click to change Microphone or Speaker output"
              >
                <Mic size={10} style={{ color: "#f472b6" }} />
                <span>{audioInputDevices.find((d) => d.deviceId === selectedMicId)?.label?.slice(0, 16) || "Mic"}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <Headphones size={10} style={{ color: "#38bdf8" }} />
                <span>{audioOutputDevices.find((d) => d.deviceId === selectedSpeakerId)?.label?.slice(0, 16) || "Speaker"}</span>
                <Sliders size={10} style={{ opacity: 0.6 }} />
              </button>
            </div>

            <span style={{ fontFamily: "'Geist Mono', monospace" }}>
              {words} words{words > 0 ? ` · ~${(words / 130).toFixed(1)} min spoken` : ""}
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              value={notes[q.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
              placeholder="Speak using the Live Voice button below or type your response: 1. Core architecture & approach  2. Tradeoffs & benchmarks  3. Failure modes & mitigation…"
              className="textarea-dark"
              style={{
                minHeight: 140,
                borderColor: isRecordingVoice ? "rgba(236,72,153,0.5)" : "rgba(255,255,255,0.1)",
                boxShadow: isRecordingVoice ? "0 0 20px rgba(236,72,153,0.15)" : "none",
                transition: "all 0.2s"
              }}
            />

            {/* Interim voice preview ticker */}
            {interimVoiceText && (
              <div style={{
                position: "absolute", left: 14, bottom: 48, right: 120,
                fontSize: 12, color: "#f472b6", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                Transcribing: &ldquo;{interimVoiceText}&rdquo;
              </div>
            )}

            {/* Voice Record Toggle Button */}
            <div style={{ position: "absolute", right: 12, bottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => toggleVoiceRecording(q.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 7,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  background: isRecordingVoice
                    ? "linear-gradient(135deg, #ef4444, #ec4899)"
                    : "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.2))",
                  border: `1px solid ${isRecordingVoice ? "#ef4444" : "rgba(168,85,247,0.4)"}`,
                  color: "#ffffff",
                  boxShadow: isRecordingVoice ? "0 0 16px rgba(239,68,68,0.4)" : "none",
                }}
              >
                {isRecordingVoice ? <><MicOff size={14} /> Stop Voice</> : <><Mic size={14} /> Live Voice Mic</>}
              </button>
            </div>
          </div>
        </div>

        {/* Live Evaluation Button & Evaluation Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => handleEvaluateAnswer(q.id)}
              disabled={isEvaluating || !notes[q.id]?.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8,
                background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: notes[q.id]?.trim() ? "pointer" : "not-allowed",
                opacity: notes[q.id]?.trim() ? 1 : 0.5, boxShadow: "0 6px 20px rgba(147, 51, 234, 0.3)"
              }}
            >
              {isEvaluating ? (
                <><Loader2 size={14} className="animate-spin" /> Evaluating with Nemotron…</>
              ) : (
                <><Sparkles size={14} /> Evaluate My Spoken Answer with Nemotron</>
              )}
            </button>
          </div>

          {/* Render Evaluation Result if available */}
          {currentEval && (
            <div className="anim-fade-in" style={{
              padding: 18, borderRadius: 10, background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.28)",
              display: "flex", flexDirection: "column", gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={18} style={{ color: currentEval.score >= 80 ? "#4ade80" : "#fbbf24" }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
                    AI Bar Raiser Score: {currentEval.score}/100
                  </span>
                </div>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 4, fontFamily: "'Geist Mono', monospace",
                  background: currentEval.score >= 80 ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)",
                  color: currentEval.score >= 80 ? "#4ade80" : "#fbbf24"
                }}>
                  {currentEval.score >= 80 ? "STRONG PASS" : "NEEDS DEPTH"}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, fontStyle: "italic" }}>
                &ldquo;{currentEval.feedback}&rdquo;
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#4ade80", textTransform: "uppercase" }}>
                    Covered Points ({currentEval.coveredPoints?.length || 0})
                  </span>
                  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
                    {(currentEval.coveredPoints || []).map((pt: string, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>✓ {pt}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#f87171", textTransform: "uppercase" }}>
                    Suggested Additions
                  </span>
                  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
                    {(currentEval.recommendations || []).map((rec: string, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>→ {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rubric Accordion */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
          <button
            onClick={() => setRubricShown((r) => ({ ...r, [q.id]: !r[q.id] }))}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#d8b4fe", background: "none", border: "none", cursor: "pointer", fontFamily: "'Geist', sans-serif" }}
          >
            <Code2 size={13} />
            {rubricShown[q.id] ? "Hide rubric" : "Show grading rubric & expected concepts"}
          </button>

          {rubricShown[q.id] && (
            <div className="anim-fade-in" style={{ marginTop: 12, padding: 16, borderRadius: 8, background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "#d8b4fe", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Key concepts to cover
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.sampleAnswerKeyPoints.map((pt, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                      <span style={{ color: "#ec4899", marginTop: 2, flexShrink: 0 }}>→</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {q.rubric && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {q.rubric.tradeoffs?.length > 0 && (
                    <div style={{ padding: 12, borderRadius: 7, background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.14)" }}>
                      <p style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: "#d8b4fe", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>Tradeoffs to mention</p>
                      {q.rubric.tradeoffs.map((t, i) => <p key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 4 }}>• {t}</p>)}
                    </div>
                  )}
                  {q.rubric.pitfalls?.length > 0 && (
                    <div style={{ padding: 12, borderRadius: 7, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)" }}>
                      <p style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: "#f87171", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>Anti-patterns to avoid</p>
                      {q.rubric.pitfalls.map((p, i) => <p key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 4 }}>• {p}</p>)}
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
