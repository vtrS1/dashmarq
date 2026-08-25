import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { EMPTY_PENALTY_FILTER_STATE, Penalty, PenaltyFilterState, RawPenaltyRow } from '../models/penalty.model';
import {
  applyFilters,
  byFuncao as groupByFuncao,
  byGestor as groupByGestor,
  byMotivo as groupByMotivo,
  bySetor as groupBySetor,
  byTipo as groupByTipo,
  byTurno as groupByTurno,
  computeKPIs,
  weeklyEvolution,
} from '../utils/penalty-analytics.util';
import { mapRawRowsToPenalties } from '../utils/penalty-mapper.util';

const DATA_URL = 'data/PENALIDADES-08.xlsm';
const SHEET_NAME = 'PENALIDADES 2026';
/** A 1ª linha física da planilha está em branco; o cabeçalho real é a 2ª linha. */
const HEADER_ROW_OFFSET = 1;

@Injectable({ providedIn: 'root' })
export class PenaltyDataService {
  private readonly http = inject(HttpClient);

  private readonly _penalties = signal<Penalty[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<PenaltyFilterState>(EMPTY_PENALTY_FILTER_STATE);
  private loadPromise: Promise<void> | null = null;

  readonly penalties = this._penalties.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly filteredPenalties = computed(() => applyFilters(this._penalties(), this._filters()));

  readonly kpis = computed(() => computeKPIs(this.filteredPenalties()));
  readonly bySetor = computed(() => groupBySetor(this.filteredPenalties()));
  readonly byTurno = computed(() => groupByTurno(this.filteredPenalties()));
  readonly byGestor = computed(() => groupByGestor(this.filteredPenalties()));
  readonly byTipo = computed(() => groupByTipo(this.filteredPenalties()));
  readonly byMotivo = computed(() => groupByMotivo(this.filteredPenalties()));
  readonly byFuncao = computed(() => groupByFuncao(this.filteredPenalties()));
  readonly evolution = computed(() => weeklyEvolution(this.filteredPenalties()));

  readonly availableFuncoes = computed(() => this.distinct((p) => p.funcao));
  readonly availableSetores = computed(() => this.distinct((p) => p.setor));
  readonly availableTurnos = computed(() => this.distinct((p) => p.turno));
  readonly availableGestores = computed(() => this.distinct((p) => p.gestor));
  readonly availableTipos = computed(() => this.distinct((p) => p.tipoPenalidade));
  readonly availableMotivos = computed(() => this.distinct((p) => p.motivo));

  readonly dateBounds = computed<[Date, Date] | null>(() => {
    const dates = this._penalties().map((p) => p.dataPenalidade);
    if (!dates.length) return null;
    return [new Date(Math.min(...dates.map((d) => d.getTime()))), new Date(Math.max(...dates.map((d) => d.getTime())))];
  });

  private distinct(keyFn: (p: Penalty) => string): string[] {
    return [...new Set(this._penalties().map(keyFn))].sort((a, b) => a.localeCompare(b));
  }

  load(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this._loading.set(true);
    this._error.set(null);

    this.loadPromise = firstValueFrom(this.http.get(DATA_URL, { responseType: 'arraybuffer' }))
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
        const sheet = workbook.Sheets[SHEET_NAME];
        const rows = XLSX.utils.sheet_to_json<RawPenaltyRow>(sheet, {
          range: HEADER_ROW_OFFSET,
          defval: null,
          raw: true,
        });
        this._penalties.set(mapRawRowsToPenalties(rows));
      })
      .catch((err) => {
        console.error('Falha ao carregar a base de penalidades', err);
        this._error.set('Não foi possível carregar a base de dados (PENALIDADES-08.xlsm).');
      })
      .finally(() => this._loading.set(false));

    return this.loadPromise;
  }

  updateFilters(patch: Partial<PenaltyFilterState>): void {
    this._filters.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this._filters.set(EMPTY_PENALTY_FILTER_STATE);
  }
}
