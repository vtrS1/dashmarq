import type { ApexOptions } from 'apexcharts';
import { GroupTurnover } from '../models/turnover.model';
import { ChartPalette } from './chart-theme.util';

export function baseTheme(palette: ChartPalette): ApexOptions {
  return {
    chart: {
      background: 'transparent',
      foreColor: palette.textSecondary,
      toolbar: { show: false },
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      animations: { speed: 250 },
    },
    theme: { mode: palette.mode },
    grid: { borderColor: palette.gridline, strokeDashArray: 3 },
    tooltip: { theme: palette.mode },
  };
}

/**
 * Ativos vs Desligados por grupo, empilhado (soma = total do grupo) — mesma
 * escala (pessoas), eixo único. A taxa de rotatividade vai como data label
 * sobre o segmento "Desligados" em vez de um segundo eixo.
 */
export function buildGroupTurnoverBarOptions(
  groups: GroupTurnover[],
  palette: ChartPalette,
  opts: { horizontal?: boolean; categoryFormatter?: (key: string) => string } = {},
): ApexOptions {
  const categories = groups.map((g) => opts.categoryFormatter?.(g.key) ?? g.key);
  const ativos = groups.map((g) => g.total - g.dismissed);
  const desligados = groups.map((g) => g.dismissed);
  const rates = groups.map((g) => g.turnoverRate);

  return {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'bar', stacked: true },
    series: [
      { name: 'Ativos', data: ativos },
      { name: 'Desligados', data: desligados },
    ],
    colors: [palette.status.good, palette.status.critical],
    plotOptions: {
      bar: {
        horizontal: !!opts.horizontal,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
        barHeight: '60%',
        dataLabels: { total: { enabled: false } },
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
      formatter: (_val, ctx) => `${rates[ctx?.dataPointIndex ?? 0].toFixed(1)}%`,
      style: { fontSize: '11px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
      offsetX: opts.horizontal ? 4 : 0,
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' } },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: { labels: { style: { colors: palette.textSecondary, fontSize: '11px' } } },
    legend: { position: 'top', horizontalAlign: 'left', labels: { colors: palette.textSecondary }, fontSize: '12px' },
    stroke: { width: 2, colors: [palette.surface] },
  };
}

export function buildDonutOptions(
  labels: string[],
  series: number[],
  colors: string[],
  palette: ChartPalette,
): ApexOptions {
  return {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'donut' },
    series,
    labels,
    colors,
    stroke: { width: 2, colors: [palette.surface] },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: '11px', fontWeight: 600 },
    },
    legend: { position: 'bottom', labels: { colors: palette.textSecondary }, fontSize: '12px' },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            total: { show: true, label: 'Total', color: palette.textSecondary },
          },
        },
      },
    },
  };
}

export function buildAreaCurveOptions(
  categories: string[],
  values: number[],
  palette: ChartPalette,
  opts: { annotationRange?: [string, string]; annotationLabel?: string } = {},
): ApexOptions {
  const options: ApexOptions = {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'area' },
    series: [{ name: '% acumulado de desligados', data: values }],
    colors: [palette.series[0]],
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.35, opacityTo: 0.02, shadeIntensity: 1 },
    },
    markers: { size: 5, strokeWidth: 2, strokeColors: palette.surface, colors: [palette.series[0]] },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${(val as number).toFixed(1)}%`,
      style: { fontSize: '11px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
      offsetY: -8,
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' } },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: {
      max: 100,
      labels: {
        style: { colors: palette.textSecondary, fontSize: '11px' },
        formatter: (v: number) => `${v.toFixed(0)}%`,
      },
    },
    legend: { show: false },
  };

  if (opts.annotationRange) {
    const [x1, x2] = opts.annotationRange;
    options.annotations = {
      xaxis: [
        {
          x: x1,
          x2,
          fillColor: palette.status.warning,
          opacity: 0.12,
          label: {
            text: opts.annotationLabel ?? '',
            style: { color: palette.textPrimary, background: 'transparent' },
            orientation: 'horizontal',
          },
        },
      ],
    };
  }

  return options;
}

export function buildSimpleBarOptions(
  categories: string[],
  values: number[],
  palette: ChartPalette,
  opts: { color?: string; valueSuffix?: string; highlightIndexes?: number[] } = {},
): ApexOptions {
  const baseColor = opts.color ?? palette.series[1];
  const highlight = new Set(opts.highlightIndexes ?? []);
  return {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'bar' },
    series: [{ name: 'Desligamentos', data: values }],
    colors: [baseColor],
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
        distributed: false,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => (val ? `${val}${opts.valueSuffix ?? ''}` : ''),
      offsetY: -18,
      style: { fontSize: '11px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' }, rotate: -45 },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: { labels: { style: { colors: palette.textSecondary, fontSize: '11px' } } },
    legend: { show: false },
    fill: {
      opacity: 1,
    },
    // Highlighted bars (e.g. day 44/45/89/90) get the critical status color.
    ...(highlight.size
      ? {
          plotOptions: {
            bar: {
              borderRadius: 4,
              borderRadiusApplication: 'end',
              columnWidth: '55%',
              distributed: true,
              dataLabels: { position: 'top' },
            },
          },
          colors: values.map((_, i) => (highlight.has(i) ? palette.status.critical : baseColor)),
          legend: { show: false },
        }
      : {}),
  };
}

/** Duas (ou mais) séries de contagem lado a lado (não empilhadas) — mesma escala/unidade. */
export function buildGroupedBarOptions(
  categories: string[],
  series: { name: string; data: number[]; color: string }[],
  palette: ChartPalette,
): ApexOptions {
  return {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'bar', stacked: false },
    series: series.map((s) => ({ name: s.name, data: s.data })),
    colors: series.map((s) => s.color),
    plotOptions: {
      bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '60%', dataLabels: { position: 'top' } },
    },
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: { fontSize: '10px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' } },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: { labels: { style: { colors: palette.textSecondary, fontSize: '11px' } } },
    legend: { position: 'top', horizontalAlign: 'left', labels: { colors: palette.textSecondary }, fontSize: '12px' },
    stroke: { width: 2, colors: [palette.surface] },
  };
}

/** Série única em % por período (ex.: cumprimento de SLA mês a mês), eixo 0–100%. */
export function buildPercentLineOptions(
  categories: string[],
  values: number[],
  palette: ChartPalette,
  opts: { seriesName?: string; color?: string; targetPct?: number } = {},
): ApexOptions {
  const options: ApexOptions = {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'line' },
    series: [{ name: opts.seriesName ?? '% dentro do prazo', data: values }],
    colors: [opts.color ?? palette.status.good],
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 5, strokeWidth: 2, strokeColors: palette.surface, colors: [opts.color ?? palette.status.good] },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${(val as number).toFixed(0)}%`,
      style: { fontSize: '11px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
      offsetY: -8,
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' } },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' }, formatter: (v: number) => `${v.toFixed(0)}%` },
    },
    legend: { show: false },
  };

  if (opts.targetPct != null) {
    options.annotations = {
      yaxis: [
        {
          y: opts.targetPct,
          borderColor: palette.textSecondary,
          strokeDashArray: 4,
          label: {
            text: `Meta ${opts.targetPct}%`,
            style: { color: palette.textSecondary, background: palette.surface },
          },
        },
      ],
    };
  }

  return options;
}

/**
 * Ranking horizontal de categorias por contagem (setor, gestor, motivo, …) —
 * uma série, uma barra por categoria, rótulo com contagem no fim da barra.
 * A categoria de maior ocorrência (índice 0, assumindo entrada já ordenada
 * desc) recebe a cor de destaque; as demais ficam neutras.
 */
export function buildRankedBarOptions(
  categories: string[],
  values: number[],
  palette: ChartPalette,
  opts: { color?: string; highlightColor?: string; highlightTop?: boolean } = {},
): ApexOptions {
  const baseColor = opts.color ?? palette.series[2];
  const highlightTop = opts.highlightTop ?? true;
  const colors = values.map((_, i) => (highlightTop && i === 0 ? (opts.highlightColor ?? palette.series[0]) : baseColor));

  return {
    ...baseTheme(palette),
    chart: { ...baseTheme(palette).chart, type: 'bar' },
    series: [{ name: 'Ocorrências', data: values }],
    colors,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        barHeight: '60%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 4,
      style: { fontSize: '11px', fontWeight: 600, colors: [palette.textPrimary] },
      background: { enabled: false },
    },
    xaxis: {
      categories,
      labels: { style: { colors: palette.textSecondary, fontSize: '11px' } },
      axisBorder: { color: palette.gridline },
      axisTicks: { color: palette.gridline },
    },
    yaxis: { labels: { style: { colors: palette.textSecondary, fontSize: '11px' } } },
    legend: { show: false },
    fill: { opacity: 1 },
  };
}
