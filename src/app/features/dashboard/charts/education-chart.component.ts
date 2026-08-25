import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildGroupTurnoverBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { turnoverByEducationLevel } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-education-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Rotatividade por grau de instrução"
      subtitle="Top níveis por volume de colaboradores"
      span="full"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class EducationChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const groups = turnoverByEducationLevel(this.data.filteredRecords(), 8);
    return buildGroupTurnoverBarOptions(groups, getChartPalette(), { horizontal: true });
  });
}
