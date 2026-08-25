import {
  DataQualityReport,
  MonthlyRecruitmentStat,
  RecruitmentFilterState,
  RecruitmentKPIs,
  SLA_DIAS_UTEIS,
  TIPO_VAGA_LABELS,
  TipoVaga,
  TipoVagaStat,
  Vaga,
} from '../models/recruitment.model';

export function applyFilters(vagas: Vaga[], filters: RecruitmentFilterState): Vaga[] {
  return vagas.filter((v) => {
    if (filters.tipos.length && (!v.tipoVaga || !filters.tipos.includes(v.tipoVaga))) return false;
    if (filters.status.length && (!v.statusVagaRaw || !filters.status.includes(v.statusVagaRaw))) return false;
    if (filters.setores.length && !filters.setores.includes(v.setor)) return false;
    if (filters.cargos.length && !filters.cargos.includes(v.cargo)) return false;
    if (filters.recebimentoRange) {
      const [from, to] = filters.recebimentoRange;
      if (v.dataRecebimento < from || v.dataRecebimento > to) return false;
    }
    return true;
  });
}

const MONTH_FMT = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return MONTH_FMT.format(date).replace('.', '');
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeKPIs(vagas: Vaga[]): RecruitmentKPIs {
  const abertas = vagas.filter((v) => v.bucket === 'ABERTA');
  const fechadas = vagas.filter((v) => v.bucket === 'FECHADA');
  const fechadasComPrazo = fechadas.filter((v) => v.dentroDoPrazo != null);
  const dentroSLA = fechadasComPrazo.filter((v) => v.dentroDoPrazo).length;
  const foraSLA = fechadasComPrazo.length - dentroSLA;
  const tempos = fechadas.map((v) => v.diasUteis).filter((d): d is number => d != null);

  return {
    totalAbertas: abertas.length,
    totalFechadas: fechadas.length,
    totalContratadosExterno: fechadas.filter((v) => v.hireKind === 'EXTERNO').length,
    pctDentroSLA: fechadasComPrazo.length ? (dentroSLA / fechadasComPrazo.length) * 100 : 0,
    pctForaSLA: fechadasComPrazo.length ? (foraSLA / fechadasComPrazo.length) * 100 : 0,
    tempoMedioFechamentoDiasUteis: mean(tempos),
    vagasAbertasAcimaSLA: abertas.filter((v) => v.dentroDoPrazo === false).length,
    totalCongeladas: vagas.filter((v) => v.isFrozen).length,
    totalCanceladas: vagas.filter((v) => v.statusVagaRaw === 'CANCELADA').length,
    totalDatasInconsistentes: vagas.filter((v) => !v.datasValidas).length,
  };
}

/** Todo mês entre `from` e `to` (inclusive), início do mês em UTC. */
function monthRange(from: Date, to: Date): Date[] {
  const months: Date[] = [];
  const cur = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cur <= end) {
    months.push(new Date(cur.getTime()));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return months;
}

/**
 * Uma linha por mês, incluindo meses sem nenhum fechamento (zerados) — para
 * não criar um "buraco" silencioso no eixo do tempo do gráfico/indicadores.
 * O intervalo vai do primeiro ao último mês com atividade (recebimento OU
 * fechamento) entre as vagas não excluídas.
 */
export function monthlyClosedStats(vagas: Vaga[]): MonthlyRecruitmentStat[] {
  const relevantDates = vagas
    .filter((v) => v.bucket !== 'EXCLUIDA')
    .flatMap((v) => [v.dataRecebimento, v.dataFechamento].filter((d): d is Date => d != null));
  if (!relevantDates.length) return [];

  const minDate = new Date(Math.min(...relevantDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...relevantDates.map((d) => d.getTime())));

  const fechadas = vagas.filter((v) => v.bucket === 'FECHADA' && v.dataFechamento);
  const byMonth = new Map<string, Vaga[]>();
  for (const v of fechadas) {
    const key = monthKey(v.dataFechamento as Date);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(v);
  }

  return monthRange(minDate, maxDate).map((monthStart) => {
    const key = monthKey(monthStart);
    const group = byMonth.get(key) ?? [];
    const dentro = group.filter((v) => v.dentroDoPrazo === true).length;
    const fora = group.filter((v) => v.dentroDoPrazo === false).length;
    const inconsistentes = group.filter((v) => v.dentroDoPrazo == null).length;
    const contratados = group.filter((v) => v.hireKind === 'EXTERNO').length;
    const comPrazo = dentro + fora;
    return {
      monthKey: key,
      monthLabel: monthLabel(monthStart),
      fechadas: group.length,
      contratados,
      dentroDoPrazo: dentro,
      foraDoPrazo: fora,
      inconsistentes,
      pctDentroDoPrazo: comPrazo ? (dentro / comPrazo) * 100 : 0,
      mediaContratadosPorVaga: group.length ? contratados / group.length : 0,
    };
  });
}

export function statsByTipo(vagas: Vaga[]): TipoVagaStat[] {
  const tipos: TipoVaga[] = ['OPERACIONAL', 'ESTRATEGICA', 'MANUTENCAO'];
  return tipos.map((tipo) => {
    const doTipo = vagas.filter((v) => v.tipoVaga === tipo);
    const fechadas = doTipo.filter((v) => v.bucket === 'FECHADA');
    const abertas = doTipo.filter((v) => v.bucket === 'ABERTA');
    const tempos = fechadas.map((v) => v.diasUteis).filter((d): d is number => d != null);
    const comPrazo = fechadas.filter((v) => v.dentroDoPrazo != null);
    const dentro = comPrazo.filter((v) => v.dentroDoPrazo).length;
    return {
      tipo,
      label: TIPO_VAGA_LABELS[tipo],
      totalFechadas: fechadas.length,
      totalAbertas: abertas.length,
      tempoMedioDiasUteis: mean(tempos),
      pctDentroSLA: comPrazo.length ? (dentro / comPrazo.length) * 100 : 0,
    };
  });
}

export interface OpenVagaRow {
  id: string;
  cargo: string;
  setor: string;
  tipoLabel: string;
  diasUteis: number;
  slaDiasUteis: number | null;
  acimaSLA: boolean | null;
  isFrozen: boolean;
}

export function openVagasList(vagas: Vaga[]): OpenVagaRow[] {
  return vagas
    .filter((v) => v.bucket === 'ABERTA' && v.diasUteis != null)
    .sort((a, b) => (b.diasUteis as number) - (a.diasUteis as number))
    .map((v) => ({
      id: v.id,
      cargo: v.cargo,
      setor: v.setor,
      tipoLabel: v.tipoVaga ? TIPO_VAGA_LABELS[v.tipoVaga] : 'Não informado',
      diasUteis: v.diasUteis as number,
      slaDiasUteis: v.slaDiasUteis,
      acimaSLA: v.dentroDoPrazo == null ? null : !v.dentroDoPrazo,
      isFrozen: v.isFrozen,
    }));
}

export function dataQualityReport(vagas: Vaga[]): DataQualityReport {
  const fechadas = vagas.filter((v) => v.bucket === 'FECHADA');
  const slaDivergente = vagas.filter(
    (v) => v.tipoVaga && v.prazoDiasPlanilha != null && v.prazoDiasPlanilha !== SLA_DIAS_UTEIS[v.tipoVaga],
  ).length;

  return {
    totalRows: vagas.length,
    datasInconsistentes: vagas.filter((v) => !v.datasValidas).length,
    congeladas: vagas.filter((v) => v.isFrozen).length,
    canceladas: vagas.filter((v) => v.statusVagaRaw === 'CANCELADA').length,
    fechadaSemContratacaoExterna: fechadas.filter((v) => v.hireKind !== 'EXTERNO').length,
    manutencaoSemDados: vagas.every((v) => v.tipoVaga !== 'MANUTENCAO'),
    slaDivergente,
  };
}

export interface RecruitmentDiagnostics {
  bestMonth: MonthlyRecruitmentStat | null;
  worstMonth: MonthlyRecruitmentStat | null;
  bestHireMonth: MonthlyRecruitmentStat | null;
  hardestTipo: TipoVagaStat | null;
  pressureMonth: { monthLabel: string; count: number } | null;
}

export function computeDiagnostics(vagas: Vaga[], monthly: MonthlyRecruitmentStat[], byTipo: TipoVagaStat[]): RecruitmentDiagnostics {
  const withVolume = monthly.filter((m) => m.fechadas > 0);
  const bestMonth = withVolume.length ? withVolume.reduce((a, b) => (b.fechadas > a.fechadas ? b : a)) : null;
  const worstMonth = withVolume.length ? withVolume.reduce((a, b) => (b.fechadas < a.fechadas ? b : a)) : null;
  const bestHireMonth = withVolume.length ? withVolume.reduce((a, b) => (b.contratados > a.contratados ? b : a)) : null;

  const tiposComVolume = byTipo.filter((t) => t.totalFechadas > 0);
  const hardestTipo = tiposComVolume.length
    ? tiposComVolume.reduce((a, b) => (b.pctDentroSLA < a.pctDentroSLA ? b : a))
    : null;

  // Pressão de demanda: mês com mais vagas RECEBIDAS (independente de terem fechado).
  const byRecebMonth = new Map<string, { label: string; count: number }>();
  for (const v of vagas) {
    if (v.bucket === 'EXCLUIDA') continue;
    const key = monthKey(v.dataRecebimento);
    const label = monthLabel(v.dataRecebimento);
    const entry = byRecebMonth.get(key) ?? { label, count: 0 };
    entry.count++;
    byRecebMonth.set(key, entry);
  }
  const pressureEntry = [...byRecebMonth.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    bestMonth,
    worstMonth,
    bestHireMonth,
    hardestTipo,
    pressureMonth: pressureEntry ? { monthLabel: pressureEntry.label, count: pressureEntry.count } : null,
  };
}
