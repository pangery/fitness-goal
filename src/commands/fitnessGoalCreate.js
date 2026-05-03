import { createError, ERRORS } from "../errors.js";
import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";
import { validateFitnessGoalCreate } from "../validation/schemas.js";

export function fitnessGoalCreateCommand(dtoIn) {
  if (!validateFitnessGoalCreate(dtoIn)) {
    throw createError("dtoInIsNotValid", ERRORS.dtoInIsNotValid);
  }

  try {
    const created = fitnessGoalDao.create({ name: dtoIn.name });
    return { dtoOut: created };
  } catch (e) {
    if (e instanceof Error && e.message === "DUPLICATE_NAME") {
      throw createError("duplicateFitnessGoalName", ERRORS.duplicateFitnessGoalName);
    }
    throw e;
  }
}
