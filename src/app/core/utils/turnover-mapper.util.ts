import {
  AgeGroup,
  DISMISSAL_REASON_LABELS,
  DismissalReasonCode,
  EmployeeRecord,
  RawEmployeeRow,
} from '../models/turnover.model';
import { daysBetween, excelSerialToDate } from './excel-date.util';

/**
 * §1.1 — Normalização do `TIPODEMISSAO` (códigos RM Labore).
 *
 * A coluna traz "CÓDIGO-Descrição" (ex.: "2-Inic.Empregador sem justa
 * causa"). O código é o que classifica a linha; a descrição é apenas a forma
 * legível que a própria origem usa (ver nota no `turnover.model.ts` sobre a
 * correção em relação à leitura anterior dos códigos nus).
 */
export function mapDismissalReason(code: string | null): DismissalReasonCode {
  switch (code) {
    case '2':
      return 'EMPRESA_SEM_JUSTA_CAUSA';
    case '1':
      return 'EMPRESA_COM_JUSTA_CAUSA';
    case '4':
      return 'PEDIDO_DEMISSAO';
    case 'T':
      return 'TERMINO_CONTRATO';
    default:
      // '5' (transferência), 'V' (comum acordo), '8' (falecimento),
      // 'N' (rescisão indireta), 'B' (rescisão judicial) ou null.
      return 'OUTROS';
  }
}

/** Extrai o código antes do hífen em "2-Inic.Empregador sem justa causa" → "2". */
export function extractDismissalCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.split('-')[0].trim() || null;
}

export function mapAgeGroup(age: number): AgeGroup {
  if (age <= 24) return '18-24 anos';
  if (age <= 34) return '25-34 anos';
  if (age <= 44) return '35-44 anos';
  if (age <= 54) return '45-54 anos';
  return '55+ anos';
}

function normalizeText(raw: string | null | undefined): string {
  const v = (raw ?? '').trim();
  return v || 'Não informado';
}

const DISMISSED_STATUS = 'Demitido';

/** Maps one raw RM Labore row into a normalized {@link EmployeeRecord}. */
export function mapRawRowToEmployee(row: RawEmployeeRow, index: number): EmployeeRecord | null {
  const admissionDate = excelSerialToDate(row.DATAADMISSAO);
  if (!admissionDate || row.IDADE == null) return null; // linha vazia/incompleta

  const isDismissed = row.SITUACAO === DISMISSED_STATUS;
  const dismissalDate = excelSerialToDate(row.DATADEMISSAO);
  const tenureDays = isDismissed && dismissalDate ? daysBetween(admissionDate, dismissalDate) : null;

  const rawDismissalCode = isDismissed ? row.TIPODEMISSAO : null;
  const dismissalCode = extractDismissalCode(rawDismissalCode);
  const dismissalReason = isDismissed ? mapDismissalReason(dismissalCode) : null;

  return {
    id: row.CHAPA ?? `row-${index}`,
    name: normalizeText(row.FUNCIONARIO),
    admissionDate,
    dismissalDate,
    isDismissed,
    role: normalizeText(row.FUNCAO),
    unit: normalizeText(row.SECAO),
    age: row.IDADE,
    ageGroup: mapAgeGroup(row.IDADE),
    gender: normalizeText(row.SEXO),
    tenureDays,
    rawDismissalCode,
    dismissalCode,
    dismissalReason,
    dismissalReasonLabel: dismissalReason ? DISMISSAL_REASON_LABELS[dismissalReason] : null,
    isContractTermination: dismissalCode === 'T',
  };
}

export function mapRawRowsToEmployees(rows: RawEmployeeRow[]): EmployeeRecord[] {
  const out: EmployeeRecord[] = [];
  rows.forEach((row, i) => {
    const rec = mapRawRowToEmployee(row, i);
    if (rec) out.push(rec);
  });
  return out;
}
