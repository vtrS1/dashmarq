import { Component, computed, inject } from '@angular/core';
import { TurnoverDataService } from '../../core/services/turnover-data.service';
import { ChartCardComponent } from '../../shared/ui/chart-card/chart-card.component';
import {
  dismissalReasonBreakdown,
  tenureBuckets,
  turnoverByAgeGroup,
  turnoverByGender,
  turnoverByRole,
  turnoverByUnit,
} from '../../core/utils/turnover-analytics.util';

/**
 * Painel de diagnóstico — tudo aqui é calculado a partir da base carregada
 * (nada hardcoded). Isso importa especialmente para o motivo de
 * desligamento: a fonte de dados já mudou uma vez (ver nota em
 * `turnover.model.ts` sobre a correção do mapeamento de "TIPODEMISSAO") e um
 * texto fixo teria ficado incorreto silenciosamente quando isso aconteceu.
 */
@Component({
  selector: 'app-diagnosis-panel',
  imports: [ChartCardComponent],
  templateUrl: './diagnosis-panel.component.html',
  styleUrl: './diagnosis-panel.component.scss',
})
export class DiagnosisPanelComponent {
  private readonly data = inject(TurnoverDataService);

  readonly kpis = this.data.kpis;

  private readonly records = this.data.filteredRecords;

  readonly byGender = computed(() => turnoverByGender(this.records()));
  readonly byAgeGroup = computed(() => turnoverByAgeGroup(this.records()));
  readonly byRole = computed(() => turnoverByRole(this.records(), 3));
  readonly byUnit = computed(() => turnoverByUnit(this.records(), 3));
  readonly reasons = computed(() => dismissalReasonBreakdown(this.records()));
  readonly buckets = computed(() => tenureBuckets(this.records()));

  readonly topAgeGroupByVolume = computed(() =>
    [...this.byAgeGroup()].filter((g) => g.dismissed > 0).sort((a, b) => b.dismissed - a.dismissed)[0] ?? null,
  );
  readonly topAgeGroupByRate = computed(() =>
    [...this.byAgeGroup()].filter((g) => g.total > 0).sort((a, b) => b.turnoverRate - a.turnoverRate)[0] ?? null,
  );
  readonly topRole = computed(() => this.byRole()[0] ?? null);
  readonly topUnit = computed(() => this.byUnit()[0] ?? null);
  readonly topReason = computed(() => this.reasons()[0] ?? null);
  readonly secondReason = computed(() => this.reasons()[1] ?? null);

  /** "Empresa" = com ou sem justa causa; agrupa as duas iniciativas do empregador. */
  readonly employerInitiatedPct = computed(() => {
    const total = this.kpis().totalDismissed;
    if (!total) return 0;
    const count = this.reasons()
      .filter((r) => r.reason === 'EMPRESA_SEM_JUSTA_CAUSA' || r.reason === 'EMPRESA_COM_JUSTA_CAUSA')
      .reduce((sum, r) => sum + r.count, 0);
    return (count / total) * 100;
  });

  readonly employeeInitiatedPct = computed(() => {
    const total = this.kpis().totalDismissed;
    if (!total) return 0;
    const count = this.reasons().find((r) => r.reason === 'PEDIDO_DEMISSAO')?.count ?? 0;
    return (count / total) * 100;
  });
}
