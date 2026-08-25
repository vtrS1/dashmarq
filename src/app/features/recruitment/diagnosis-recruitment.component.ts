import { Component, computed, inject } from '@angular/core';
import { RecruitmentDataService } from '../../core/services/recruitment-data.service';
import { ChartCardComponent } from '../../shared/ui/chart-card/chart-card.component';

@Component({
  selector: 'app-diagnosis-recruitment',
  imports: [ChartCardComponent],
  templateUrl: './diagnosis-recruitment.component.html',
  styleUrl: './diagnosis-recruitment.component.scss',
})
export class DiagnosisRecruitmentComponent {
  private readonly data = inject(RecruitmentDataService);

  readonly kpis = this.data.kpis;
  readonly diagnostics = this.data.diagnostics;
  readonly byTipo = this.data.byTipo;

  readonly slaVerdict = computed(() => {
    const pct = this.kpis().pctDentroSLA;
    if (pct >= 70) return { label: 'dentro do esperado', tone: 'good' as const };
    if (pct >= 50) return { label: 'em atenção', tone: 'warning' as const };
    return { label: 'crítico', tone: 'critical' as const };
  });

  readonly backlogVerdict = computed(() => {
    const k = this.kpis();
    if (!k.totalAbertas) return null;
    return k.vagasAbertasAcimaSLA / k.totalAbertas;
  });

  /** Só destaca um tipo como "mais difícil" quando a diferença para o melhor tipo é relevante (>5 p.p.). */
  readonly hasMeaningfulTipoGap = computed(() => {
    const comVolume = this.byTipo().filter((t) => t.totalFechadas > 0);
    if (comVolume.length < 2) return false;
    const pcts = comVolume.map((t) => t.pctDentroSLA);
    return Math.max(...pcts) - Math.min(...pcts) > 5;
  });
}
