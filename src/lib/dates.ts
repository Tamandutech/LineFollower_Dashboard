/**
 * Retorna a diferença de tempo em minutos entre a data atual e a data passada como parâmetro.
 *
 * @param {Date} date Data para calcular a diferença de tempo.
 * @returns {Number} Diferença de tempo em minutos.
 */
export function calculateTimeDifferenceInMinutes(date: Date): number {
  return Math.round((new Date().getTime() - date.getTime()) / (1000 * 60));
}
