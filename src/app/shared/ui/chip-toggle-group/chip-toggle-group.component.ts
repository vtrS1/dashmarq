import { Component, input, output } from '@angular/core';

export interface ChipOption {
  value: string;
  label: string;
}

/** Small fixed-enumeration multi-toggle (age group, shift, dismissal reason, …). */
@Component({
  selector: 'app-chip-toggle-group',
  templateUrl: './chip-toggle-group.component.html',
  styleUrl: './chip-toggle-group.component.scss',
})
export class ChipToggleGroupComponent {
  readonly label = input.required<string>();
  readonly options = input.required<ChipOption[]>();
  readonly selected = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  isSelected(value: string): boolean {
    return this.selected().includes(value);
  }

  toggle(value: string): void {
    const current = this.selected();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.selectionChange.emit(next);
  }
}
