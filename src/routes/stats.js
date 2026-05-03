import { Router } from "express";
import { statsOverviewCommand } from "../commands/statsOverview.js";

export const statsRouter = Router();

statsRouter.get("/overview", (req, res, next) => {
  try {
    const dtoIn = buildStatsDtoIn(req.query);
    res.json(statsOverviewCommand(dtoIn));
  } catch (e) {
    next(e);
  }
});

/**
 * @param {import('express').Request['query']} query
 */
function buildStatsDtoIn(query) {
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
