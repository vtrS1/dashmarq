import { HireKind, RawVagaRow, SLA_DIAS_UTEIS, StatusVagaRaw, TipoVaga, Vaga } from '../models/recruitment.model';
import { businessDaysElapsed } from './business-days.util';
import { excelSerialToDate } from './excel-date.util';

const VALID_STATUS: StatusVagaRaw[] = ['FECHADA', 'ABERTA', 'CONGELADA', 'CANCELADA'];
const VALID_TIPOS: TipoVaga[] = ['OPERACIONAL', 'ESTRATEGICA', 'MANUTENCAO'];

function normalizeTipo(raw: string | null): TipoVaga | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v.startsWith('OPERACION')) return 'OPERACIONAL';
  if (v.startsWith('ESTRAT')) return 'ESTRATEGICA';
  if (v.startsWith('MANUTEN')) return 'MANUTENCAO';
  return null;
}

function normalizeStatus(raw: string | null): StatusVagaRaw | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  return (VALID_STATUS as string[]).includes(v) ? (v as StatusVagaRaw) : null;
}

/**
 * Classifica o texto livre de "NOVO COLABORADOR". A planilha usa esse campo
 * também para anotações de status ("VAGA CANCELADA", "SERÁ FECHADA
 * INTERNAMENTE - ..."), não só nomes — por isso a classificação por padrão de
 * texto em vez de tratar qualquer valor não-nulo como uma contratação real.
 */
export function classifyHire(raw: string | null): HireKind {
  if (!raw || !raw.trim()) return 'NENHUM';
  const v = raw.trim().toUpperCase();
  if (v.startsWith('VAGA CANCELADA')) return 'CANCELADA';
  if (v.startsWith('VAGA ')) return 'INDEFINIDO'; // ex.: "VAGA COROADO" — sentido não documentado
  if (v.includes('INTERNA') || v.includes('INTERNO')) return 'INTERNO';
  return 'EXTERNO';
}

export function mapRawRowToVaga(row: RawVagaRow, index: number): Vaga | null {
  const dataRecebimento = excelSerialToDate(row['RECEBIMENTO ']);
  if (!dataRecebimento) return null; // linha vazia (a planilha tem centenas de linhas em branco no final do range)

  const tipoVaga = normalizeTipo(row['TIPO DE VAGA ']);
  const statusVagaRaw = normalizeStatus(row['STATUS DA VAGA']);
  const dataFechamento = excelSerialToDate(row['DATA DE FECHAMENTO ']);
  const slaDiasUteis = tipoVaga ? SLA_DIAS_UTEIS[tipoVaga] : null;

  const bucket = statusVagaRaw === 'FECHADA' ? 'FECHADA' : statusVagaRaw === 'CANCELADA' ? 'EXCLUIDA' : 'ABERTA';
  const isFrozen = statusVagaRaw === 'CONGELADA';

  const datasValidas = !dataFechamento || dataFechamento >= dataRecebimento;
  const referenceEnd = dataFechamento ?? new Date(); // vaga aberta: dias úteis até hoje
  const diasUteis = datasValidas ? businessDaysElapsed(dataRecebimento, referenceEnd) : null;
  const dentroDoPrazo = diasUteis != null && slaDiasUteis != null ? diasUteis <= slaDiasUteis : null;

  const hireNameRaw = row['NOVO COLABORADOR '];
  const hireKind = classifyHire(hireNameRaw);

  return {
    id: `vaga-${index}`,
    cargo: row.CARGO ?? 'Não informado',
    setor: row['SETOR '] ?? 'Não informado',
    motivo: row['MOTIVO DA VAGA ']?.trim() || null,
    tipoVaga,
    statusVagaRaw,
    bucket,
    isFrozen,
    dataRecebimento,
    dataFechamento,
    slaDiasUteis,
    prazoDiasPlanilha: row['PRAZO (DIAS)'],
    datasValidas,
    diasUteis,
    dentroDoPrazo,
    hireKind,
    hireNameRaw: hireNameRaw?.trim() || null,
  };
}

export function mapRawRowsToVagas(rows: RawVagaRow[]): Vaga[] {
  const out: Vaga[] = [];
  rows.forEach((row, i) => {
    const v = mapRawRowToVaga(row, i);
    if (v) out.push(v);
  });
  return out;
}

export { VALID_TIPOS };
