import { Component, computed, inject } from '@angular/core';
import { PenaltyDataService } from '../../../core/services/penalty-data.service';
import { buildSimpleBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-penalty-evolution-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Evolução das penalidades"
      subtitle="Contagem por semana (segunda-feira de cada semana) — inclui semanas sem ocorrências"
      span="full"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class PenaltyEvolutionChartComponent {
  private readonly data = inject(PenaltyDataService);

  readonly options = computed(() => {
    const weeks = this.data.evolution();
    return buildSimpleBarOptions(
      weeks.map((w) => w.weekLabel),
      weeks.map((w) => w.count),
      getChartPalette(),
    );
  });
}
