import { Router } from "express";
import { fitnessGoalListCommand } from "../commands/fitnessGoalList.js";
import { fitnessGoalCreateCommand } from "../commands/fitnessGoalCreate.js";
import { fitnessGoalGetCommand } from "../commands/fitnessGoalGet.js";
import { fitnessGoalUpdateCommand } from "../commands/fitnessGoalUpdate.js";
import { fitnessGoalRemoveCommand } from "../commands/fitnessGoalRemove.js";

export const fitnessGoalRouter = Router();

fitnessGoalRouter.get("/list", (req, res, next) => {
  try {
    res.json(fitnessGoalListCommand());
  } catch (e) {
    next(e);
  }
});

fitnessGoalRouter.post("/create", (req, res, next) => {
  try {
    const result = fitnessGoalCreateCommand(req.body ?? {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

fitnessGoalRouter.get("/get/:fitnessGoalId", (req, res, next) => {
  try {
    res.json(fitnessGoalGetCommand(req.params.fitnessGoalId));
  } catch (e) {
    next(e);
  }
});

fitnessGoalRouter.post("/update", (req, res, next) => {
  try {
    res.json(fitnessGoalUpdateCommand(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});

fitnessGoalRouter.post("/remove", (req, res, next) => {
  try {
    res.json(fitnessGoalRemoveCommand(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});
