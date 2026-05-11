export const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_RESULT: 4,    // "Ganador correcto"
  CORRECT_DIFFERENCE: 3, // "Diferencia de goles"
  STREAK_MAX: 4,         // Max racha multiplier
} as const

export const STAGE_MULTIPLIERS: Record<string, number> = {
  group: 1.0,
  round_of_32: 1.25,
  round_of_16: 1.5,
  quarter: 2.0,
  semi: 2.5,
  third_place: 2.0,
  final: 3.0,
}

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  stage: string,
  streakCount: number = 0
): { exact: number; winner: number; difference: number; streak: number; phase: number; total: number } {
  let exact = 0
  let winner = 0
  let difference = 0
  const phase = STAGE_MULTIPLIERS[stage] || 1.0
  const streak = Math.min(Math.max(streakCount, 1), POINTS.STREAK_MAX)

  if (predictedHome === actualHome && predictedAway === actualAway) {
    // Marcador exacto — no se suman ganador ni diferencia
    exact = POINTS.EXACT_SCORE
  } else {
    const predictedResult = Math.sign(predictedHome - predictedAway)
    const actualResult = Math.sign(actualHome - actualAway)

    if (predictedResult === actualResult) {
      winner = POINTS.CORRECT_RESULT
    }

    const predictedDiff = predictedHome - predictedAway
    const actualDiff = actualHome - actualAway

    if (predictedDiff === actualDiff) {
      difference = POINTS.CORRECT_DIFFERENCE
    }
  }

  // Racha solo aplica a marcadores exactos
  const basePoints = exact > 0
    ? exact * streak
    : winner + difference

  const total = Math.round(basePoints * phase)

  return { exact, winner, difference, streak, phase, total }
}
