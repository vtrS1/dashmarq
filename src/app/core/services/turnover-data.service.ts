import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { EMPTY_FILTER_STATE, EmployeeRecord, FilterState, RawEmployeeRow } from '../models/turnover.model';
import { applyFilters, computeKPIs } from '../utils/turnover-analytics.util';
import { mapRawRowsToEmployees } from '../utils/turnover-mapper.util';

const DATA_URL = 'data/novoturnover.xlsx';
/** A 1ª linha física da planilha está em branco; o cabeçalho real é a 2ª linha. */
const HEADER_ROW_OFFSET = 1;

@Injectable({ providedIn: 'root' })
export class TurnoverDataService {
  private readonly http = inject(HttpClient);

  private readonly _records = signal<EmployeeRecord[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<FilterState>(EMPTY_FILTER_STATE);
  private loadPromise: Promise<void> | null = null;

  readonly records = this._records.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly filteredRecords = computed(() => applyFilters(this._records(), this._filters()));
  readonly kpis = computed(() => computeKPIs(this.filteredRecords()));

  readonly availableRoles = computed(() =>
    [...new Set(this._records().map((r) => r.role))].sort((a, b) => a.localeCompare(b)),
  );
  readonly availableUnits = computed(() =>
    [...new Set(this._records().map((r) => r.unit))].sort((a, b) => a.localeCompare(b)),
  );
  readonly availableMaritalStatuses = computed(() =>
    [...new Set(this._records().map((r) => r.maritalStatus))].sort((a, b) => a.localeCompare(b)),
  );
  readonly availableEducationLevels = computed(() =>
    [...new Set(this._records().map((r) => r.educationLevel))].sort((a, b) => a.localeCompare(b)),
  );

  readonly dismissalDateBounds = computed<[Date, Date] | null>(() => {
    const dates = this._records()
      .map((r) => r.dismissalDate)
      .filter((d): d is Date => d != null);
    if (!dates.length) return null;
    return [new Date(Math.min(...dates.map((d) => d.getTime()))), new Date(Math.max(...dates.map((d) => d.getTime())))];
  });

  /** Loads and parses the source spreadsheet exactly once; safe to call from multiple components. */
  load(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this._loading.set(true);
    this._error.set(null);

    this.loadPromise = firstValueFrom(this.http.get(DATA_URL, { responseType: 'arraybuffer' }))
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<RawEmployeeRow>(sheet, {
          range: HEADER_ROW_OFFSET,
          defval: null,
          raw: true,
        });
        this._records.set(mapRawRowsToEmployees(rows));
      })
      .catch((err) => {
        console.error('Falha ao carregar a base de turnover', err);
        this._error.set('Não foi possível carregar a base de dados (novoturnover.xlsx).');
      })
      .finally(() => this._loading.set(false));

    return this.loadPromise;
  }

  setFilters(filters: FilterState): void {
    this._filters.set(filters);
  }

  updateFilters(patch: Partial<FilterState>): void {
    this._filters.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this._filters.set(EMPTY_FILTER_STATE);
  }
}
