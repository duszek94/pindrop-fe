import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';

import {
  LanguageService,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../../../core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [FormsModule, SelectModule, TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private readonly languageService = inject(LanguageService);

  protected readonly currentLang = this.languageService.currentLang;
  protected readonly languages = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: code.toUpperCase(),
  }));

  protected onLanguageChange(lang: SupportedLanguage): void {
    this.languageService.setLanguage(lang);
  }
}
