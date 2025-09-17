import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import {
  runCommand,
  getAutocompleteSuggestions,
} from '@/components/layout/Sections/ProfileHero/components/Widgets/Terminal/commands';
import type { CommandResult } from '@/components/layout/Sections/ProfileHero/components/Widgets/Terminal/commands';
import { useUnifiedTheme } from '@/contexts';
import {
  TerminalTranslationProvider,
  useTerminalTranslations,
} from './context/TerminalTranslationContext';
import './terminal.css';
import SafeHtml from '@/components/common/SafeHtml/SafeHtml';

interface HistoryEntry {
  command: string;
  output: string[];
  timestamp: number;
}

const InteractiveTerminalContent: React.FC = () => {
  // Obtener traducciones específicas del terminal
  const { t, currentLanguage } = useTerminalTranslations();

  // Obtener tema actual para efectos dramáticos
  const { currentGlobalTheme, toggleGlobalTheme } = useUnifiedTheme();

  // Estados principales
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Estados para autocompletado
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  // Estados para efectos typewriter
  const [typewriterQueue, setTypewriterQueue] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typewriterActive, setTypewriterActive] = useState(false);
  const [specialEffect, setSpecialEffect] = useState<'normal' | 'hack' | 'glitch' | 'undertale'>(
    'normal'
  );
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);

  // Estados para efectos de terremoto/hack
  const [earthquakeActive, setEarthquakeActive] = useState(false);
  const [hackIntensity, setHackIntensity] = useState(0); // 0-3 niveles de intensidad (usado para efectos CSS)
  const [originalThemeBeforeHack, setOriginalThemeBeforeHack] = useState<string | null>(null); // Guardar tema original

  // Referencias
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const mountedRef = useRef(true);

  // Función para crear sonidos de tecleo con variedad (incluyendo estilo Undertale)
  const playKeySound = (
    type: 'key' | 'enter' | 'tab' | 'arrow' | 'typewriter' | 'hack' | 'undertale' = 'key'
  ) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return; // Audio not supported
      }
    }

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Diferentes sonidos según el tipo de tecla
      let frequency = 800;
      let duration = 0.1;
      let volume = 0.05;
      let waveType: OscillatorType = 'square';

      switch (type) {
        case 'enter':
          frequency = 600;
          duration = 0.15;
          volume = 0.08;
          break;
        case 'tab':
          frequency = 1000;
          duration = 0.12;
          volume = 0.06;
          break;
        case 'arrow':
          frequency = 900;
          duration = 0.08;
          volume = 0.04;
          break;
        case 'typewriter':
          // Sonido más suave para el typewriter carácter por carácter
          frequency = 600 + Math.random() * 300;
          duration = 0.05;
          volume = 0.03;
          waveType = 'sine';
          break;
        case 'hack':
          // Sonido más agresivo para el comando hack
          frequency = 400 + Math.random() * 800;
          duration = 0.08;
          volume = 0.06;
          waveType = 'sawtooth';
          break;
        case 'undertale':
          // Sonido estilo Undertale - más musical
          const notes = [440, 493.88, 523.25, 587.33, 659.25]; // A, B, C, D, E
          frequency = notes[Math.floor(Math.random() * notes.length)];
          duration = 0.1;
          volume = 0.04;
          waveType = 'triangle';
          break;
        default:
          frequency = 800 + Math.random() * 200; // Variedad para teclas normales
      }

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = waveType;

      // Configurar volumen y envolvente
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // CRÍTICO: Registrar oscilador para poder cancelarlo con stopAllSounds()
      activeOscillatorsRef.current.push(oscillator);
      // Al terminar, quitar la referencia para permitir GC
      try {
        // @ts-ignore - algunos navegadores no exponen onended en todos los tipos
        oscillator.onended = () => {
          activeOscillatorsRef.current = activeOscillatorsRef.current.filter(o => o !== oscillator);
          try {
            oscillator.disconnect();
          } catch (e) {
            // ignore
          }
        };
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  };

  // Función para hacer scroll suave hacia abajo con delay inteligente
  const scrollToBottom = (delay: number = 0, force: boolean = false) => {
    const scrollTimeout = setTimeout(() => {
      if (outputRef.current && (!userScrolling || force)) {
        const element = outputRef.current;
        const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 50;

        // Solo hacer scroll automático si está cerca del final o es forzado
        if (isNearBottom || force) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: delay > 0 ? 'smooth' : 'auto', // Auto para scroll rápido durante typewriter
          });
        }
      }
    }, delay);
    activeTimeoutsRef.current.push(scrollTimeout);
  };

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeEntry: HistoryEntry = {
      command: '',
      output: [
        t.ui.title,
        '',
        t.ui.welcome,
        t.ui.description,
        '',
        t.ui.tipsHeader,
        `  ${t.ui.tipHelp}`,
        `  ${t.ui.tipTab}`,
        `  ${t.ui.tipClear}`,
        `  ${t.ui.tipExplore}`,
        `  ${t.ui.tipEasterEggs}`,
        '',
        t.ui.footer,
      ],
      timestamp: Date.now(),
    };

    setHistory([welcomeEntry]);
  }, [t]); // Dependencia de traducciones para actualizar cuando cambie el idioma

  // Auto scroll al final cuando cambia el historial
  useEffect(() => {
    scrollToBottom(0, true); // Forzar scroll al cambiar historial
  }, [history]);

  // Detectar scroll manual del usuario
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!outputRef.current) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          const element = outputRef.current!;
          const isNearBottom =
            element.scrollTop + element.clientHeight >= element.scrollHeight - 50;
          setUserScrolling(!isNearBottom);
        } finally {
          ticking = false;
        }
      });
    };

    const outputElement = outputRef.current;
    if (outputElement) {
      outputElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => outputElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Efecto typewriter carácter por carácter estilo Undertale
  useEffect(() => {
    if (typewriterQueue.length > 0 && !typewriterActive) {
      setTypewriterActive(true);
      setCurrentLineIndex(0);
      setCurrentLine('');

      let currentLine = 0;
      let currentChar = 0;

      const processNextChar = () => {
        if (currentLine >= typewriterQueue.length) {
          // Todas las líneas completadas
          setTypewriterActive(false);
          const completedEntry = {
            command: '',
            output: typewriterQueue,
            timestamp: Date.now(),
          };
          setHistory(prev => [...prev, completedEntry]);
          setTypewriterQueue([]);
          setSpecialEffect('normal');

          // Refocus del input cuando termine el typewriter
          const refocusTimeout = setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 100);
          activeTimeoutsRef.current.push(refocusTimeout);

          scrollToBottom(100, true); // Forzar scroll al completar
          return;
        }

        const currentLineText = typewriterQueue[currentLine] || '';

        if (currentChar < currentLineText.length) {
          // Agregar el siguiente carácter
          const nextChar = currentLineText[currentChar];
          setCurrentLine(prev => prev + nextChar);

          // Reproducir sonido según el efecto especial
          const soundType =
            specialEffect === 'undertale'
              ? 'undertale'
              : specialEffect === 'hack'
                ? 'hack'
                : 'typewriter';
          playKeySound(soundType);

          // Efectos adicionales para hack
          if (specialEffect === 'hack') {
            // Sonidos de terremoto ocasionales durante el hack
            if (Math.random() < 0.15) {
              // 15% de probabilidad por carácter
              const randomTimeout = setTimeout(() => playEarthquakeSound(1), Math.random() * 100);
              activeTimeoutsRef.current.push(randomTimeout);
            }
            // Sonidos dramáticos en líneas específicas
            if (currentLine === 2 || currentLine === 5 || currentLine === 8) {
              if (currentChar === Math.floor(currentLineText.length * 0.7)) {
                const dramaticTimeout = setTimeout(() => playEarthquakeSound(3), 50);
                activeTimeoutsRef.current.push(dramaticTimeout);
              }
            }
          }

          // Hacer scroll mientras se va escribiendo
          scrollToBottom(0);

          currentChar++;

          // Continuar con el siguiente carácter
          const delay =
            specialEffect === 'undertale'
              ? 60 + Math.random() * 40 // 60-100ms para Undertale
              : specialEffect === 'hack'
                ? 30 + Math.random() * 20 // 30-50ms para hack
                : 15 + Math.random() * 15; // 15-30ms para comandos normales (más rápido)

          const nextCharTimeout = setTimeout(processNextChar, delay);
          activeTimeoutsRef.current.push(nextCharTimeout);
        } else {
          // Línea completada, pasar a la siguiente
          currentLine++;
          currentChar = 0;
          setCurrentLineIndex(currentLine);
          setCurrentLine('');

          // Hacer scroll al completar cada línea
          scrollToBottom(0);

          if (currentLine < typewriterQueue.length) {
            const lineTimeout = setTimeout(processNextChar, 200); // Pausa entre líneas
            activeTimeoutsRef.current.push(lineTimeout);
          } else {
            // Todas las líneas completadas
            setTypewriterActive(false);
            const completedEntry = {
              command: '',
              output: typewriterQueue,
              timestamp: Date.now(),
            };
            setHistory(prev => [...prev, completedEntry]);
            setTypewriterQueue([]);

            // Manejo especial del final del hack
            if (specialEffect === 'hack') {
              // Restaurar tema gradualmente después del hack
              const restoreTimeout = setTimeout(() => {
                // Verificar si el tema fue cambiado durante el hack
                const originalTheme = localStorage.getItem('hack-original-theme');
                if (originalTheme && currentGlobalTheme === 'dark') {
                  // Sonido de "sistema restaurado"
                  if (audioContextRef.current) {
                    const ctx = audioContextRef.current;
                    const restoreOsc = ctx.createOscillator();
                    const restoreGain = ctx.createGain();

                    restoreOsc.connect(restoreGain);
                    restoreGain.connect(ctx.destination);

                    restoreOsc.frequency.setValueAtTime(600, ctx.currentTime);
                    restoreOsc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
                    restoreOsc.type = 'sine';

                    restoreGain.gain.setValueAtTime(0.03, ctx.currentTime);
                    restoreGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

                    restoreOsc.start(ctx.currentTime);
                    restoreOsc.stop(ctx.currentTime + 0.4);

                    // CRÍTICO: Registrar oscilador para poder cancelarlo
                    activeOscillatorsRef.current.push(restoreOsc);
                  }

                  // Restaurar tema después del sonido
                  const restoreThemeTimeout = setTimeout(() => {
                    toggleGlobalTheme();
                    // Limpiar el indicador de tema original
                    localStorage.removeItem('hack-original-theme');
                  }, 500);
                  activeTimeoutsRef.current.push(restoreThemeTimeout);
                } else {
                  // Limpiar el indicador sin cambiar tema
                  localStorage.removeItem('hack-original-theme');
                }
              }, 2000); // Esperar 2 segundos después de completar el hack
              // CRÍTICO: Registrar timeout para poder cancelarlo
              activeTimeoutsRef.current.push(restoreTimeout);
            }

            setSpecialEffect('normal');
            // Desactivar efectos de terremoto gradualmente
            const earthquakeTimeout = setTimeout(
              () => {
                setEarthquakeActive(false);
                setHackIntensity(0);
              },
              specialEffect === 'hack' ? 1000 : 0
            ); // Delay solo para hack
            activeTimeoutsRef.current.push(earthquakeTimeout);

            // Refocus del input cuando termine el typewriter
            const finalRefocusTimeout = setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 100);
            activeTimeoutsRef.current.push(finalRefocusTimeout);

            scrollToBottom(100, true); // Forzar scroll al completar
          }
        }
      };

      processNextChar();
    }
  }, [typewriterQueue]); // Solo depende de typewriterQueue

  // Efecto typewriter fallback eliminado - ahora todo usa caracter por caracter

  // Enfocar el input cuando se monta el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Manejar entrada de comandos
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        playKeySound('enter'); // Sonido especial al presionar Enter
        executeCommand();
        break;

      case 'Tab':
        e.preventDefault();
        playKeySound('tab'); // Sonido especial al presionar Tab
        handleTabCompletion();
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showAutocomplete) {
          navigateAutocomplete(-1);
        } else {
          playKeySound('arrow'); // Sonido especial al navegar historial
          navigateHistory(-1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showAutocomplete) {
          navigateAutocomplete(1);
        } else {
          playKeySound('arrow'); // Sonido especial al navegar historial
          navigateHistory(1);
        }
        break;

      case 'Escape':
        setShowAutocomplete(false);
        break;
    }
  };

  // Ejecutar comando con efecto typewriter
  const executeCommand = () => {
    const inputValue = currentInput.trim();

    // DETENER TODOS LOS SONIDOS al ejecutar cualquier comando nuevo
    stopAllSounds();

    if (inputValue === '') {
      // Enter sin comando, solo agregar línea vacía
      const emptyEntry: HistoryEntry = {
        command: '',
        output: [''],
        timestamp: Date.now(),
      };
      setHistory(prev => [...prev, emptyEntry]);
      scrollToBottom(0, true);
      return;
    }

    // MANEJO ESPECIAL DEL COMANDO CLEAR - Reset completo inmediato
    if (inputValue.toLowerCase() === 'clear') {
      // Limpiar input inmediatamente
      setCurrentInput('');
      setHistoryIndex(-1);
      setShowAutocomplete(false);

      // Agregar comando al historial si no es repetido
      if (commandHistory[commandHistory.length - 1] !== inputValue) {
        setCommandHistory(prev => [...prev, inputValue]);
      }

      // Llamar directamente a clearTerminal para reset completo sin efectos
      clearTerminal();
      return;
    }

    // Mostrar indicador de "escribiendo..."
    setShowTypingIndicator(true);

    // Simular un pequeño delay para el procesamiento
    const processingTimeout = setTimeout(
      async () => {
        try {
          // Ejecutar comando (ahora async)
          const result: CommandResult = await runCommand(inputValue, currentLanguage);

          // Si el componente ya fue desmontado, cancelar cualquier actualización
          if (!mountedRef.current) return;

          // Detectar comandos especiales para efectos
          if (inputValue.toLowerCase() === 'hack') {
            setSpecialEffect('hack');
            setEarthquakeActive(true);
            setHackIntensity(3); // Máxima intensidad para hack

            // Activar tema hack personalizado
            activateHackTheme();

            // Reproducir sonido dramático de inicio de hack (incluye efectos de terremoto)
            playHackStartSound();
          } else if (inputValue.toLowerCase() === 'undertale') {
            setSpecialEffect('undertale');
            setEarthquakeActive(false);
            setHackIntensity(0);
          } else if (inputValue.toLowerCase().includes('matrix')) {
            setSpecialEffect('undertale'); // Usar efecto undertale para matrix también
            setEarthquakeActive(false);
            setHackIntensity(0);
          } else {
            setSpecialEffect('normal');
            setEarthquakeActive(false);
            setHackIntensity(0);
          }

          // Crear entrada del historial con solo el comando
          const commandOnlyEntry: HistoryEntry = {
            command: inputValue,
            output: [],
            timestamp: Date.now(),
          };

          // Actualizar estados - solo agregar el comando sin output
          if (result.clearScreen) {
            setHistory([commandOnlyEntry]);
          } else {
            setHistory(prev => [...prev, commandOnlyEntry]);
          }

          // TODOS los comandos usan typewriter caracter por caracter
          setTypewriterQueue(result.output);

          // Ocultar indicador de escribiendo
          setShowTypingIndicator(false);

          // Agregar al historial de comandos si no está vacío y no es repetido
          if (inputValue && commandHistory[commandHistory.length - 1] !== inputValue) {
            setCommandHistory(prev => [...prev, inputValue]);
          }

          // Limpiar input y estados
          setCurrentInput('');
          setHistoryIndex(-1);
          setShowAutocomplete(false);

          // El scroll se manejará cuando termine el typewriter
        } catch (error) {
          console.error('Error ejecutando comando:', error);
          // En caso de error, mostrar mensaje al usuario
          const errorResult: CommandResult = {
            output: ['Error: No se pudo ejecutar el comando. Inténtalo de nuevo.'],
          };

          const commandOnlyEntry: HistoryEntry = {
            command: inputValue,
            output: [],
            timestamp: Date.now(),
          };

          setHistory(prev => [...prev, commandOnlyEntry]);
          setTypewriterQueue(errorResult.output);
          setShowTypingIndicator(false);
          setCurrentInput('');
          setHistoryIndex(-1);
          setShowAutocomplete(false);
        }
      },
      100 + Math.random() * 200
    ); // Delay aleatorio entre 100-300ms
    activeTimeoutsRef.current.push(processingTimeout);
  };

  // Manejar autocompletado con Tab
  const handleTabCompletion = () => {
    if (currentInput.trim() === '') return;

    const suggestions = getAutocompleteSuggestions(currentInput);

    if (suggestions.length === 1) {
      // Solo una opción, completar automáticamente
      setCurrentInput(suggestions[0] + ' ');
      setShowAutocomplete(false);
    } else if (suggestions.length > 1) {
      // Múltiples opciones, mostrar lista
      setAutocompleteOptions(suggestions);
      setSelectedSuggestion(0);
      setShowAutocomplete(true);
    }
  };

  // Navegar por el historial de comandos
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;

    const newIndex = historyIndex + direction;

    if (newIndex >= -1 && newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);

      if (newIndex === -1) {
        setCurrentInput('');
      } else {
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }
  };

  // Navegar por opciones de autocompletado
  const navigateAutocomplete = (direction: number) => {
    if (!showAutocomplete || autocompleteOptions.length === 0) return;

    const newIndex = selectedSuggestion + direction;

    if (newIndex >= 0 && newIndex < autocompleteOptions.length) {
      setSelectedSuggestion(newIndex);
    }
  };

  // Seleccionar sugerencia de autocompletado
  const selectSuggestion = (suggestion: string) => {
    setCurrentInput(suggestion + ' ');
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  // Limpiar terminal de forma silenciosa (sin sonidos ni efectos) - RESET COMPLETO
  const clearTerminal = () => {
    // DETENER TODOS LOS SONIDOS inmediatamente
    stopAllSounds();

    // DETENER TYPEWRITER inmediatamente sin efectos de finalización
    setTypewriterActive(false);
    setTypewriterQueue([]);
    setCurrentLine('');
    setCurrentLineIndex(0);
    setShowTypingIndicator(false);

    // Crear mensaje de bienvenida para restaurar después del clear
    const welcomeEntry: HistoryEntry = {
      command: '',
      output: [
        t.ui.title,
        '',
        t.ui.welcome,
        t.ui.description,
        '',
        t.ui.tipsHeader,
        `  ${t.ui.tipHelp}`,
        `  ${t.ui.tipTab}`,
        `  ${t.ui.tipClear}`,
        `  ${t.ui.tipExplore}`,
        `  ${t.ui.tipEasterEggs}`,
        '',
        t.ui.footer,
        '',
      ],
      timestamp: Date.now(),
    };

    // Restaurar estado visual inicial completamente sin sonidos
    setHistory([welcomeEntry]); // Restaurar con mensaje de bienvenida
    setCurrentInput('');
    setCommandHistory([]);
    setHistoryIndex(-1);
    setShowAutocomplete(false);
    setSpecialEffect('normal');
    setUserScrolling(false);

    // Resetear TODOS los efectos de terremoto/hack sin sonido
    setEarthquakeActive(false);
    setHackIntensity(0);

    // Restaurar tema original INMEDIATAMENTE si fue cambiado durante hack (sin delays ni sonidos)
    const originalTheme = localStorage.getItem('hack-original-theme');
    if (originalTheme && currentGlobalTheme === 'dark') {
      // Limpiar el indicador ya que solo usamos modo oscuro
      localStorage.removeItem('hack-original-theme');
    } else {
      // Limpiar el indicador sin cambiar tema
      localStorage.removeItem('hack-original-theme');
    }

    // Refocus inmediato del input
    const clearRefocusTimeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50); // Delay mínimo solo para asegurar que el DOM se actualice
    activeTimeoutsRef.current.push(clearRefocusTimeout);

    scrollToBottom(0, true);
  };

  // Manejar cambios en el input con sonidos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevLength = currentInput.length;
    const newLength = value.length;

    // Solo reproducir sonido si se agregó un carácter (no al borrar)
    if (newLength > prevLength) {
      playKeySound();
    }

    setCurrentInput(value);

    // Actualizar autocompletado en tiempo real
    if (value.trim()) {
      const suggestions = getAutocompleteSuggestions(value.trim());
      if (suggestions.length > 1) {
        setAutocompleteOptions(suggestions);
        setSelectedSuggestion(0);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Función para sonidos dramáticos de terremoto/explosión durante hack
  const playEarthquakeSound = (intensity: number = 1) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return;
      }
    }

    try {
      const ctx = audioContextRef.current;

      // Crear múltiples osciladores para un sonido más complejo
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];

      // Sonido base grave (rumble/terremoto)
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Frecuencias graves para efecto de terremoto
        const baseFreq = 60 + i * 30 + Math.random() * 40;
        oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        oscillator.type = 'sawtooth';

        // Volumen según intensidad
        const volume = (0.03 + intensity * 0.02) * (1 - i * 0.3);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);

        // Registrar oscilador para poder cancelarlo
        activeOscillatorsRef.current.push(oscillator);
        try {
          // @ts-ignore
          oscillator.onended = () => {
            activeOscillatorsRef.current = activeOscillatorsRef.current.filter(
              o => o !== oscillator
            );
            try {
              oscillator.disconnect();
            } catch (e) {}
          };
        } catch (e) {}
        oscillators.push(oscillator);
        gainNodes.push(gainNode);
      }

      // Sonido de "explosión" o "impacto" para el efecto hack
      if (intensity >= 2) {
        const impactTimeout = setTimeout(() => {
          const impactOscillator = ctx.createOscillator();
          const impactGain = ctx.createGain();

          impactOscillator.connect(impactGain);
          impactGain.connect(ctx.destination);

          // Frecuencia más alta para "crack" o "explosion"
          impactOscillator.frequency.setValueAtTime(200, ctx.currentTime);
          impactOscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
          impactOscillator.type = 'square';

          impactGain.gain.setValueAtTime(0.08, ctx.currentTime);
          impactGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          impactOscillator.start(ctx.currentTime);
          impactOscillator.stop(ctx.currentTime + 0.15);

          // Registrar oscilador para poder cancelarlo
          activeOscillatorsRef.current.push(impactOscillator);
          try {
            impactOscillator.onended = () => {
              activeOscillatorsRef.current = activeOscillatorsRef.current.filter(
                o => o !== impactOscillator
              );
              try {
                impactOscillator.disconnect();
              } catch (e) {}
            };
          } catch (e) {}
        }, 50);

        // Registrar timeout para poder cancelarlo
        activeTimeoutsRef.current.push(impactTimeout);
      }

      // Sonido metálico/glitch para intensidad máxima
      if (intensity >= 3) {
        const glitchTimeout = setTimeout(() => {
          const glitchOscillator = ctx.createOscillator();
          const glitchGain = ctx.createGain();

          glitchOscillator.connect(glitchGain);
          glitchGain.connect(ctx.destination);

          // Frecuencia alta con modulación para efecto glitch
          const freq = 800 + Math.random() * 1200;
          glitchOscillator.frequency.setValueAtTime(freq, ctx.currentTime);
          glitchOscillator.type = Math.random() > 0.5 ? 'sawtooth' : 'square';

          glitchGain.gain.setValueAtTime(0.04, ctx.currentTime);
          glitchGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

          glitchOscillator.start(ctx.currentTime);
          glitchOscillator.stop(ctx.currentTime + 0.08);

          // Registrar oscilador para poder cancelarlo
          activeOscillatorsRef.current.push(glitchOscillator);
          try {
            glitchOscillator.onended = () => {
              activeOscillatorsRef.current = activeOscillatorsRef.current.filter(
                o => o !== glitchOscillator
              );
              try {
                glitchOscillator.disconnect();
              } catch (e) {}
            };
          } catch (e) {}
        }, 120);

        // Registrar timeout para poder cancelarlo
        activeTimeoutsRef.current.push(glitchTimeout);
      }
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  };

  // Función para sonido de inicio de hack (más dramático con efectos de tema)
  const playHackStartSound = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return;
      }
    }

    try {
      const ctx = audioContextRef.current;

      // Sonido de "alerta de sistema" - más intenso en modo oscuro
      const alarmIntensity = currentGlobalTheme === 'dark' ? 1.2 : 1.0;
      const alarmTimeout = setTimeout(() => {
        const alarmOsc = ctx.createOscillator();
        const alarmGain = ctx.createGain();

        alarmOsc.connect(alarmGain);
        alarmGain.connect(ctx.destination);

        // Frecuencia alta pulsante para alarma - más grave en modo oscuro
        const baseFreq = currentGlobalTheme === 'dark' ? 800 : 1000;
        alarmOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        alarmOsc.frequency.setValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.1);
        alarmOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime + 0.2);
        alarmOsc.type = 'square';

        alarmGain.gain.setValueAtTime(0.06 * alarmIntensity, ctx.currentTime);
        alarmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        alarmOsc.start(ctx.currentTime);
        alarmOsc.stop(ctx.currentTime + 0.3);

        // Registrar oscilador para poder cancelarlo
        activeOscillatorsRef.current.push(alarmOsc);
        try {
          alarmOsc.onended = () => {
            activeOscillatorsRef.current = activeOscillatorsRef.current.filter(o => o !== alarmOsc);
            try {
              alarmOsc.disconnect();
            } catch (e) {}
          };
        } catch (e) {}
      }, 100);

      // Registrar timeout para poder cancelarlo
      activeTimeoutsRef.current.push(alarmTimeout);

      // Sonido de "sistema comprometido" - más intenso según el tema
      const systemTimeout = setTimeout(() => {
        const intensity = currentGlobalTheme === 'dark' ? 3 : 2;
        playEarthquakeSound(intensity);
      }, 400);

      // Registrar timeout para poder cancelarlo
      activeTimeoutsRef.current.push(systemTimeout);

      // Sonido de "acceso denegado -> acceso concedido"
      const accessTimeout = setTimeout(() => {
        const accessOsc = ctx.createOscillator();
        const accessGain = ctx.createGain();

        accessOsc.connect(accessGain);
        accessGain.connect(ctx.destination);

        // Frecuencia que sube indicando acceso concedido - más dramático en modo oscuro
        const startFreq = currentGlobalTheme === 'dark' ? 250 : 300;
        const endFreq = currentGlobalTheme === 'dark' ? 700 : 600;
        accessOsc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        accessOsc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.2);
        accessOsc.type = 'triangle';

        const accessVolume = currentGlobalTheme === 'dark' ? 0.07 : 0.05;
        accessGain.gain.setValueAtTime(accessVolume, ctx.currentTime);
        accessGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        accessOsc.start(ctx.currentTime);
        accessOsc.stop(ctx.currentTime + 0.25);

        // Registrar oscilador para poder cancelarlo
        activeOscillatorsRef.current.push(accessOsc);
        try {
          accessOsc.onended = () => {
            activeOscillatorsRef.current = activeOscillatorsRef.current.filter(
              o => o !== accessOsc
            );
            try {
              accessOsc.disconnect();
            } catch (e) {}
          };
        } catch (e) {}
      }, 700);

      // Registrar timeout para poder cancelarlo
      activeTimeoutsRef.current.push(accessTimeout);
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  };

  // Función para renderizar texto con efectos de terremoto por carácter
  const renderTextWithEarthquake = (text: string, isHackActive: boolean) => {
    if (!isHackActive) {
      return text;
    }

    return text.split('').map((char, index) => {
      // Agregar clase de terremoto a algunos caracteres aleatoriamente
      const shouldShake = Math.random() < 0.3; // 30% de caracteres con terremoto
      const className = shouldShake ? 'earthquake-char' : '';

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  // Función para detener todos los sonidos activos
  const stopAllSounds = () => {
    // Cancelar todos los timeouts activos
    activeTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    activeTimeoutsRef.current = [];

    // Detener todos los osciladores activos
    activeOscillatorsRef.current.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (e) {
        // Ignorar errores si el oscilador ya se detuvo
      }
    });
    activeOscillatorsRef.current = [];

    // Crear nuevo contexto de audio para detener completamente cualquier sonido
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignorar errores al cerrar contexto
      }
      audioContextRef.current = null;
    }
  };

  // Cleanup global: asegurar que al desmontar limpiamos todos los timeouts, osciladores
  // y cerramos el AudioContext para evitar fugas de memoria y callbacks residuales.
  useEffect(() => {
    return () => {
      // Marcar desmontado para que callbacks asíncronos puedan evitar actualizar estado
      mountedRef.current = false;

      try {
        stopAllSounds();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Función para activar tema hack específico
  const activateHackTheme = () => {
    // Guardar tema original solo si no hay uno guardado ya
    if (!originalThemeBeforeHack) {
      setOriginalThemeBeforeHack(currentGlobalTheme);
    }

    // Aplicar tema hack al DOM
    const root = document.documentElement;
    const body = document.body;

    // Agregar atributo específico para tema hack
    root.setAttribute('data-hack-theme', 'active');
    body.classList.add('hack-theme-active');

    // Guardar en localStorage para posible restauración
    localStorage.setItem('hack-theme-active', 'true');
    localStorage.setItem('hack-original-theme', currentGlobalTheme);
  };

  return (
    <div
      className={`interactive-terminal-container ${earthquakeActive ? 'hack-earthquake-intense hack-pulse' : ''} ${currentGlobalTheme === 'dark' && earthquakeActive ? 'hack-dark-mode' : ''} ${hackIntensity > 2 ? 'hack-intensity-high' : ''}`}
    >
      {/* Terminal Header */}
      <div className="interactive-terminal-header">
        <div className="interactive-terminal-controls">
          <div className="interactive-terminal-button close"></div>
          <div className="interactive-terminal-button minimize"></div>
          <div className="interactive-terminal-button maximize"></div>
        </div>
        <div className="interactive-terminal-title">{t.ui.title}</div>
        <div className="interactive-terminal-actions">
          <button
            className="interactive-terminal-clear-btn"
            onClick={clearTerminal}
            title={t.ui.clearButton}
          >
            <i className="fas fa-broom"></i> {t.ui.clearButton}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="interactive-terminal-body" ref={outputRef}>
        <div className="interactive-terminal-output">
          {/* Historial de comandos */}
          {history.map((entry, index) => (
            <div key={index} className="interactive-history-item">
              {/* Mostrar comando si no está vacío */}
              {entry.command && (
                <div className="interactive-terminal-line">
                  <div className="interactive-command-line">
                    <span className="interactive-terminal-prompt">
                      <span className="user">adrian</span>
                      <span className="at">@</span>
                      <span className="host">dev</span>
                      <span className="separator">:</span>
                      <span className="path">~</span>
                      <span className="dollar">$</span>
                    </span>
                    <span className="command-text">{entry.command}</span>
                  </div>
                </div>
              )}

              {/* Mostrar output con animación línea por línea o typewriter */}
              {entry.output.map((line, lineIndex) => (
                <div key={lineIndex} className="interactive-terminal-line">
                  <div className="interactive-output-line line-reveal">
                    {typeof line === 'string' && line.includes('<') ? (
                      <SafeHtml html={line} />
                    ) : (
                      line
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Output en progreso con typewriter caracter por caracter */}
          {typewriterActive && (
            <div
              className={`interactive-history-item typewriter-active ${specialEffect === 'hack' ? 'hack-effect' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}
            >
              {/* Líneas ya completadas */}
              {typewriterQueue.slice(0, currentLineIndex).map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={`interactive-terminal-line ${earthquakeActive ? 'earthquake-line' : ''}`}
                >
                  <div
                    className={`interactive-output-line ${specialEffect === 'hack' ? 'hack-effect hack-distortion' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}
                  >
                    {typeof line === 'string' && line.includes('<') ? (
                      // Para líneas con HTML renderizamos seguro sin efectos por carácter
                      <SafeHtml html={line} />
                    ) : (
                      renderTextWithEarthquake(line, earthquakeActive)
                    )}
                  </div>
                </div>
              ))}

              {/* Línea actual siendo escrita */}
              {currentLineIndex < typewriterQueue.length && (
                <div
                  className={`interactive-terminal-line ${earthquakeActive ? 'earthquake-line' : ''}`}
                >
                  <div
                    className={`interactive-output-line typewriter-current ${specialEffect === 'hack' ? 'hack-effect hack-glitch' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}
                  >
                    {typeof currentLine === 'string' && currentLine.includes('<') ? (
                      <SafeHtml html={currentLine} />
                    ) : (
                      renderTextWithEarthquake(currentLine, earthquakeActive)
                    )}
                    <span className="typewriter-cursor">|</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Línea de input actual - Solo mostrar cuando no está ejecutando typewriter */}
          {!typewriterActive && (
            <div className="interactive-current-input">
              <span className="interactive-terminal-prompt">
                <span className="user">adrian</span>
                <span className="at">@</span>
                <span className="host">dev</span>
                <span className="separator">:</span>
                <span className="path">~</span>
                <span className="dollar">$</span>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="interactive-terminal-input"
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={showTypingIndicator ? t.ui.processing : t.ui.placeholder}
                disabled={showTypingIndicator}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />

              {/* Autocompletado */}
              {showAutocomplete && autocompleteOptions.length > 0 && (
                <div className="interactive-autocomplete">
                  {autocompleteOptions.map((option, index) => (
                    <div
                      key={option}
                      className={`interactive-autocomplete-item ${
                        index === selectedSuggestion ? 'selected' : ''
                      }`}
                      onClick={() => selectSuggestion(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente wrapper que provee el contexto de traducciones
const InteractiveTerminal: React.FC = () => {
  return (
    <TerminalTranslationProvider>
      <InteractiveTerminalContent />
    </TerminalTranslationProvider>
  );
};

export default InteractiveTerminal;
