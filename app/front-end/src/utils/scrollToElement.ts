// Utilidad compartida para realizar scroll animado y cancelable
let animId: number | null = null;

export function cancelScroll() {
  try {
    if (animId) cancelAnimationFrame(animId);
  } catch {
    // no-op
  }
  animId = null;
}

export async function scrollToElement(
  targetElOrTop: HTMLElement | number,
  opts?: { offset?: number; minDur?: number; maxDur?: number; instant?: boolean }
) {
  try {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = opts?.offset || 8;
    const minDur = opts?.minDur ?? 280;
    const maxDur = opts?.maxDur ?? 900;

    // Si se solicita instantaneo explícitamente o la preferencia del usuario lo indica,
    // hacemos scroll inmediato.
    const forceInstant = !!opts?.instant || prefersReduced;

    let targetTop: number;
    if (typeof targetElOrTop === 'number') {
      targetTop = Math.max(0, Math.floor(targetElOrTop));
    } else if (targetElOrTop instanceof HTMLElement) {
      // Read layout inside requestAnimationFrame to avoid forcing a synchronous reflow
      const top = await new Promise<number>(rafResolve => {
        requestAnimationFrame(() => {
          try {
            const t = Math.round(
              targetElOrTop.getBoundingClientRect().top + window.scrollY - offset
            );
            rafResolve(t);
          } catch {
            rafResolve(0);
          }
        });
      });
      targetTop = top;
    } else {
      targetTop = 0;
    }

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    targetTop = Math.max(0, Math.min(targetTop, maxScroll));

    if (forceInstant) {
      window.scrollTo(0, targetTop);
      return Promise.resolve();
    }

    // Cancel previous
    if (animId) {
      try {
        cancelAnimationFrame(animId);
      } catch {
        // no-op
      }
      animId = null;
    }

    const start = (window.scrollY || window.pageYOffset) as number;
    const distance = Math.abs(start - targetTop);
    const dur = Math.max(minDur, Math.min(maxDur, Math.round(distance * 0.6)));

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const startTime = performance.now();

    await new Promise<void>(resolve => {
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / dur);
        const eased = ease(t);
        const current = Math.round(start + (targetTop - start) * eased);
        window.scrollTo(0, current);
        if (t < 1) {
          animId = requestAnimationFrame(step);
        } else {
          animId = null;
          resolve();
        }
      };

      animId = requestAnimationFrame(step);
    });
  } catch {
    // En caso de error, fallback instantáneo
    try {
      if (typeof targetElOrTop === 'number') window.scrollTo(0, targetElOrTop);
      else if (targetElOrTop instanceof HTMLElement)
        window.scrollTo(0, Math.round(targetElOrTop.getBoundingClientRect().top + window.scrollY));
    } catch {
      // no-op
    }
    return Promise.resolve();
  }
}
