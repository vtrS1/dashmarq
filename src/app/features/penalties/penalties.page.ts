import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { PenaltyDataService } from '../../core/services/penalty-data.service';
import { KpiCardComponent } from '../../shared/ui/kpi-card/kpi-card.component';
import { DashboardNavComponent } from '../../shared/ui/dashboard-nav/dashboard-nav.component';
import { PenaltyFiltersBarComponent } from './penalty-filters-bar.component';
import { PenaltySetorChartComponent } from './charts/setor-chart.component';
import { PenaltyGestorChartComponent } from './charts/gestor-chart.component';
import { PenaltyTipoChartComponent } from './charts/tipo-chart.component';
import { PenaltyTurnoChartComponent } from './charts/turno-chart.component';
import { PenaltyMotivoChartComponent } from './charts/motivo-chart.component';
import { PenaltyEvolutionChartComponent } from './charts/evolution-chart.component';

@Component({
  selector: 'app-penalties-page',
  imports: [
    DecimalPipe,
    KpiCardComponent,
    DashboardNavComponent,
    PenaltyFiltersBarComponent,
    PenaltySetorChartComponent,
    PenaltyGestorChartComponent,
    PenaltyTipoChartComponent,
    PenaltyTurnoChartComponent,
    PenaltyMotivoChartComponent,
    PenaltyEvolutionChartComponent,
  ],
  templateUrl: './penalties.page.html',
  styleUrl: './penalties.page.scss',
})
export class PenaltiesPage {
  private readonly data = inject(PenaltyDataService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = this.data.loading;
  readonly error = this.data.error;
  readonly kpis = this.data.kpis;
  readonly hasRecords = () => this.data.penalties().length > 0;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.data.load();
    }
  }
}
