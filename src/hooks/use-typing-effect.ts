import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speed: number = 50, delay: number = 0) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    let i = 0;
    let timeout: NodeJS.Timeout;
    
    const startTyping = () => {
      timeout = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(timeout);
          setIsComplete(true);
        }
      }, speed);
    };

    if (delay > 0) {
      const delayTimeout = setTimeout(startTyping, delay);
      return () => {
        clearTimeout(delayTimeout);
        clearInterval(timeout);
      };
    } else {
      startTyping();
      return () => clearInterval(timeout);
    }
  }, [text, speed, delay]);

  return { displayedText, isComplete };
}
