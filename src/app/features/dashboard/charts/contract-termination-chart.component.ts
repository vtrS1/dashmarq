import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildSimpleBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { contractTerminationConcentration } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-contract-termination-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title='Desligamentos por "Término de Contrato" (T), por dia de permanência'
      [subtitle]="subtitle()"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class ContractTerminationChartComponent {
  private readonly data = inject(TurnoverDataService);

  private readonly result = computed(() => contractTerminationConcentration(this.data.filteredRecords()));

  readonly subtitle = computed(() => {
    const r = this.result();
    if (!r.total) return 'Sem desligamentos por término de contrato no filtro atual';
    const pct = (((r.near45 + r.near90) / r.total) * 100).toFixed(1);
    return `Dias 44/45 + 89/90 concentram ${pct}% dos ${r.total} términos de contrato`;
  });

  readonly options = computed(() => {
    const r = this.result();
    // days order: 7,15,30,44,45,60,89,90,120,'Outros dias' -> highlight 44,45,89,90
    return buildSimpleBarOptions(
      r.points.map((p) => p.label),
      r.points.map((p) => p.count),
      getChartPalette(),
      { highlightIndexes: [3, 4, 6, 7] },
    );
  });
}
