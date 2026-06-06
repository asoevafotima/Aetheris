import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
export type Lang =
  | 'ru' | 'en' | 'de' | 'fr' | 'es' | 'pt' | 'it' | 'pl'
  | 'tr' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'uk' | 'be'
  | 'nl' | 'sv' | 'cs' | 'kk';

interface ThemeState {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      lang: 'ru',

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },

      setLang: (lang) => set({ lang }),
      toggleLang: () => set(s => ({ lang: s.lang === 'ru' ? 'en' : 'ru' })),
    }),
    {
      name: 'aetheris-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
