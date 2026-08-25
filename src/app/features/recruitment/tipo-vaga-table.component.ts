import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RecruitmentDataService } from '../../core/services/recruitment-data.service';
import { ChartCardComponent } from '../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-tipo-vaga-table',
  imports: [ChartCardComponent, DecimalPipe],
  templateUrl: './tipo-vaga-table.component.html',
  styleUrl: './tipo-vaga-table.component.scss',
})
export class TipoVagaTableComponent {
  private readonly data = inject(RecruitmentDataService);
  readonly byTipo = this.data.byTipo;
}
