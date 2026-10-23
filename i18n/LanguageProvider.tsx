import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { translations, type Language, type Translation } from './translations';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
  formatDate: (isoDate: string) => string;
  formatRiel: (amount: number) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const value = useMemo<LanguageContextValue>(() => {
    const t = translations[language];
    return {
      language,
      setLanguage,
      t,
      // Format manually: Hermes Intl support for Khmer is inconsistent across devices.
      formatDate: (isoDate) => {
        const [year, month, day] = isoDate.split('-').map(Number);
        return `${day} ${t.months[month - 1]} ${year}`;
      },
      formatRiel: (amount) => `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ៛`,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
