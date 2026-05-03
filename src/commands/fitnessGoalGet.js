import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";

export function fitnessGoalGetCommand(fitnessGoalId) {
  if (!fitnessGoalId || typeof fitnessGoalId !== "string") {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  const goal = fitnessGoalDao.get(fitnessGoalId);
  if (!goal) {
    throw createError("fitnessGoalNotFound", ERRORS.fitnessGoalNotFound);
  }

  return { dtoOut: goal };
}
