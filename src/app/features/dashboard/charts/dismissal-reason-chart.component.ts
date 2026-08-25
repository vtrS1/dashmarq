import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildDonutOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { dismissalReasonBreakdown } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-dismissal-reason-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Motivo de desligamento"
      subtitle="Distribuição das saídas por motivo"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class DismissalReasonChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const slices = dismissalReasonBreakdown(this.data.filteredRecords());
    const palette = getChartPalette();
    return buildDonutOptions(
      slices.map((s) => s.label),
      slices.map((s) => s.count),
      palette.series.slice(0, slices.length),
      palette,
    );
  });
}
