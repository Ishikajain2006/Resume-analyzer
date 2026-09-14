import { useEffect, useState } from 'react';

const MESSAGES = [
  "Initializing NVIDIA Nemotron-340B inference engine...",
  "Extracting raw byte stream from candidate profile...",
  "Normalizing UTF-8 characters and parsing layout...",
  "Mapping unstructured text to semantic taxonomy...",
  "Benchmarking against target job specification...",
  "Computing multidimensional ATS alignment score...",
  "Generating targeted interview gap questions...",
  "Finalizing diagnostic report..."
];

export default function TerminalLoader() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < MESSAGES.length) {
      const timeout = setTimeout(() => {
        setMessages(prev => [...prev, MESSAGES[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 600 + 300); // 300-900ms per step
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="w-full min-h-[500px] flex flex-col p-6 font-mono text-sm shadow-[0_0_40px_rgba(132,0,255,0.15)]" style={{ background: '#0c0714', borderRadius: 20, border: '1px solid rgba(168,85,247,0.2)' }}>
      <div className="flex items-center gap-2 mb-6 border-b border-purple-500/20 pb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-purple-400/50 text-xs ml-3 font-semibold tracking-wider">nemotron_inference_stream</span>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-4 text-purple-200">
            <span className="text-purple-500 shrink-0 font-bold">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
            <span className="opacity-90">{msg}</span>
          </div>
        ))}
        {currentIndex < MESSAGES.length && (
          <div className="flex items-start gap-4 text-purple-400 animate-pulse">
            <span className="text-purple-500 shrink-0 font-bold">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
            <span className="opacity-100">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
