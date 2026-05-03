import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { exerciseDao } from "../daos/exerciseDao.js";
import { validateExerciseUpdate } from "../validation/schemas.js";
import { isExerciseDateAllowed } from "../lib/date.js";

export function exerciseUpdateCommand(dtoIn) {
  if (!validateExerciseUpdate(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  if (!isExerciseDateAllowed(dtoIn.date)) {
    throw createError("invalidDate", ERRORS.invalidDate);
  }

  const existing = exerciseDao.get(dtoIn.id);
  if (!existing) {
    throw createError("exerciseNotFound", ERRORS.exerciseNotFound);
  }

  const goal = fitnessGoalDao.get(dtoIn.fitnessGoalId);
  if (!goal) {
    throw createError("fitnessGoalDoesNotExist", ERRORS.fitnessGoalDoesNotExist);
  }

  /** @type {Parameters<typeof exerciseDao.update>[0]} */
  const payload = {
    id: dtoIn.id,
    name: dtoIn.name,
    sets: dtoIn.sets,
    repetitions: dtoIn.repetitions,
    date: dtoIn.date,
    fitnessGoalId: dtoIn.fitnessGoalId,
  };

  if ("note" in dtoIn) {
    if (dtoIn.note !== undefined && String(dtoIn.note).length > 0) {
      payload.note = String(dtoIn.note);
    }
  } else if (existing.note) {
    payload.note = existing.note;
  }

  if ("durationMinutes" in dtoIn) {
    if (dtoIn.durationMinutes != null) {
      payload.durationMinutes = dtoIn.durationMinutes;
    }
  } else if (existing.durationMinutes != null) {
    payload.durationMinutes = existing.durationMinutes;
  }

  const updated = exerciseDao.update(payload);
  return { dtoOut: updated };
}
