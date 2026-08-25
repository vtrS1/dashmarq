import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildGroupTurnoverBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { turnoverByMaritalStatus } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-marital-status-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card title="Rotatividade por estado civil" subtitle="Volume e taxa de desligamento por estado civil">
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class MaritalStatusChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const groups = turnoverByMaritalStatus(this.data.filteredRecords());
    return buildGroupTurnoverBarOptions(groups, getChartPalette());
  });
}
