/**
 * Domain models for the turnover/retention dashboard.
 *
 * Business rules encoded here are derived from the `novoturnover.xlsx` source
 * (RM Labore export, replaces the earlier `17.08.XLSX`) — see
 * `core/utils/turnover-mapper.util.ts` for the parsing/normalization logic
 * that produces `EmployeeRecord[]` from the raw spreadsheet rows.
 *
 * IMPORTANT — corrected dismissal-reason mapping: the previous source
 * (`17.08.XLSX`) only exposed bare RM Labore codes ('1', '2', '4', 'T', …)
 * and this dashboard's original mapping guessed at their meaning. The new
 * source spells the meaning out ("2-Inic.Empregador sem justa causa", etc.),
 * and it does **not** match the old guess:
 *   - code '2' is actually EMPLOYER-initiated without just cause (NOT
 *     "Pedido de Demissão" as originally assumed).
 *   - code '1' is EMPLOYER-initiated WITH just cause (NOT "sem justa causa").
 *   - code '4' is EMPLOYEE-initiated (voluntary resignation) — there is no
 *     separate "abandono de emprego" code in this data.
 * The mapping below follows the source's own descriptions.
 */

export type DismissalReasonCode =
  | 'EMPRESA_SEM_JUSTA_CAUSA'
  | 'EMPRESA_COM_JUSTA_CAUSA'
  | 'PEDIDO_DEMISSAO'
  | 'TERMINO_CONTRATO'
  | 'OUTROS';

export type AgeGroup = '18-24 anos' | '25-34 anos' | '35-44 anos' | '45-54 anos' | '55+ anos';

export const AGE_GROUP_ORDER: AgeGroup[] = [
  '18-24 anos',
  '25-34 anos',
  '35-44 anos',
  '45-54 anos',
  '55+ anos',
];

export const DISMISSAL_REASON_LABELS: Record<DismissalReasonCode, string> = {
  EMPRESA_SEM_JUSTA_CAUSA: 'Desligamento pela Empresa (sem justa causa)',
  EMPRESA_COM_JUSTA_CAUSA: 'Desligamento pela Empresa (com justa causa)',
  PEDIDO_DEMISSAO: 'Pedido de Demissão (iniciativa do empregado)',
  TERMINO_CONTRATO: 'Término de Contrato',
  OUTROS: 'Outros Motivos',
};

/**
 * Raw row shape as it comes out of the RM Labore `novoturnover.xlsx` export.
 *
 * As of the 2026-10 export, the sheet's header row (A1:C1) is merged under a
 * single "Chapa" label and columns were renamed/reordered, so the file is
 * parsed with an explicit positional header (see `COLUMN_HEADERS` in
 * `turnover-data.service.ts`) instead of the sheet's own header text. That
 * export also no longer includes TURNO, ESTADOCIVIL or GRAUINSTRUCAO — the
 * shift/marital-status/education-level breakdowns were removed accordingly.
 */
export interface RawEmployeeRow {
  CHAPA: string | null;
  FUNCIONARIO: string | null;
  SITUACAO: string | null;
  DATAADMISSAO: number | null;
  DATADEMISSAO: number | null;
  DESC_HORARIO: string | null;
  SECAO: string | null;
  FUNCAO: string | null;
  TIPODEMISSAO: string | null;
  SEXO: string | null;
  DTNASCIMENTO: number | null;
  IDADE: number | null;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  admissionDate: Date;
  dismissalDate: Date | null;
  isDismissed: boolean;
  role: string;
  unit: string;
  age: number;
  ageGroup: AgeGroup;
  gender: string;
  /** Days between admission and dismissal; null while still active. */
  tenureDays: number | null;
  /** Texto original completo da coluna ("2-Inic.Empregador sem justa causa"). */
  rawDismissalCode: string | null;
  /** Só o código antes do hífen ("2"), usado para classificação/exibição. */
  dismissalCode: string | null;
  dismissalReason: DismissalReasonCode | null;
  dismissalReasonLabel: string | null;
  /** True quando o código é 'T' — término formal de contrato (típico no 45º/90º dia). */
  isContractTermination: boolean;
}

export interface TurnoverKPIs {
  totalEmployees: number;
  /** Colaboradores não desligados (isDismissed === false) — inclui ativos, férias, afastados etc. */
  totalActive: number;
  totalDismissed: number;
  overallTurnoverRate: number;
  avgAgeDismissed: number;
  avgTenureDays: number;
  medianTenureDays: number;
  dismissedUnder45DaysPct: number;
  dismissedUnder90DaysPct: number;
  contractTerminationPct: number;
}

export interface FilterState {
  ageGroups: AgeGroup[];
  roles: string[];
  units: string[];
  reasons: DismissalReasonCode[];
  tenureRangeDays: [number, number] | null;
  /** Restricts to employees dismissed within [from, to] (inclusive). Active employees always pass through. */
  dismissalDateRange: [Date, Date] | null;
}

export const EMPTY_FILTER_STATE: FilterState = {
  ageGroups: [],
  roles: [],
  units: [],
  reasons: [],
  tenureRangeDays: null,
  dismissalDateRange: null,
};

export interface GroupTurnover {
  key: string;
  total: number;
  dismissed: number;
  turnoverRate: number;
}

export interface TenureWindow {
  label: string;
  maxDays: number;
  count: number;
  pctOfDismissed: number;
}
