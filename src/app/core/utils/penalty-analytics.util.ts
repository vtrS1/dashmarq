import { Penalty, PenaltyFilterState, PenaltyGroupCount, PenaltyKPIs, WeeklyPenaltyStat } from '../models/penalty.model';

export function applyFilters(penalties: Penalty[], filters: PenaltyFilterState): Penalty[] {
  return penalties.filter((p) => {
    if (filters.funcoes.length && !filters.funcoes.includes(p.funcao)) return false;
    if (filters.setores.length && !filters.setores.includes(p.setor)) return false;
    if (filters.turnos.length && !filters.turnos.includes(p.turno)) return false;
    if (filters.gestores.length && !filters.gestores.includes(p.gestor)) return false;
    if (filters.tipos.length && !filters.tipos.includes(p.tipoPenalidade)) return false;
    if (filters.motivos.length && !filters.motivos.includes(p.motivo)) return false;
    if (filters.dateRange) {
      const [from, to] = filters.dateRange;
      if (p.dataPenalidade < from || p.dataPenalidade > to) return false;
    }
    return true;
  });
}

function groupCount(penalties: Penalty[], keyFn: (p: Penalty) => string): PenaltyGroupCount[] {
  const total = penalties.length;
  const counts = new Map<string, number>();
  for (const p of penalties) {
    const key = keyFn(p);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, pct: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

export const bySetor = (penalties: Penalty[]) => groupCount(penalties, (p) => p.setor);
export const byTurno = (penalties: Penalty[]) => groupCount(penalties, (p) => p.turno);
export const byGestor = (penalties: Penalty[]) => groupCount(penalties, (p) => p.gestor);
export const byTipo = (penalties: Penalty[]) => groupCount(penalties, (p) => p.tipoPenalidade);
export const byMotivo = (penalties: Penalty[]) => groupCount(penalties, (p) => p.motivo);
export const byFuncao = (penalties: Penalty[]) => groupCount(penalties, (p) => p.funcao);

export function computeKPIs(penalties: Penalty[]): PenaltyKPIs {
  const top = (list: PenaltyGroupCount[]) => list[0] ?? null;
  return {
    total: penalties.length,
    distinctColaboradores: new Set(penalties.map((p) => p.matricula ?? p.colaborador)).size,
    topSetor: top(bySetor(penalties)),
    topGestor: top(byGestor(penalties)),
    topTipo: top(byTipo(penalties)),
    topMotivo: top(byMotivo(penalties)),
  };
}

const WEEK_LABEL_FMT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

/** Início da semana (segunda-feira, UTC) para a data informada. */
function weekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay(); // 0 = domingo
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

/**
 * Uma linha por semana (segunda a domingo), incluindo semanas sem nenhuma
 * penalidade (zeradas), do início ao fim do período coberto pelos dados —
 * para a "evolução ao longo do período" não esconder semanas de silêncio.
 */
export function weeklyEvolution(penalties: Penalty[]): WeeklyPenaltyStat[] {
  if (!penalties.length) return [];

  const dates = penalties.map((p) => p.dataPenalidade);
  const firstWeek = weekStart(new Date(Math.min(...dates.map((d) => d.getTime()))));
  const lastWeek = weekStart(new Date(Math.max(...dates.map((d) => d.getTime()))));

  const counts = new Map<string, number>();
  for (const p of penalties) {
    const key = weekStart(p.dataPenalidade).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const weeks: WeeklyPenaltyStat[] = [];
  const cur = new Date(firstWeek.getTime());
  while (cur <= lastWeek) {
    const key = cur.toISOString().slice(0, 10);
    weeks.push({ weekKey: key, weekLabel: WEEK_LABEL_FMT.format(cur), count: counts.get(key) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 7);
  }
  return weeks;
}
