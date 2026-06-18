import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { AuthBrandPanel } from '../../../../shared/components/auth-brand-panel/auth-brand-panel';
import { fadeSlideIn } from '../../../../shared/animations/auth.animations';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, AuthBrandPanel, LanguageSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  animations: [fadeSlideIn],
})
export class AuthLayout {}
