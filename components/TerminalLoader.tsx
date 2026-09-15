import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';

const MESSAGES = [
  "Reading resume details...",
  "Reviewing key skills and background...",
  "Comparing with target job requirements...",
  "Calculating match score and key strengths...",
  "Highlighting missing keywords & suggestions...",
  "Preparing your personalized practice interview...",
  "Finalizing your report..."
];

export default function TerminalLoader() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < MESSAGES.length) {
      const timeout = setTimeout(() => {
        setMessages(prev => [...prev, MESSAGES[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 400 + 250);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-5 sm:p-6 rounded-2xl bg-[#0f0918]/80 border border-purple-500/20 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
            Analysing your profile
          </span>
        </div>
        <span className="text-[11px] font-mono text-white/40">
          Step {Math.min(currentIndex + 1, MESSAGES.length)} of {MESSAGES.length}
        </span>
      </div>
      
      <div className="space-y-2.5">
        {messages.map((msg, i) => {
          const isDone = i < messages.length - 1 || currentIndex >= MESSAGES.length;
          return (
            <div key={i} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                </div>
              )}
              <span className={isDone ? "text-white/60" : "text-purple-200 font-medium"}>
                {msg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
