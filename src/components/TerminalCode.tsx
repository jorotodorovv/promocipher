import React, { useEffect, useMemo, useRef, useState } from 'react';

interface TerminalCodeProps {
  className?: string;
}

const PROGRESS_MARK = "__PROGRESS__";
const LINES: string[] = [
  "vault init --workspace personal",
  "load keyring… ok",
  "derive key: Argon2id(salt=16B, mem=64MiB, t=3) ✓",
  "unlock client key ✓",
  "nonces[24B]: unique per record (e.g. 7f2a9c3e1b4d2a90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6)",
  "aad bound: user_id,key_id,code_id ✓",
  "encrypt xchacha20-poly1305 — 128 records",
  PROGRESS_MARK,
  "tag[16B]: 9a8b7c6d5e4f3a2b1c0dffeeddccbbaa",
  "done: promo.codes.enc (2.4 KB, 128 records, 0.12s)",
];

const TerminalCode: React.FC<TerminalCodeProps> = ({ className = "" }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  
  const typingSpeed = prefersReducedMotion ? 80 : 28;
  const linePause = prefersReducedMotion ? 420 : 180;
  const loopPause = prefersReducedMotion ? 1400 : 1000;

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (currentLine >= LINES.length) {
      timeoutRef.current = window.setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setProgress(0);
      }, loopPause);
      return cleanup;
    }

    cleanup();

    const currentLineText = LINES[currentLine];

    if (currentLineText === PROGRESS_MARK) {
      setProgress(0);
      const progressStep = prefersReducedMotion ? 5 : 3;
      const progressInterval = prefersReducedMotion ? 120 : 70;
      
      intervalRef.current = window.setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            cleanup();
            timeoutRef.current = window.setTimeout(() => {
              setCurrentLine((prev) => prev + 1);
              setCurrentChar(0);
            }, linePause);
            return 100;
          }
          return Math.min(100, prevProgress + progressStep);
        });
      }, progressInterval);

      return cleanup;
    }

    intervalRef.current = window.setInterval(() => {
      setCurrentChar((prevChar) => {
        if (prevChar < currentLineText.length) {
          return prevChar + 1;
        }

        cleanup();
        timeoutRef.current = window.setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
          setCurrentChar(0);
        }, linePause);
        return prevChar;
      });
    }, typingSpeed);

    return cleanup;
  }, [currentLine, prefersReducedMotion, typingSpeed, linePause, loopPause]);

  const renderedLines = LINES.slice(0, Math.min(currentLine, LINES.length));
  const isProgressLine = currentLine < LINES.length && LINES[currentLine] === PROGRESS_MARK;
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const barLength = 12;
  const filled = Math.round((safeProgress / 100) * barLength);
  const progressBar = "#".repeat(filled).padEnd(barLength, ".");
  const chunk = Math.min(4, Math.max(1, Math.floor(safeProgress / 25) + 1));
  const progressLine = `chunk ${chunk}/4 (640B)  [${progressBar}] ${safeProgress}%`;
  
  const currentDisplayLine = currentLine < LINES.length 
    ? (isProgressLine ? progressLine : LINES[currentLine].slice(0, currentChar)) 
    : "";

  return (
    <div className={`relative rounded-lg border-2 border-primary-bright/70 bg-neutral-dark/90 backdrop-blur-md shadow-hover-dark ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-bright/10 via-transparent to-accent-success/10 rounded-lg" />
      
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-dark/80 border-b border-primary-bright/30 rounded-t-lg">
        <div className="w-3 h-3 rounded-full bg-accent-error/80" />
        <div className="w-3 h-3 rounded-full bg-accent-warning/80" />
        <div className="w-3 h-3 rounded-full bg-accent-success/80" />
        <span className="ml-3 font-code text-small text-neutral-medium">
          terminal • promocipher
        </span>
      </div>
      
      {/* Terminal Content */}
      <div className="p-6 h-64 md:h-80 overflow-hidden">
        <pre className="font-code text-small leading-relaxed text-white/90 whitespace-pre">
          {renderedLines.map((line, index) => (
            <div key={index} className="mb-1">
              <span className="text-primary-bright">{">"}</span>
              <span className="ml-2">{line}</span>
            </div>
          ))}
          <div className="mb-1">
            <span className="text-accent-success">{">"}</span>
            <span className="ml-2 text-white/95">{currentDisplayLine}</span>
            <span className="inline-block w-2 h-4 bg-primary-bright ml-1 animate-pulse" />
          </div>
        </pre>
      </div>
    </div>
  );
};

export default TerminalCode;