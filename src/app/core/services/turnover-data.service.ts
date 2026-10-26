import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { EMPTY_FILTER_STATE, EmployeeRecord, FilterState, RawEmployeeRow } from '../models/turnover.model';
import { applyFilters, computeKPIs } from '../utils/turnover-analytics.util';
import { mapRawRowsToEmployees } from '../utils/turnover-mapper.util';

const DATA_URL = 'data/novoturnover.xlsx';
/** Dados começam na 2ª linha física (índice 1); a 1ª é o cabeçalho. */
const DATA_START_ROW = 1;

/**
 * Cabeçalho posicional: a célula A1 está mesclada com B1/C1 sob o rótulo
 * "Chapa", então o XLSX só expõe o texto do cabeçalho na coluna A — as
 * colunas B e C ficam sem nome e o parser por nome de coluna do SheetJS não
 * encontra os dados (que começam de fato na coluna C). Por isso o layout é
 * mapeado por posição em vez de usar a 1ª linha da planilha como cabeçalho.
 */
const COLUMN_HEADERS = [
  '_IGNORE_A',
  '_IGNORE_B',
  'CHAPA',
  'FUNCIONARIO',
  'DATAADMISSAO',
  'DATADEMISSAO',
  '_IGNORE_SITUACAO_CODE',
  'SITUACAO',
  'FUNCAO',
  'SECAO',
  '_IGNORE_SALARIO',
  '_IGNORE_SECAO_2',
  'DESC_HORARIO',
  '_IGNORE_CPF',
  '_IGNORE_SECAO_CODIGO',
  'IDADE',
  'SEXO',
  'TIPODEMISSAO',
  '_IGNORE_HORARIO',
  '_IGNORE_JORNADA',
  '_IGNORE_CARGO',
  'DTNASCIMENTO',
] as const;

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
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: COLUMN_HEADERS as unknown as string[],
          range: DATA_START_ROW,
          defval: null,
          raw: true,
        }) as unknown as RawEmployeeRow[];
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
