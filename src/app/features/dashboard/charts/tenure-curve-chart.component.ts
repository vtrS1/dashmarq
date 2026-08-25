import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildAreaCurveOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { tenureCurve } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-tenure-curve-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card
      title="Curva de permanência acumulada"
      subtitle="% dos desligados que saíram até cada janela — maior aceleração entre o 45º e o 90º dia"
      span="full"
    >
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class TenureCurveChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const windows = tenureCurve(this.data.filteredRecords());
    return buildAreaCurveOptions(
      windows.map((w) => w.label),
      windows.map((w) => Math.round(w.pctOfDismissed * 100) / 100),
      getChartPalette(),
      { annotationRange: ['Até 45 dias', 'Até 90 dias'], annotationLabel: 'Janela crítica: 45–90 dias' },
    );
  });
}
