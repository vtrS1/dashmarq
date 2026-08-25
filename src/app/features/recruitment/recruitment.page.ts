import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RecruitmentDataService } from '../../core/services/recruitment-data.service';
import { KpiCardComponent } from '../../shared/ui/kpi-card/kpi-card.component';
import { DashboardNavComponent } from '../../shared/ui/dashboard-nav/dashboard-nav.component';
import { MonthlyVagasChartComponent } from './charts/monthly-vagas-chart.component';
import { SlaTrendChartComponent } from './charts/sla-trend-chart.component';
import { TipoVagaTableComponent } from './tipo-vaga-table.component';
import { OpenVagasTableComponent } from './open-vagas-table.component';
import { DiagnosisRecruitmentComponent } from './diagnosis-recruitment.component';
import { RecruitmentFiltersBarComponent } from './recruitment-filters-bar.component';

@Component({
  selector: 'app-recruitment-page',
  imports: [
    DecimalPipe,
    KpiCardComponent,
    DashboardNavComponent,
    RecruitmentFiltersBarComponent,
    MonthlyVagasChartComponent,
    SlaTrendChartComponent,
    TipoVagaTableComponent,
    OpenVagasTableComponent,
    DiagnosisRecruitmentComponent,
  ],
  templateUrl: './recruitment.page.html',
  styleUrl: './recruitment.page.scss',
})
export class RecruitmentPage {
  private readonly data = inject(RecruitmentDataService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = this.data.loading;
  readonly error = this.data.error;
  readonly kpis = this.data.kpis;
  readonly hasRecords = () => this.data.vagas().length > 0;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.data.load();
    }
  }
}
