import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Define la interfaz de retorno del hook para una mejor legibilidad.
interface UseTypingRotatorReturn {
  currentText: string;
  isTyping: boolean;
  isErasing: boolean;
  isPaused: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Hook para gestionar un efecto de texto rotativo con animación de escritura y borrado.
 * @param texts - Array de strings a rotar.
 * @param typingSpeed - Velocidad de escritura en milisegundos.
 * @param erasingSpeed - Velocidad de borrado en milisegundos.
 * @param pauseDuration - Duración de la pausa entre textos en milisegundos.
 * @returns Un objeto con el estado actual del texto y funciones de control.
 */
export function useTypingRotator(
  texts: string[],
  typingSpeed: number = 100,
  erasingSpeed: number = 50,
  pauseDuration: number = 2000
): UseTypingRotatorReturn {
  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  // Usamos useRef para mantener el identificador del temporizador sin causar re-renders.
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generamos una cola de textos de forma aleatoria sin repetición, memorizando el resultado.
  const randomQueue = useMemo(() => {
    // Si no hay textos, devolvemos un array vacío.
    if (!texts || texts.length === 0) return [];

    // Evitamos que el mismo elemento se repita consecutivamente
    // al generar una cola aleatoria.
    let shuffled = [...texts].sort(() => Math.random() - 0.5);
    while (shuffled.length > 1 && shuffled[0] === texts[0]) {
      shuffled = [...texts].sort(() => Math.random() - 0.5);
    }
    return shuffled;
  }, [texts]);

  // Funciones de control expuestas por el hook.
  const start = useCallback(() => setIsRotating(true), []);
  const stop = useCallback(() => setIsRotating(false), []);
  const reset = useCallback(() => {
    stop();
    setTextIndex(0);
    setCurrentText('');
    setIsTyping(true);
    start();
  }, [stop, start]);

  const isErasing = !isTyping && currentText.length > 0;
  const isPaused = !isTyping && currentText.length === randomQueue[textIndex]?.length;

  useEffect(() => {
    if (!isRotating || randomQueue.length === 0) return;

    const fullText = randomQueue[textIndex];

    const handleTyping = () => {
      if (currentText.length < fullText.length) {
        setCurrentText(prev => fullText.slice(0, prev.length + 1));
      } else {
        setIsTyping(false);
        timeoutRef.current = setTimeout(() => setIsTyping(false), pauseDuration);
      }
    };

    const handleErasing = () => {
      if (currentText.length > 0) {
        setCurrentText(prev => prev.slice(0, -1));
      } else {
        setIsTyping(true);
        setTextIndex(prev => (prev + 1) % randomQueue.length);
      }
    };

    // Limpiamos el temporizador existente antes de establecer uno nuevo.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timeoutSpeed = isTyping ? typingSpeed : erasingSpeed;

    // No establecemos un nuevo temporizador si estamos en pausa.
    if (!isPaused) {
      timeoutRef.current = setTimeout(isTyping ? handleTyping : handleErasing, timeoutSpeed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    currentText,
    isRotating,
    textIndex,
    isTyping,
    randomQueue,
    typingSpeed,
    erasingSpeed,
    pauseDuration,
  ]);

  return {
    currentText,
    isTyping,
    isErasing,
    isPaused,
    start,
    stop,
    reset,
  };
}
