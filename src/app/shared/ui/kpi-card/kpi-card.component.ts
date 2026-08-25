import { Component, input } from '@angular/core';

export type KpiTone = 'neutral' | 'good' | 'warning' | 'critical';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly tone = input<KpiTone>('neutral');
}
