export function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  err.isAppError = true;
  return err;
}

export const ERRORS = {
  dtoInIsNotValid: "dtoIn is not valid",
  invalidDate: "date must be current day or a day in the past",
  fitnessGoalDoesNotExist: "goal with id dtoIn.fitnessGoalId does not exist",
  fitnessGoalNotFound: "fitness goal does not exist",
  duplicateFitnessGoalName: "fitness goal name must be unique",
  exerciseNotFound: "exercise does not exist",
};
