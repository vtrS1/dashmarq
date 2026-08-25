import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RecruitmentDataService } from '../../core/services/recruitment-data.service';
import { StatusVagaRaw, TIPO_VAGA_LABELS, TipoVaga } from '../../core/models/recruitment.model';
import { ChipOption, ChipToggleGroupComponent } from '../../shared/ui/chip-toggle-group/chip-toggle-group.component';
import { MultiSelectComponent } from '../../shared/ui/multi-select/multi-select.component';
import { DateRangeFilterComponent } from '../../shared/ui/date-range-filter/date-range-filter.component';

const TIPO_OPTIONS: ChipOption[] = (Object.keys(TIPO_VAGA_LABELS) as TipoVaga[]).map((t) => ({
  value: t,
  label: TIPO_VAGA_LABELS[t],
}));

const STATUS_OPTIONS: ChipOption[] = [
  { value: 'FECHADA', label: 'Fechada' },
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'CONGELADA', label: 'Congelada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

@Component({
  selector: 'app-recruitment-filters-bar',
  imports: [ChipToggleGroupComponent, MultiSelectComponent, DateRangeFilterComponent, DecimalPipe],
  templateUrl: './recruitment-filters-bar.component.html',
  styleUrl: './recruitment-filters-bar.component.scss',
})
export class RecruitmentFiltersBarComponent {
  private readonly data = inject(RecruitmentDataService);

  readonly filters = this.data.filters;
  readonly availableCargos = this.data.availableCargos;
  readonly availableSetores = this.data.availableSetores;
  readonly recebimentoBounds = this.data.recebimentoBounds;
  readonly resultCount = this.data.filteredVagas;

  readonly tipoOptions = TIPO_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  onTipoChange(values: string[]): void {
    this.data.updateFilters({ tipos: values as TipoVaga[] });
  }

  onStatusChange(values: string[]): void {
    this.data.updateFilters({ status: values as StatusVagaRaw[] });
  }

  onCargoChange(values: string[]): void {
    this.data.updateFilters({ cargos: values });
  }

  onSetorChange(values: string[]): void {
    this.data.updateFilters({ setores: values });
  }

  onRecebimentoRangeChange(range: [Date, Date] | null): void {
    this.data.updateFilters({ recebimentoRange: range });
  }

  reset(): void {
    this.data.resetFilters();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.tipos.length || f.status.length || f.setores.length || f.cargos.length || f.recebimentoRange);
  }
}
