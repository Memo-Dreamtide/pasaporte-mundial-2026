export const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_RESULT: 4,
  CORRECT_DIFFERENCE: 3,
  SCORER_BONUS: 5,
  STREAK_BONUS: 3,
  STREAK_MINIMUM: 3,
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
  predictedScorer: string | null,
  actualScorers: string[],
  stage: string
): number {
  let points = 0
  const multiplier = STAGE_MULTIPLIERS[stage] || 1.0

  if (predictedHome === actualHome && predictedAway === actualAway) {
    points += POINTS.EXACT_SCORE
  } else {
    const predictedResult = Math.sign(predictedHome - predictedAway)
    const actualResult = Math.sign(actualHome - actualAway)

    if (predictedResult === actualResult) {
      points += POINTS.CORRECT_RESULT
    }

    const predictedDiff = predictedHome - predictedAway
    const actualDiff = actualHome - actualAway

    if (predictedDiff === actualDiff) {
      points += POINTS.CORRECT_DIFFERENCE
    }
  }

  if (
    predictedScorer &&
    actualScorers.some(
      (s) => s.toLowerCase() === predictedScorer.toLowerCase()
    )
  ) {
    points += POINTS.SCORER_BONUS
  }

  return Math.round(points * multiplier)
}
