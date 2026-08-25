import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';

/** Searchable multi-select dropdown for long option lists (role, unit, …). */
@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  readonly label = input.required<string>();
  readonly options = input.required<string[]>();
  readonly selected = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly query = signal('');

  readonly filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const opts = this.options();
    return q ? opts.filter((o) => o.toLowerCase().includes(q)) : opts;
  });

  readonly summary = computed(() => {
    const n = this.selected().length;
    return n === 0 ? 'Todos' : `${n} selecionado${n > 1 ? 's' : ''}`;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  toggleOpen(): void {
    this.open.update((v) => !v);
  }

  isSelected(value: string): boolean {
    return this.selected().includes(value);
  }

  toggle(value: string): void {
    const current = this.selected();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.selectionChange.emit(next);
  }

  clear(): void {
    this.selectionChange.emit([]);
  }
}
