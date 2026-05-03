import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseCreate } from "../validation/schemas.js";
import { isExerciseDateAllowed } from "../lib/date.js";

export function exerciseCreateCommand(dtoIn) {
  if (!validateExerciseCreate(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  if (!isExerciseDateAllowed(dtoIn.date)) {
    throw createError("invalidDate", ERRORS.invalidDate);
  }

  const goal = fitnessGoalDao.get(dtoIn.fitnessGoalId);
  if (!goal) {
    throw createError("fitnessGoalDoesNotExist", ERRORS.fitnessGoalDoesNotExist);
  }

  /** @type {Parameters<typeof exerciseDao.create>[0]} */
  const payload = {
    name: dtoIn.name,
    sets: dtoIn.sets,
    repetitions: dtoIn.repetitions,
    date: dtoIn.date,
    fitnessGoalId: dtoIn.fitnessGoalId,
  };
  if ("note" in dtoIn && dtoIn.note !== undefined) {
    payload.note = dtoIn.note;
  }
  if ("durationMinutes" in dtoIn && dtoIn.durationMinutes != null) {
    payload.durationMinutes = dtoIn.durationMinutes;
  }

  const created = exerciseDao.create(payload);
  return { dtoOut: created };
}
