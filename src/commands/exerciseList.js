import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseListDtoIn } from "../validation/schemas.js";

/**
 * @param {Record<string, unknown>} dtoIn
 */
export function exerciseListCommand(dtoIn) {
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

  return {
    dtoOut: {
      exerciseList,
      fitnessGoalMap,
    },
  };
}
