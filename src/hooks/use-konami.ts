import { useEffect, useState } from "react";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a"
];

export function useKonami(onSuccess: () => void) {
  const [seq, setSeq] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setSeq(prev => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.join(",") === KONAMI.join(",")) {
          onSuccess();
          return [];
        }
        return next;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSuccess]);
}
