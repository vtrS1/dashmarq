import {
  AGE_GROUP_ORDER,
  DISMISSAL_REASON_LABELS,
  DismissalReasonCode,
  EmployeeRecord,
  FilterState,
  GroupTurnover,
  ShiftType,
  TenureWindow,
  TurnoverKPIs,
} from '../models/turnover.model';

export function applyFilters(records: EmployeeRecord[], filters: FilterState): EmployeeRecord[] {
  return records.filter((r) => {
    if (filters.ageGroups.length && !filters.ageGroups.includes(r.ageGroup)) return false;
    if (filters.roles.length && !filters.roles.includes(r.role)) return false;
    if (filters.units.length && !filters.units.includes(r.unit)) return false;
    if (filters.shifts.length && !filters.shifts.includes(r.shift)) return false;
    if (filters.reasons.length && (!r.dismissalReason || !filters.reasons.includes(r.dismissalReason))) {
      return false;
    }
    if (filters.maritalStatuses.length && !filters.maritalStatuses.includes(r.maritalStatus)) return false;
    if (filters.educationLevels.length && !filters.educationLevels.includes(r.educationLevel)) return false;
    if (filters.tenureRangeDays && r.tenureDays != null) {
      const [min, max] = filters.tenureRangeDays;
      if (r.tenureDays < min || r.tenureDays > max) return false;
    }
    if (filters.dismissalDateRange && r.dismissalDate) {
      const [from, to] = filters.dismissalDateRange;
      if (r.dismissalDate < from || r.dismissalDate > to) return false;
    }
    return true;
  });
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function computeKPIs(records: EmployeeRecord[]): TurnoverKPIs {
  const totalEmployees = records.length;
  const dismissed = records.filter((r) => r.isDismissed);
  const totalDismissed = dismissed.length;
  const tenures = dismissed.map((r) => r.tenureDays).filter((t): t is number => t != null);

  const pctOfDismissed = (predicate: (t: number) => boolean) =>
    totalDismissed ? (tenures.filter(predicate).length / totalDismissed) * 100 : 0;

  const contractTerminations = dismissed.filter((r) => r.isContractTermination).length;

  return {
    totalEmployees,
    totalActive: totalEmployees - totalDismissed,
    totalDismissed,
    overallTurnoverRate: totalEmployees ? (totalDismissed / totalEmployees) * 100 : 0,
    avgAgeDismissed: mean(dismissed.map((r) => r.age)),
    avgTenureDays: mean(tenures),
    medianTenureDays: median(tenures),
    dismissedUnder45DaysPct: pctOfDismissed((t) => t <= 45),
    dismissedUnder90DaysPct: pctOfDismissed((t) => t <= 90),
    contractTerminationPct: totalDismissed ? (contractTerminations / totalDismissed) * 100 : 0,
  };
}

function groupTurnoverBy(records: EmployeeRecord[], keyFn: (r: EmployeeRecord) => string): GroupTurnover[] {
  const totals = new Map<string, number>();
  const dismisseds = new Map<string, number>();
  for (const r of records) {
    const key = keyFn(r);
    totals.set(key, (totals.get(key) ?? 0) + 1);
    if (r.isDismissed) dismisseds.set(key, (dismisseds.get(key) ?? 0) + 1);
  }
  return [...totals.entries()].map(([key, total]) => {
    const dismissed = dismisseds.get(key) ?? 0;
    return { key, total, dismissed, turnoverRate: total ? (dismissed / total) * 100 : 0 };
  });
}

export function turnoverByAgeGroup(records: EmployeeRecord[]): GroupTurnover[] {
  const byGroup = groupTurnoverBy(records, (r) => r.ageGroup);
  return AGE_GROUP_ORDER.map(
    (g) => byGroup.find((b) => b.key === g) ?? { key: g, total: 0, dismissed: 0, turnoverRate: 0 },
  );
}

export function turnoverByShift(records: EmployeeRecord[]): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.shift).sort((a, b) => b.total - a.total);
}

export function turnoverByGender(records: EmployeeRecord[]): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.gender).sort((a, b) => b.dismissed - a.dismissed);
}

export function turnoverByMaritalStatus(records: EmployeeRecord[]): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.maritalStatus).sort((a, b) => b.total - a.total);
}

export function turnoverByEducationLevel(records: EmployeeRecord[], topN = 8): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.educationLevel)
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
}

export function turnoverByRole(records: EmployeeRecord[], topN = 8): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.role)
    .sort((a, b) => b.dismissed - a.dismissed)
    .slice(0, topN);
}

export function turnoverByUnit(records: EmployeeRecord[], topN = 8): GroupTurnover[] {
  return groupTurnoverBy(records, (r) => r.unit)
    .sort((a, b) => b.dismissed - a.dismissed)
    .slice(0, topN);
}

export interface DismissalReasonSlice {
  reason: DismissalReasonCode;
  label: string;
  count: number;
  pct: number;
}

export function dismissalReasonBreakdown(records: EmployeeRecord[]): DismissalReasonSlice[] {
  const dismissed = records.filter((r) => r.isDismissed && r.dismissalReason);
  const counts = new Map<DismissalReasonCode, number>();
  for (const r of dismissed) {
    const reason = r.dismissalReason as DismissalReasonCode;
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  const total = dismissed.length;
  return (Object.keys(DISMISSAL_REASON_LABELS) as DismissalReasonCode[])
    .map((reason) => {
      const count = counts.get(reason) ?? 0;
      return { reason, label: DISMISSAL_REASON_LABELS[reason], count, pct: total ? (count / total) * 100 : 0 };
    })
    .sort((a, b) => b.count - a.count);
}

const TENURE_WINDOW_BREAKPOINTS: { label: string; maxDays: number }[] = [
  { label: 'Até 7 dias', maxDays: 7 },
  { label: 'Até 15 dias', maxDays: 15 },
  { label: 'Até 30 dias', maxDays: 30 },
  { label: 'Até 45 dias', maxDays: 45 },
  { label: 'Até 60 dias', maxDays: 60 },
  { label: 'Até 90 dias', maxDays: 90 },
];

/** §2.2 — Curva de permanência acumulada (cada janela inclui as anteriores). */
export function tenureCurve(records: EmployeeRecord[]): TenureWindow[] {
  const dismissed = records.filter((r) => r.isDismissed && r.tenureDays != null);
  const total = dismissed.length;
  return TENURE_WINDOW_BREAKPOINTS.map(({ label, maxDays }) => {
    const count = dismissed.filter((r) => (r.tenureDays as number) <= maxDays).length;
    return { label, maxDays, count, pctOfDismissed: total ? (count / total) * 100 : 0 };
  });
}

export interface TenureBucket {
  label: string;
  count: number;
  pct: number;
}

/** §2.2 — Corte em 3 janelas mutuamente exclusivas (< 45 / 45–90 / > 90 dias). */
export function tenureBuckets(records: EmployeeRecord[]): TenureBucket[] {
  const dismissed = records.filter((r) => r.isDismissed && r.tenureDays != null);
  const total = dismissed.length;
  const under45 = dismissed.filter((r) => (r.tenureDays as number) < 45).length;
  const between = dismissed.filter((r) => (r.tenureDays as number) >= 45 && (r.tenureDays as number) <= 90).length;
  const over90 = total - under45 - between;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  return [
    { label: '< 45 dias', count: under45, pct: pct(under45) },
    { label: '45–90 dias', count: between, pct: pct(between) },
    { label: '> 90 dias', count: over90, pct: pct(over90) },
  ];
}

export interface ContractTerminationConcentration {
  day: number;
  label: string;
  count: number;
  pctOfTerminations: number;
}

/** §2.3 — Concentração dos desligamentos por "Término de Contrato" (T) nos dias 44/45 e 89/90. */
export function contractTerminationConcentration(records: EmployeeRecord[]): {
  total: number;
  points: ContractTerminationConcentration[];
  near45: number;
  near90: number;
} {
  const terminations = records.filter((r) => r.isDismissed && r.isContractTermination && r.tenureDays != null);
  const total = terminations.length;
  const days = [7, 15, 30, 44, 45, 60, 89, 90, 120];
  const countAt = (day: number) => terminations.filter((r) => r.tenureDays === day).length;
  const countOther = total - days.reduce((sum, d) => sum + countAt(d), 0);

  const points: ContractTerminationConcentration[] = [
    ...days.map((day) => ({
      day,
      label: `${day}º dia`,
      count: countAt(day),
      pctOfTerminations: total ? (countAt(day) / total) * 100 : 0,
    })),
    { day: -1, label: 'Outros dias', count: countOther, pctOfTerminations: total ? (countOther / total) * 100 : 0 },
  ];

  const near45 = countAt(44) + countAt(45);
  const near90 = countAt(89) + countAt(90);
  return { total, points, near45, near90 };
}

export function shiftLabel(shift: ShiftType): string {
  return shift === 'Outro' ? 'Não informado' : shift;
}
