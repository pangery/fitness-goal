import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { validateFitnessGoalUpdate } from "../validation/schemas.js";

export function fitnessGoalUpdateCommand(dtoIn) {
  if (!validateFitnessGoalUpdate(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  try {
    const updated = fitnessGoalDao.update({ id: dtoIn.id, name: dtoIn.name });
    if (!updated) {
      throw createError("fitnessGoalNotFound", ERRORS.fitnessGoalNotFound);
    }
    return { dtoOut: updated };
  } catch (e) {
    if (e?.isAppError) throw e;
    if (e instanceof Error && e.message === "DUPLICATE_NAME") {
      throw createError("duplicateFitnessGoalName", ERRORS.duplicateFitnessGoalName);
    }
    throw e;
  }
}
