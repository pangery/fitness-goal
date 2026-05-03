import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateFitnessGoalRemove } from "../validation/schemas.js";

export function fitnessGoalRemoveCommand(dtoIn) {
  if (!validateFitnessGoalRemove(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  const existing = fitnessGoalDao.get(dtoIn.fitnessGoalId);
  if (!existing) {
    throw createError("fitnessGoalNotFound", ERRORS.fitnessGoalNotFound);
  }

  exerciseDao.removeByFitnessGoalId(dtoIn.fitnessGoalId);
  fitnessGoalDao.remove(dtoIn.fitnessGoalId);

  return { dtoOut: {} };
}
