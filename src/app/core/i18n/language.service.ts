import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'pindrop.lang';

export const SUPPORTED_LANGUAGES = ['en', 'pl'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<SupportedLanguage>('en');

  init(): void {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);

    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    const initialLang =
      saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';

    this.setLanguage(initialLang);
  }

  setLanguage(lang: SupportedLanguage): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}
