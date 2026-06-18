import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { fadeIn } from '../../animations/auth.animations';

@Component({
  selector: 'app-auth-brand-panel',
  templateUrl: './auth-brand-panel.html',
  styleUrl: './auth-brand-panel.scss',
  animations: [fadeIn],
  imports: [TranslatePipe],
})
export class AuthBrandPanel {
  protected readonly features = [
    { icon: 'pi-map', tone: 'map' },
    { icon: 'pi-sparkles', tone: 'ai' },
    { icon: 'pi-globe', tone: 'globe' },
  ];
}
