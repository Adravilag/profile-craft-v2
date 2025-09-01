export function useTranslation() {
  const i18n = {
    language: typeof window !== 'undefined' ? document.documentElement.lang || 'es' : 'es',
    changeLanguage: async (lng: string) => {
      if (typeof window !== 'undefined') document.documentElement.lang = lng;
      return Promise.resolve();
    },
  };

  function getAvailableLanguages() {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
    ];
  }

  return {
    i18n,
    getAvailableLanguages,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
  } as const;
}

export default useTranslation;
