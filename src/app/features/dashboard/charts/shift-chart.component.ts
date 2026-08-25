import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { buildGroupTurnoverBarOptions } from '../../../core/utils/chart-options.util';
import { getChartPalette } from '../../../core/utils/chart-theme.util';
import { shiftLabel, turnoverByShift } from '../../../core/utils/turnover-analytics.util';
import { ApexChartComponent } from '../../../shared/ui/apex-chart/apex-chart.component';
import { ChartCardComponent } from '../../../shared/ui/chart-card/chart-card.component';
import { ShiftType } from '../../../core/models/turnover.model';

@Component({
  selector: 'app-shift-chart',
  imports: [ChartCardComponent, ApexChartComponent],
  template: `
    <app-chart-card title="Rotatividade por turno" subtitle="Volume e taxa de desligamento por turno de trabalho">
      <app-apex-chart [options]="options()" />
    </app-chart-card>
  `,
})
export class ShiftChartComponent {
  private readonly data = inject(TurnoverDataService);

  readonly options = computed(() => {
    const groups = turnoverByShift(this.data.filteredRecords());
    return buildGroupTurnoverBarOptions(groups, getChartPalette(), {
      categoryFormatter: (key) => shiftLabel(key as ShiftType),
    });
  });
}
