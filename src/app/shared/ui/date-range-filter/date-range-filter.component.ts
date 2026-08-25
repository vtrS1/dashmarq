import { Component, computed, input, output } from '@angular/core';

function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`);
}

/** Date-range filter (native `<input type="date">` pair) for the dismissal-date window. */
@Component({
  selector: 'app-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.scss',
})
export class DateRangeFilterComponent {
  readonly label = input.required<string>();
  readonly range = input<[Date, Date] | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly rangeChange = output<[Date, Date] | null>();

  readonly fromValue = computed(() => toDateInputValue(this.range()?.[0] ?? null));
  readonly toValue = computed(() => toDateInputValue(this.range()?.[1] ?? null));
  readonly minValue = computed(() => toDateInputValue(this.min()));
  readonly maxValue = computed(() => toDateInputValue(this.max()));

  onFromChange(value: string): void {
    const from = fromDateInputValue(value);
    const to = this.range()?.[1] ?? this.max() ?? from;
    this.emit(from, to);
  }

  onToChange(value: string): void {
    const to = fromDateInputValue(value);
    const from = this.range()?.[0] ?? this.min() ?? to;
    this.emit(from, to);
  }

  clear(): void {
    this.rangeChange.emit(null);
  }

  private emit(from: Date | null, to: Date | null): void {
    if (!from || !to) {
      this.rangeChange.emit(null);
      return;
    }
    this.rangeChange.emit(from <= to ? [from, to] : [to, from]);
  }
}
