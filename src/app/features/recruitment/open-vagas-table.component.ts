import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RecruitmentDataService } from '../../core/services/recruitment-data.service';
import { ChartCardComponent } from '../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-open-vagas-table',
  imports: [ChartCardComponent, DecimalPipe],
  templateUrl: './open-vagas-table.component.html',
  styleUrl: './open-vagas-table.component.scss',
})
export class OpenVagasTableComponent {
  private readonly data = inject(RecruitmentDataService);
  readonly openVagas = this.data.openVagas;
}
