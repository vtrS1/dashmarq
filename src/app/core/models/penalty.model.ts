/**
 * Domain models for the Penalidades (disciplinary actions) dashboard.
 *
 * Source: `PENALIDADES-08.xlsm`, sheet "PENALIDADES 2026". The other sheets
 * ("DADOS FÓRMULA", "TAB. DINÂMICA", "ATIVOS") are helper/pivot sheets from
 * the original workbook, not source records — ignored, see
 * `penalty-mapper.util.ts`.
 *
 * Data-quality notes baked into the mapper (see there for detail):
 * - The sheet's real header row is the 2nd physical row (the 1st is blank).
 * - The "motivo da penalidade" column has a BLANK header cell in the source
 *   file; it's identified by position/content, not invented.
 * - Free-text fields (Função, Setor, Turno, Tipo, Motivo) carry inconsistent
 *   whitespace/casing and two clear typos ("COELTA", "DOMICILAR") — normalized
 *   for grouping, otherwise those would fragment into fake extra categories.
 */

export interface RawPenaltyRow {
  QT: number | null;
  'NOME DO COLABORADOR': string | null;
  'MATRÍCULA': number | null;
  'DATA DE ADMISSÃO': number | null;
  FUNÇÃO: string | null;
  SETOR: string | null;
  TURNO: string | null;
  GESTOR: string | null;
  'TIPO DE PENALIDADE ': string | null;
  'DATA DA PENALIDADE': number | null;
  __EMPTY: string | null; // motivo da penalidade — header em branco na origem
}

export interface Penalty {
  id: string;
  colaborador: string;
  matricula: string | null;
  funcao: string;
  setor: string;
  turno: string;
  gestor: string;
  tipoPenalidade: string;
  motivo: string;
  dataPenalidade: Date;
}

export interface PenaltyGroupCount {
  key: string;
  count: number;
  pct: number;
}

export interface PenaltyKPIs {
  total: number;
  distinctColaboradores: number;
  topSetor: PenaltyGroupCount | null;
  topGestor: PenaltyGroupCount | null;
  topTipo: PenaltyGroupCount | null;
  topMotivo: PenaltyGroupCount | null;
}

export interface WeeklyPenaltyStat {
  weekKey: string; // YYYY-MM-DD (segunda-feira da semana)
  weekLabel: string;
  count: number;
}

export interface PenaltyFilterState {
  funcoes: string[];
  setores: string[];
  turnos: string[];
  gestores: string[];
  tipos: string[];
  motivos: string[];
  dateRange: [Date, Date] | null;
}

export const EMPTY_PENALTY_FILTER_STATE: PenaltyFilterState = {
  funcoes: [],
  setores: [],
  turnos: [],
  gestores: [],
  tipos: [],
  motivos: [],
  dateRange: null,
};
