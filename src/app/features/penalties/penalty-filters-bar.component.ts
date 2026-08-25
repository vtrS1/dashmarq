import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PenaltyDataService } from '../../core/services/penalty-data.service';
import { ChipOption, ChipToggleGroupComponent } from '../../shared/ui/chip-toggle-group/chip-toggle-group.component';
import { MultiSelectComponent } from '../../shared/ui/multi-select/multi-select.component';
import { DateRangeFilterComponent } from '../../shared/ui/date-range-filter/date-range-filter.component';

@Component({
  selector: 'app-penalty-filters-bar',
  imports: [ChipToggleGroupComponent, MultiSelectComponent, DateRangeFilterComponent, DecimalPipe],
  templateUrl: './penalty-filters-bar.component.html',
  styleUrl: './penalty-filters-bar.component.scss',
})
export class PenaltyFiltersBarComponent {
  private readonly data = inject(PenaltyDataService);

  readonly filters = this.data.filters;
  readonly availableFuncoes = this.data.availableFuncoes;
  readonly availableSetores = this.data.availableSetores;
  readonly availableGestores = this.data.availableGestores;
  readonly availableMotivos = this.data.availableMotivos;
  readonly dateBounds = this.data.dateBounds;
  readonly resultCount = this.data.filteredPenalties;

  readonly turnoOptions = computed<ChipOption[]>(() =>
    this.data.availableTurnos().map((t) => ({ value: t, label: t })),
  );
  readonly tipoOptions = computed<ChipOption[]>(() => this.data.availableTipos().map((t) => ({ value: t, label: t })));

  onTurnoChange(values: string[]): void {
    this.data.updateFilters({ turnos: values });
  }

  onTipoChange(values: string[]): void {
    this.data.updateFilters({ tipos: values });
  }

  onFuncaoChange(values: string[]): void {
    this.data.updateFilters({ funcoes: values });
  }

  onSetorChange(values: string[]): void {
    this.data.updateFilters({ setores: values });
  }

  onGestorChange(values: string[]): void {
    this.data.updateFilters({ gestores: values });
  }

  onMotivoChange(values: string[]): void {
    this.data.updateFilters({ motivos: values });
  }

  onDateRangeChange(range: [Date, Date] | null): void {
    this.data.updateFilters({ dateRange: range });
  }

  reset(): void {
    this.data.resetFilters();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(
      f.funcoes.length ||
      f.setores.length ||
      f.turnos.length ||
      f.gestores.length ||
      f.tipos.length ||
      f.motivos.length ||
      f.dateRange
    );
  }
}
