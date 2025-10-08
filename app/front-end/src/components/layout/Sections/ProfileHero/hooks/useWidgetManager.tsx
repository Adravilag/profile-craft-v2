import { useState, useMemo } from 'react';

// añadir context translate
import { useT } from '@/contexts/TranslationContext';
import SafeHtml from '@/components/common/SafeHtml/SafeHtml';

type WidgetType = 'terminal' | 'video' | 'projects';

interface UseWidgetManagerReturn {
  activeWidget: WidgetType;
  setActiveWidget: (widget: WidgetType) => void;
  widgetHints: Record<WidgetType, React.ReactNode>;
}

/**
 * Hook para gestionar los widgets del ProfileHero
 * Controla cuál widget está activo y proporciona hints para cada uno
 */
export function useWidgetManager(): UseWidgetManagerReturn {
  const [activeWidget, setActiveWidget] = useState<WidgetType>('terminal');

  const t = useT();

  // Mensajes de ayuda/contexto para el área de widgets según el widget activo
  const widgetHints = useMemo(() => {
    return {
      terminal: (
        <>
          💡 <SafeHtml html={t.profileHero.terminalHint} />.
        </>
      ),
      video: (
        <>
          🎬 <SafeHtml html={t.profileHero.videoHint} />
        </>
      ),
      projects: <SafeHtml html={t.profileHero.projectsHint} />,
    } as Record<WidgetType, React.ReactNode>;
  }, [t]);

  return {
    activeWidget,
    setActiveWidget,
    widgetHints,
  };
}
