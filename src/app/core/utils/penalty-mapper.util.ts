import { Penalty, RawPenaltyRow } from '../models/penalty.model';
import { excelSerialToDate } from './excel-date.util';

function clean(raw: string | null | undefined): string {
  return (raw ?? '').trim().toUpperCase();
}

/** Normaliza texto livre + corrige typos conhecidos da planilha de origem (ver models/penalty.model.ts). */
function normalizeSetor(raw: string | null): string {
  const v = clean(raw);
  if (!v) return 'Não informado';
  return v.replace('DOMICILAR', 'DOMICILIAR'); // typo na origem: falta o "I"
}

function normalizeFuncao(raw: string | null): string {
  const v = clean(raw);
  if (!v) return 'Não informado';
  return v === 'AGENTE DE COELTA' ? 'AGENTE DE COLETA' : v; // typo na origem
}

function normalizeSimple(raw: string | null): string {
  const v = clean(raw);
  return v || 'Não informado';
}

export function mapRawRowToPenalty(row: RawPenaltyRow, index: number): Penalty | null {
  const dataPenalidade = excelSerialToDate(row['DATA DA PENALIDADE']);
  if (!row['NOME DO COLABORADOR'] || !dataPenalidade) return null; // linha vazia/placeholder

  return {
    id: `penalty-${index}`,
    colaborador: row['NOME DO COLABORADOR'].trim(),
    matricula: row['MATRÍCULA'] != null ? String(row['MATRÍCULA']) : null,
    funcao: normalizeFuncao(row.FUNÇÃO),
    setor: normalizeSetor(row.SETOR),
    turno: normalizeSimple(row.TURNO),
    gestor: normalizeSimple(row.GESTOR),
    tipoPenalidade: normalizeSimple(row['TIPO DE PENALIDADE ']),
    motivo: normalizeSimple(row.__EMPTY),
    dataPenalidade,
  };
}

export function mapRawRowsToPenalties(rows: RawPenaltyRow[]): Penalty[] {
  const out: Penalty[] = [];
  rows.forEach((row, i) => {
    const p = mapRawRowToPenalty(row, i);
    if (p) out.push(p);
  });
  return out;
}
