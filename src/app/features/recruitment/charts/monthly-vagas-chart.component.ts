import { Component, computed, inject } from '@angular/core';
import { RecruitmentDataService } from '../../../core/services/recruitment-data.service';
import { buildGroupedBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-monthly-vagas-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Vagas fechadas x contratações por mês"
      subtitle="Contratados considera apenas contratações externas"
      span="full"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class MonthlyVagasChartComponent {
  private readonly data = inject(RecruitmentDataService);

  readonly options = computed(() => {
    const monthly = this.data.monthly();
    const palette = getChartPalette();
    return buildGroupedBarOptions(
      monthly.map((m) => m.monthLabel),
      [
        { name: 'Vagas fechadas', data: monthly.map((m) => m.fechadas), color: palette.series[2] },
        { name: 'Contratados (externo)', data: monthly.map((m) => m.contratados), color: palette.series[0] },
      ],
      palette,
    );
  });
}
