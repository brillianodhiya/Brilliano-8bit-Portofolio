import { useEffect, useCallback, useState, useRef } from "react";
import { playButtonSound } from "@/lib/audio";

export const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

export const KEY_LABELS: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  b: "B",
  a: "A",
};

export interface KeyPress {
  key: string;
  label: string;
  correct: boolean;
  id: number;
}

let pressIdCounter = 0;

export function useKonamiCode(onSuccess: () => void) {
  const [progress, setProgress] = useState<number>(0);
  const [keyPresses, setKeyPresses] = useState<KeyPress[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const sequenceRef = useRef<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetSequence = useCallback(() => {
    sequenceRef.current = [];
    setProgress(0);
    setTimeout(() => setIsActive(false), 1500);
  }, []);

  const addKeyPress = useCallback((key: string, correct: boolean) => {
    const label = KEY_LABELS[key] || key.toUpperCase();
    const press: KeyPress = { key, label, correct, id: pressIdCounter++ };
    setKeyPresses(prev => [...prev.slice(-12), press]);

    setTimeout(() => {
      setKeyPresses(prev => prev.filter(p => p.id !== press.id));
    }, 2000);
  }, []);

  // Core processing function — used by both keyboard and virtual controller
  const processKey = useCallback((key: string) => {
    setIsActive(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      resetSequence();
    }, 5000);

    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    const expectedKey = KONAMI_CODE[sequenceRef.current.length];

    if (normalizedKey === expectedKey) {
      sequenceRef.current.push(normalizedKey);
      setProgress(sequenceRef.current.length);
      addKeyPress(normalizedKey, true);

      if (sequenceRef.current.length === KONAMI_CODE.length) {
        onSuccess();
        sequenceRef.current = [];
        setProgress(0);
        setTimeout(() => {
          setIsActive(false);
          setKeyPresses([]);
        }, 500);
      }
    } else {
      addKeyPress(normalizedKey, false);
      resetSequence();
    }
  }, [onSuccess, resetSequence, addKeyPress]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isKonamiKey = KONAMI_CODE.includes(e.key) || KONAMI_CODE.includes(e.key.toLowerCase());
      if (!isKonamiKey) return;

      playButtonSound();
      processKey(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [processKey]);

  return { progress, total: KONAMI_CODE.length, keyPresses, isActive, processKey };
}
