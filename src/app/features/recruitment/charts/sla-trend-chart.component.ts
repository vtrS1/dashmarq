import { Component, computed, inject } from '@angular/core';
import { RecruitmentDataService } from '../../../core/services/recruitment-data.service';
import { buildPercentLineOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-sla-trend-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Cumprimento de SLA por mês"
      subtitle="% de vagas fechadas dentro do prazo"
      span="full"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class SlaTrendChartComponent {
  private readonly data = inject(RecruitmentDataService);

  readonly options = computed(() => {
    const monthly = this.data.monthly();
    return buildPercentLineOptions(
      monthly.map((m) => m.monthLabel),
      monthly.map((m) => Math.round(m.pctDentroDoPrazo * 10) / 10),
      getChartPalette(),
    );
  });
}
