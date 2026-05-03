import { Router } from "express";
import { exerciseCreateCommand } from "../commands/exerciseCreate.js";
import { exerciseListCommand } from "../commands/exerciseList.js";
import { exerciseUpdateCommand } from "../commands/exerciseUpdate.js";
import { exerciseRemoveCommand } from "../commands/exerciseRemove.js";
import { exerciseListByFitnessGoalIdCommand } from "../commands/exerciseListByFitnessGoalId.js";

export const exerciseRouter = Router();

exerciseRouter.post("/create", (req, res, next) => {
  try {
    const result = exerciseCreateCommand(req.body ?? {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

exerciseRouter.get("/list", (req, res, next) => {
  try {
    const dtoIn = buildExerciseListDtoIn(req.query);
    res.json(exerciseListCommand(dtoIn));
  } catch (e) {
    next(e);
  }
});

exerciseRouter.post("/update", (req, res, next) => {
  try {
    res.json(exerciseUpdateCommand(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});

exerciseRouter.post("/remove", (req, res, next) => {
  try {
    res.json(exerciseRemoveCommand(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});

exerciseRouter.get("/listByFitnessGoalId", (req, res, next) => {
  try {
    const dtoIn = buildListByGoalDtoIn(req.query);
    res.json(exerciseListByFitnessGoalIdCommand(dtoIn));
  } catch (e) {
    next(e);
  }
});

/**
 * @param {import('express').Request['query']} query
 */
function buildExerciseListDtoIn(query) {
  /** @type {Record<string, unknown>} */
  const dtoIn = {};
  if (query.year !== undefined && query.year !== "") {
    dtoIn.year = Number(query.year);
  }
  if (query.month !== undefined && query.month !== "") {
    dtoIn.month = Number(query.month);
  }
  return dtoIn;
}

/**
 * @param {import('express').Request['query']} query
 */
function buildListByGoalDtoIn(query) {
  /** @type {Record<string, unknown>} */
  const dtoIn = {};
  if (query.fitnessGoalId !== undefined && query.fitnessGoalId !== "") {
    dtoIn.fitnessGoalId = String(query.fitnessGoalId);
  }
  return dtoIn;
}
