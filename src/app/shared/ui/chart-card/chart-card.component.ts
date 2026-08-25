import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.scss',
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  /** Optional grid span hint ('full' takes the whole row). */
  readonly span = input<'default' | 'full'>('default');
}
