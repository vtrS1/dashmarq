import { DecimalPipe } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TurnoverDataService } from '../../core/services/turnover-data.service';
import { KpiCardComponent } from '../../shared/ui/kpi-card/kpi-card.component';
import { FiltersBarComponent } from '../../shared/ui/filters-bar/filters-bar.component';
import { AgeGroupChartComponent } from './charts/age-group-chart.component';
import { TenureCurveChartComponent } from './charts/tenure-curve-chart.component';
import { ContractTerminationChartComponent } from './charts/contract-termination-chart.component';
import { DismissalReasonChartComponent } from './charts/dismissal-reason-chart.component';
import { TopRolesChartComponent } from './charts/top-roles-chart.component';
import { TopUnitsChartComponent } from './charts/top-units-chart.component';
import { DiagnosisPanelComponent } from './diagnosis-panel.component';
import { DashboardNavComponent } from '../../shared/ui/dashboard-nav/dashboard-nav.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DecimalPipe,
    KpiCardComponent,
    FiltersBarComponent,
    DashboardNavComponent,
    AgeGroupChartComponent,
    TenureCurveChartComponent,
    ContractTerminationChartComponent,
    DismissalReasonChartComponent,
    TopRolesChartComponent,
    TopUnitsChartComponent,
    DiagnosisPanelComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly data = inject(TurnoverDataService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = this.data.loading;
  readonly error = this.data.error;
  readonly kpis = this.data.kpis;
  readonly hasRecords = () => this.data.records().length > 0;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.data.load();
    }
  }
}
