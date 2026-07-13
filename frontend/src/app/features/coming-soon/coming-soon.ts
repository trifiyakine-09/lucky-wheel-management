import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <div class="coming-soon">
      <span class="coming-soon__icon">🚧</span>
      <h2>{{ title }}</h2>
      <p>Cette page arrive bientôt.</p>
    </div>
  `,
  styles: [`
    .coming-soon { text-align: center; padding: 80px 20px; color: var(--color-muted); }
    .coming-soon__icon { font-size: 48px; display: block; margin-bottom: 16px; }
    h2 { color: var(--color-ink); margin: 0 0 8px; }
  `],
})
export class ComingSoon {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] ?? 'Page';
}