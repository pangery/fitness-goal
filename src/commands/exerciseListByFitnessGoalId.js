import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseListByGoalDtoIn } from "../validation/schemas.js";

/**
 * @param {Record<string, unknown>} dtoIn
 */
export function exerciseListByFitnessGoalIdCommand(dtoIn) {
  if (!validateExerciseListByGoalDtoIn(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  const goal = fitnessGoalDao.get(dtoIn.fitnessGoalId);
  if (!goal) {
    throw createError("fitnessGoalNotFound", ERRORS.fitnessGoalNotFound);
  }

  const { exerciseList } = exerciseDao.listByFitnessGoalId(dtoIn.fitnessGoalId);
  return {
    dtoOut: {
      fitnessGoal: goal,
      exerciseList,
    },
  };
}
