// Which language the game starts in, and the saved choice. The first visit follows the browser.
const KEY = 'this-day.language';
const SUPPORTED = ['en', 'pl'];

// The saved language if there is one, else the first browser language the game has, else English.
export function chooseLanguage(saved: string | null, browser: readonly string[]): string {
  if (saved && SUPPORTED.includes(saved)) return saved;
  for (const tag of browser) {
    const code = tag.toLowerCase().split('-')[0];
    if (SUPPORTED.includes(code)) return code;
  }
  return 'en';
}

export const otherLanguage = (code: string): string => (code === 'pl' ? 'en' : 'pl');

export function savedLanguage(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(code: string) {
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // Storage blocked: the choice lasts until the page closes.
  }
}
