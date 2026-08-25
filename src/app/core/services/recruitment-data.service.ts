import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { EMPTY_RECRUITMENT_FILTER_STATE, RawVagaRow, RecruitmentFilterState, Vaga } from '../models/recruitment.model';
import {
  applyFilters,
  computeDiagnostics,
  computeKPIs,
  dataQualityReport,
  monthlyClosedStats,
  openVagasList,
  statsByTipo,
} from '../utils/recruitment-analytics.util';
import { mapRawRowsToVagas } from '../utils/recruitment-mapper.util';

const DATA_URL = 'data/VAGAS-2026.xlsx';
const SHEET_NAME = 'GERAL';

@Injectable({ providedIn: 'root' })
export class RecruitmentDataService {
  private readonly http = inject(HttpClient);

  private readonly _vagas = signal<Vaga[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<RecruitmentFilterState>(EMPTY_RECRUITMENT_FILTER_STATE);
  private loadPromise: Promise<void> | null = null;

  readonly vagas = this._vagas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly filteredVagas = computed(() => applyFilters(this._vagas(), this._filters()));

  readonly kpis = computed(() => computeKPIs(this.filteredVagas()));
  readonly monthly = computed(() => monthlyClosedStats(this.filteredVagas()));
  readonly byTipo = computed(() => statsByTipo(this.filteredVagas()));
  readonly openVagas = computed(() => openVagasList(this.filteredVagas()));
  readonly diagnostics = computed(() => computeDiagnostics(this.filteredVagas(), this.monthly(), this.byTipo()));
  readonly dataQuality = computed(() => dataQualityReport(this.filteredVagas()));

  readonly availableSetores = computed(() =>
    [...new Set(this._vagas().map((v) => v.setor))].sort((a, b) => a.localeCompare(b)),
  );
  readonly availableCargos = computed(() =>
    [...new Set(this._vagas().map((v) => v.cargo))].sort((a, b) => a.localeCompare(b)),
  );
  readonly recebimentoBounds = computed<[Date, Date] | null>(() => {
    const dates = this._vagas().map((v) => v.dataRecebimento);
    if (!dates.length) return null;
    return [new Date(Math.min(...dates.map((d) => d.getTime()))), new Date(Math.max(...dates.map((d) => d.getTime())))];
  });

  load(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this._loading.set(true);
    this._error.set(null);

    this.loadPromise = firstValueFrom(this.http.get(DATA_URL, { responseType: 'arraybuffer' }))
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
        const sheet = workbook.Sheets[SHEET_NAME];
        const rows = XLSX.utils.sheet_to_json<RawVagaRow>(sheet, { defval: null, raw: true });
        this._vagas.set(mapRawRowsToVagas(rows));
      })
      .catch((err) => {
        console.error('Falha ao carregar a base de vagas', err);
        this._error.set('Não foi possível carregar a base de dados (VAGAS-2026.xlsx).');
      })
      .finally(() => this._loading.set(false));

    return this.loadPromise;
  }

  updateFilters(patch: Partial<RecruitmentFilterState>): void {
    this._filters.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this._filters.set(EMPTY_RECRUITMENT_FILTER_STATE);
  }
}
