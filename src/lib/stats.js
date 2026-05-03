/**
 * Souhrn statistik z cvičení (čistá funkce — vhodné pro testy).
 * @param {Array<{ sets: number, repetitions: number, fitnessGoalId: string, date: string }>} exerciseList
 * @param {Record<string, { id: string, name: string }>} fitnessGoalMap
 */
export function buildStatsOverview(exerciseList, fitnessGoalMap) {
  let totalRepetitions = 0;
  let totalDurationMinutes = 0;
  /** @type {Map<string, { fitnessGoalId: string, goalName: string, exerciseCount: number, sessionRepetitions: number, durationMinutes: number }>} */
  const agg = new Map();

  for (const ex of exerciseList) {
    const reps = ex.sets * ex.repetitions;
    totalRepetitions += reps;
    const dm =
      "durationMinutes" in ex && ex.durationMinutes != null
        ? Number(ex.durationMinutes)
        : 0;
    if (Number.isFinite(dm) && dm > 0) {
      totalDurationMinutes += dm;
    }

    const goal = fitnessGoalMap[ex.fitnessGoalId];
    const goalName = goal?.name ?? "(unknown goal)";
    let slot = agg.get(ex.fitnessGoalId);
    if (!slot) {
      slot = {
        fitnessGoalId: ex.fitnessGoalId,
        goalName,
        exerciseCount: 0,
        sessionRepetitions: 0,
        durationMinutes: 0,
      };
      agg.set(ex.fitnessGoalId, slot);
    }
    slot.exerciseCount += 1;
    slot.sessionRepetitions += reps;
    if (Number.isFinite(dm) && dm > 0) {
      slot.durationMinutes += dm;
    }
  }

  return {
    totalExercises: exerciseList.length,
    totalSessionRepetitions: totalRepetitions,
    totalDurationMinutes,
    byFitnessGoal: [...agg.values()].sort((a, b) =>
      a.goalName.localeCompare(b.goalName),
    ),
  };
}
