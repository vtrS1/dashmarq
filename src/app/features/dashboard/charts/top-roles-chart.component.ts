import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildGroupTurnoverBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { turnoverByRole } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-top-roles-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card title="Top funções em risco" subtitle="Ordenado por volume de desligamentos">
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class TopRolesChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const groups = turnoverByRole(this.data.filteredRecords(), 8);
    return buildGroupTurnoverBarOptions(groups, getChartPalette(), { horizontal: true });
  });
}
