import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TurnoverDataService } from '../../../core/services/turnover-data.service';
import { AGE_GROUP_ORDER, DISMISSAL_REASON_LABELS, DismissalReasonCode } from '../../../core/models/turnover.model';
import { ChipOption, ChipToggleGroupComponent } from '../chip-toggle-group/chip-toggle-group.component';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { DateRangeFilterComponent } from '../date-range-filter/date-range-filter.component';

const AGE_GROUP_OPTIONS: ChipOption[] = AGE_GROUP_ORDER.map((g) => ({ value: g, label: g }));

const REASON_OPTIONS: ChipOption[] = (Object.keys(DISMISSAL_REASON_LABELS) as DismissalReasonCode[]).map((r) => ({
  value: r,
  label: DISMISSAL_REASON_LABELS[r],
}));

@Component({
  selector: 'app-filters-bar',
  imports: [ChipToggleGroupComponent, MultiSelectComponent, DateRangeFilterComponent, DecimalPipe],
  templateUrl: './filters-bar.component.html',
  styleUrl: './filters-bar.component.scss',
})
export class FiltersBarComponent {
  private readonly data = inject(TurnoverDataService);

  readonly filters = this.data.filters;
  readonly availableRoles = this.data.availableRoles;
  readonly availableUnits = this.data.availableUnits;
  readonly dismissalDateBounds = this.data.dismissalDateBounds;

  readonly ageGroupOptions = AGE_GROUP_OPTIONS;
  readonly reasonOptions = REASON_OPTIONS;

  readonly resultCount = this.data.filteredRecords;

  onAgeGroupChange(values: string[]): void {
    this.data.updateFilters({ ageGroups: values as (typeof AGE_GROUP_ORDER)[number][] });
  }

  onReasonChange(values: string[]): void {
    this.data.updateFilters({ reasons: values as DismissalReasonCode[] });
  }

  onRoleChange(values: string[]): void {
    this.data.updateFilters({ roles: values });
  }

  onUnitChange(values: string[]): void {
    this.data.updateFilters({ units: values });
  }

  onDismissalDateRangeChange(range: [Date, Date] | null): void {
    this.data.updateFilters({ dismissalDateRange: range });
  }

  reset(): void {
    this.data.resetFilters();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(
      f.ageGroups.length ||
      f.roles.length ||
      f.units.length ||
      f.reasons.length ||
      f.dismissalDateRange
    );
  }
}
