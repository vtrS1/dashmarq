/**
 * Domain models for the Recrutamento & Seleção dashboard.
 *
 * Source: `VAGAS-2026.xlsx`, sheet "GERAL" (the "PLAN SUPORTE" sheet is an
 * unrelated holiday/date-lookup helper table and "MANAUS" belongs to a
 * different company — both are ignored, see `recruitment-mapper.util.ts`).
 */

export type TipoVaga = 'OPERACIONAL' | 'ESTRATEGICA' | 'MANUTENCAO';

/** SLA fixo por tipo de vaga, em dias úteis (definido pelo negócio, não pela planilha). */
export const SLA_DIAS_UTEIS: Record<TipoVaga, number> = {
  OPERACIONAL: 15,
  ESTRATEGICA: 30,
  MANUTENCAO: 30,
};

export const TIPO_VAGA_LABELS: Record<TipoVaga, string> = {
  OPERACIONAL: 'Operacional',
  ESTRATEGICA: 'Estratégica',
  MANUTENCAO: 'Manutenção',
};

/** Status bruto exatamente como vem da coluna "STATUS DA VAGA". */
export type StatusVagaRaw = 'FECHADA' | 'ABERTA' | 'CONGELADA' | 'CANCELADA';

/**
 * Bucket normalizado para as duas categorias que o negócio acompanha.
 * CONGELADA entra em ABERTA (não tem data de fechamento) mas fica marcada via
 * `isFrozen`. CANCELADA fica de fora de ambas — não é fechamento nem vaga
 * ativa — e é reportada à parte no diagnóstico de qualidade de dados.
 */
export type StatusBucket = 'FECHADA' | 'ABERTA' | 'EXCLUIDA';

/** Como o texto livre de "NOVO COLABORADOR" foi classificado. */
export type HireKind = 'EXTERNO' | 'INTERNO' | 'CANCELADA' | 'INDEFINIDO' | 'NENHUM';

export interface RawVagaRow {
  'RECEBIMENTO ': number | null;
  CARGO: string | null;
  'SETOR ': string | null;
  'MOTIVO DA VAGA ': string | null;
  'NOVO COLABORADOR ': string | null;
  'STATUS DA VAGA': string | null;
  'TIPO DE VAGA ': string | null;
  'PRAZO (DIAS)': number | null;
  'DATA DE FECHAMENTO ': number | null;
}

export interface Vaga {
  id: string;
  cargo: string;
  setor: string;
  motivo: string | null;
  tipoVaga: TipoVaga | null;
  statusVagaRaw: StatusVagaRaw | null;
  bucket: StatusBucket;
  isFrozen: boolean;
  dataRecebimento: Date;
  dataFechamento: Date | null;
  slaDiasUteis: number | null;
  /** Valor bruto da coluna "PRAZO (DIAS)" da planilha, para detectar divergência com o SLA fixo por tipo. */
  prazoDiasPlanilha: number | null;
  /** false quando a Data de Fechamento é anterior à Data de Recebimento (erro de digitação na origem). */
  datasValidas: boolean;
  /** Dias úteis decorridos entre recebimento e fechamento (ou hoje, se em aberto). Null quando `datasValidas` é false. */
  diasUteis: number | null;
  dentroDoPrazo: boolean | null;
  hireKind: HireKind;
  hireNameRaw: string | null;
}

export interface RecruitmentKPIs {
  totalAbertas: number;
  totalFechadas: number;
  totalContratadosExterno: number;
  pctDentroSLA: number;
  pctForaSLA: number;
  tempoMedioFechamentoDiasUteis: number;
  vagasAbertasAcimaSLA: number;
  totalCongeladas: number;
  totalCanceladas: number;
  totalDatasInconsistentes: number;
}

export interface MonthlyRecruitmentStat {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  fechadas: number;
  contratados: number;
  dentroDoPrazo: number;
  foraDoPrazo: number;
  inconsistentes: number;
  pctDentroDoPrazo: number;
  mediaContratadosPorVaga: number;
}

export interface DataQualityReport {
  totalRows: number;
  datasInconsistentes: number;
  congeladas: number;
  canceladas: number;
  fechadaSemContratacaoExterna: number;
  manutencaoSemDados: boolean;
  slaDivergente: number;
}

export interface TipoVagaStat {
  tipo: TipoVaga;
  label: string;
  totalFechadas: number;
  totalAbertas: number;
  tempoMedioDiasUteis: number;
  pctDentroSLA: number;
}

export interface RecruitmentFilterState {
  tipos: TipoVaga[];
  status: StatusVagaRaw[];
  setores: string[];
  cargos: string[];
  /** Filtra por "RECEBIMENTO" dentro de [from, to] (inclusive). */
  recebimentoRange: [Date, Date] | null;
}

export const EMPTY_RECRUITMENT_FILTER_STATE: RecruitmentFilterState = {
  tipos: [],
  status: [],
  setores: [],
  cargos: [],
  recebimentoRange: null,
};
