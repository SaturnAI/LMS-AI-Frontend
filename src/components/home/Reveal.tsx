"use client";

/** Fades + slides a section in once it scrolls into view. No-ops under prefers-reduced-motion. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DELAY_CLASSES = { 0: "", 150: "delay-150", 300: "delay-300", 500: "delay-500" } as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger step for grids of Reveal siblings. */
  delayMs?: keyof typeof DELAY_CLASSES;
}

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        !visible && "opacity-0",
        visible && ["animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700", DELAY_CLASSES[delayMs]],
        className,
      )}
    >
      {children}
    </div>
  );
}
