import { createError, ERRORS } from "../errors.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseRemove } from "../validation/schemas.js";

export function exerciseRemoveCommand(dtoIn) {
  if (!validateExerciseRemove(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  const existing = exerciseDao.get(dtoIn.exerciseId);
  if (!existing) {
    throw createError("exerciseNotFound", ERRORS.exerciseNotFound);
  }

  exerciseDao.remove(dtoIn.exerciseId);
  return { dtoOut: {} };
}
