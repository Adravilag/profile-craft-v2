// src/hooks/useLocalWebLLM.ts
import { useMemo, useRef, useState } from 'react';
import * as webllm from '@mlc-ai/web-llm';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f32_1-MLC'; // puedes cambiar por otro de WebLLM
const MODEL_URL = undefined; // deja undefined para usar el repo por defecto de MLC

export function useLocalWebLLM() {
  const engineRef = useRef<webllm.WebWorkerMLCEngine | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Cargando modelo…');
  const [progress, setProgress] = useState<number>(0); // Lazy init function: returns a promise that resolves when engine is ready
  const [error, setError] = useState<Error | null>(null);

  function init(onProgress?: (text: string, percent?: number, backend?: string) => void) {
    if (engineRef.current) return Promise.resolve();
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      const cfg: any = {
        initProgressCallback: (report: any) => {
          const text = report?.text ?? String(report);
          const m = /([0-9]{1,3})%/.exec(text);
          const pct = m ? Math.min(100, Math.max(0, Number(m[1]))) : undefined;
          if (pct !== undefined) setProgress(pct);

          // Detectar mensajes tipo 'Finish loading on WebGPU - amd' y extraer backend
          let backend: string | undefined;
          try {
            const finishMatch = /Finish loading on\s*([^\-]+)-\s*(\w+)/i.exec(text);
            if (finishMatch) {
              const platform = finishMatch[1].trim();
              const vendor = finishMatch[2].trim().toUpperCase();
              backend = `${platform.trim()} - ${vendor}`;
            }
          } catch (e) {
            // ignore
          }

          setLoadingMsg(text);
          if (onProgress) onProgress(text, pct, backend);
        },
        cachePath: 'mlc-webllm-cache',
      };
      if (MODEL_URL) cfg.modelUrl = MODEL_URL;
      try {
        // Algunos cambios en la librería pueden renombrar la función creadora.
        // Intentamos varias opciones para dar más robustez y mensajes de error claros.
        const candidates = [
          (webllm as any).CreateMLCEngine,
          (webllm as any).createMLCEngine,
          (webllm as any).createEngine,
          (webllm as any).default?.CreateMLCEngine,
          (webllm as any).default?.createMLCEngine,
          (webllm as any).default?.createEngine,
        ];

        let engine: any | null = null;
        let lastErr: any = null;

        for (const fn of candidates) {
          if (typeof fn !== 'function') continue;
          try {
            setLoadingMsg('Inicializando motor de IA (probando API)...');
            // Algunos entrypoints pueden requerir sólo cfg o (id, cfg)
            engine = await fn(MODEL_ID, cfg).catch(() => {
              // Si falla, reintentar con solo cfg
              return fn(cfg);
            });
            if (engine) break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!engine) {
          const keys = Object.keys(webllm as any).join(', ');
          const msg = `No se encontró un creador de engine usable en @mlc-ai/web-llm. Exports: ${keys}`;
          const fullErr = lastErr
            ? new Error(`${msg} — último error: ${String(lastErr)}`)
            : new Error(msg);
          setError(fullErr);
          setLoadingMsg(`Error inicializando modelo: ${fullErr.message}`);
          throw fullErr;
        }

        engineRef.current = engine as any;
        setReady(true);
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        const decorated = new Error(msg);
        setError(decorated);
        setLoadingMsg(`Error inicializando modelo: ${msg}`); // Re-throw para que el llamador pueda manejarlo
        throw decorated;
      }
    })();

    return initPromiseRef.current;
  } // Cleanup when component unmounts (best-effort)
  // Note: no useEffect auto-init; caller controls lifecycle

  (globalThis as any).__mlc_cleanup = () => {
    try {
      engineRef.current?.unload();
    } catch {}
  };

  const chat = useMemo(
    () => ({
      /** streaming token a token */
      stream: async function* (messages: Msg[], temperature = 0.7) {
        const engine = engineRef.current!;
        if (!engine) throw new Error('Engine not initialized');

        const params: webllm.ChatCompletionRequest = {
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          stream: true,
        };

        // The type of `it` is now correctly inferred as `AsyncIterable<ChatCompletionChunk>`
        const it = await engine.chat.completions.create(params);

        // No need for a runtime check or complex casting.
        // TypeScript now knows 'it' is an AsyncIterable because `params.stream` is true.
        // The `for await...of` loop is now valid.
        for await (const chunk of it) {
          const content = chunk.choices?.[0]?.delta?.content ?? '';

          // Debug logging to see what content is being received
          if (content && typeof content === 'string') {
            // Log problematic characters for debugging
            const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content);
            const hasReplacementChars = /\uFFFD/.test(content);

            if (hasControlChars || hasReplacementChars) {
              console.warn('Problematic content detected:', {
                content,
                hasControlChars,
                hasReplacementChars,
                charCodes: content.split('').map(c => c.charCodeAt(0)),
              });
            }
          }

          yield content;
        }
      },
    }),
    []
  );

  return { ready, loadingMsg, progress, init, chat, error } as const;
}
