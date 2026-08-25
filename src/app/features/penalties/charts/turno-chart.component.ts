import { Component, computed, inject } from '@angular/core';
import { PenaltyDataService } from '../../../core/services/penalty-data.service';
import { buildDonutOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-penalty-turno-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card title="Penalidades por turno" subtitle="% do total no filtro atual">
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class PenaltyTurnoChartComponent {
  private readonly data = inject(PenaltyDataService);

  readonly options = computed(() => {
    const groups = this.data.byTurno();
    const palette = getChartPalette();
    return buildDonutOptions(
      groups.map((g) => g.key),
      groups.map((g) => g.count),
      palette.series.slice(0, groups.length),
      palette,
    );
  });
}
