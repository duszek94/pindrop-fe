import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-placeholder-page',
  imports: [TranslatePipe],
  templateUrl: './dashboard-placeholder-page.html',
  styleUrl: './dashboard-placeholder-page.scss',
})
export class DashboardPlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly titleKey = this.route.snapshot.data['titleKey'] as string;
  protected readonly subtitleKey = this.route.snapshot.data['subtitleKey'] as string;
}
