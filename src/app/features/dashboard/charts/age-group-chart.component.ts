import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildGroupTurnoverBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { turnoverByAgeGroup } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-age-group-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Rotatividade por faixa etária"
      subtitle="Volume concentrado em 25–44 anos; taxa relativa cresce com a idade"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class AgeGroupChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const groups = turnoverByAgeGroup(this.data.filteredRecords());
    return buildGroupTurnoverBarOptions(groups, getChartPalette());
  });
}
