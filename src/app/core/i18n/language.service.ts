import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export const LANGUAGE_STORAGE_KEY = 'pindrop.lang';

export const SUPPORTED_LANGUAGES = ['en', 'pl'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function readStoredLanguage(): SupportedLanguage {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
  return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<SupportedLanguage>('en');

  init(): Promise<void> {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    const initialLang = readStoredLanguage();

    return firstValueFrom(this.translate.use(initialLang)).then(() => {
      this.currentLang.set(initialLang);
      document.documentElement.lang = initialLang;
    });
  }

  setLanguage(lang: SupportedLanguage): void {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    this.currentLang.set(lang);
    document.documentElement.lang = lang;
    void firstValueFrom(this.translate.use(lang));
  }
}
