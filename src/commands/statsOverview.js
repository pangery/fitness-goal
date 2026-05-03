import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseListDtoIn } from "../validation/schemas.js";
import { buildStatsOverview } from "../lib/stats.js";

/**
 * Stejný filtr měsíce jako `exercise/list` (oba parametry nebo žádný).
 * @param {Record<string, unknown>} dtoIn
 */
export function statsOverviewCommand(dtoIn) {
  if (!validateExerciseListDtoIn(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  const hasYear = dtoIn.year !== undefined;
  const hasMonth = dtoIn.month !== undefined;
  if (hasYear !== hasMonth) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  /** @type {{ year?: number, month?: number }} */
  const filter = {};
  if (hasYear && hasMonth) {
    filter.year = /** @type {number} */ (dtoIn.year);
    filter.month = /** @type {number} */ (dtoIn.month);
  }

  const { exerciseList } = exerciseDao.list(filter);
  const fitnessGoalMap = fitnessGoalDao.getFitnessGoalMap();
  const summary = buildStatsOverview(exerciseList, fitnessGoalMap);

  return {
    dtoOut: {
      filter: hasYear && hasMonth ? { year: filter.year, month: filter.month } : null,
      ...summary,
    },
  };
}
