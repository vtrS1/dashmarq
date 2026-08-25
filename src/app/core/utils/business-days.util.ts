/**
 * Dias úteis decorridos entre duas datas (exclui sábado/domingo; não considera
 * feriados — não solicitado). Convenção: exclusivo em `from`, inclusivo em
 * `to` — "quantos dias úteis se passaram desde `from` até `to`".
 * Retorna 0 quando `to <= from`.
 */
export function businessDaysElapsed(from: Date, to: Date): number {
  const cur = new Date(from.getTime());
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(to.getTime());
  end.setUTCHours(0, 0, 0, 0);
  if (end <= cur) return 0;

  let count = 0;
  cur.setUTCDate(cur.getUTCDate() + 1);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}
