import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
addFormats(ajv);

const exerciseFields = {
  name: { type: "string", minLength: 1 },
  sets: { type: "integer", minimum: 1 },
  repetitions: { type: "integer", minimum: 1 },
  date: { type: "string", format: "date-time" },
  fitnessGoalId: { type: "string", minLength: 1 },
  note: { type: "string", maxLength: 500 },
  durationMinutes: { type: "integer", minimum: 1, maximum: 1440 },
};

export const exerciseCreateSchema = {
  type: "object",
  required: ["name", "sets", "repetitions", "date", "fitnessGoalId"],
  additionalProperties: false,
  properties: { ...exerciseFields },
};

export const exerciseUpdateSchema = {
  type: "object",
  required: ["id", "name", "sets", "repetitions", "date", "fitnessGoalId"],
  additionalProperties: false,
  properties: {
    id: { type: "string", minLength: 1 },
    ...exerciseFields,
  },
};

export const exerciseRemoveSchema = {
  type: "object",
  required: ["exerciseId"],
  additionalProperties: false,
  properties: {
    exerciseId: { type: "string", minLength: 1 },
  },
};

export const exerciseListDtoInSchema = {
  type: "object",
  properties: {
    year: { type: "integer" },
    month: { type: "integer", minimum: 1, maximum: 12 },
  },
  additionalProperties: false,
};

export const exerciseListByGoalDtoInSchema = {
  type: "object",
  required: ["fitnessGoalId"],
  additionalProperties: false,
  properties: {
    fitnessGoalId: { type: "string", minLength: 1 },
  },
};

export const fitnessGoalCreateSchema = {
  type: "object",
  required: ["name"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1 },
  },
};

export const fitnessGoalUpdateSchema = {
  type: "object",
  required: ["id", "name"],
  additionalProperties: false,
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
  },
};

export const fitnessGoalRemoveSchema = {
  type: "object",
  required: ["fitnessGoalId"],
  additionalProperties: false,
  properties: {
    fitnessGoalId: { type: "string", minLength: 1 },
  },
};

export const validateExerciseCreate = ajv.compile(exerciseCreateSchema);
export const validateExerciseUpdate = ajv.compile(exerciseUpdateSchema);
export const validateExerciseRemove = ajv.compile(exerciseRemoveSchema);
export const validateExerciseListDtoIn = ajv.compile(exerciseListDtoInSchema);
export const validateExerciseListByGoalDtoIn = ajv.compile(
  exerciseListByGoalDtoInSchema,
);
export const validateFitnessGoalCreate = ajv.compile(fitnessGoalCreateSchema);
export const validateFitnessGoalUpdate = ajv.compile(fitnessGoalUpdateSchema);
export const validateFitnessGoalRemove = ajv.compile(fitnessGoalRemoveSchema);
