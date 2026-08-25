export interface ChartPalette {
  mode: 'light' | 'dark';
  surface: string;
  textPrimary: string;
  textSecondary: string;
  gridline: string;
  series: string[];
  status: { good: string; warning: string; serious: string; critical: string };
}

/**
 * Brand palette — Marquise Ambiental (public/MARQUISE-AMBIENTAL.jpg).
 * Fundo branco fixo; verde/laranja extraídos do logo (ver src/styles.scss).
 * O 5º slot (cinza) é uma exceção deliberada ao piso de croma do
 * validador — é reservado para a categoria "Outros", que deve mesmo
 * ler como neutra/apagada.
 */
const BRAND: ChartPalette = {
  mode: 'light',
  surface: '#ffffff',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  gridline: '#e6e6e4',
  series: ['#00b454', '#fc5418', '#2a78d6', '#4a3aa7', '#8c887e'],
  status: { good: '#00b454', warning: '#eda100', serious: '#ec835a', critical: '#fc5418' },
};

/** Fixed brand palette — the dashboard always renders on the white/brand theme. */
export function getChartPalette(): ChartPalette {
  return BRAND;
}
