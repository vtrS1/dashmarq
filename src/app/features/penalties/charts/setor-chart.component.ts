import { Component, computed, inject } from '@angular/core';
import { PenaltyDataService } from '../../../core/services/penalty-data.service';
import { buildRankedBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-penalty-setor-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card title="Penalidades por setor" subtitle="Setor com mais ocorrências em destaque">
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class PenaltySetorChartComponent {
  private readonly data = inject(PenaltyDataService);

  readonly options = computed(() => {
    const groups = this.data.bySetor();
    return buildRankedBarOptions(
      groups.map((g) => g.key),
      groups.map((g) => g.count),
      getChartPalette(),
    );
  });
}
