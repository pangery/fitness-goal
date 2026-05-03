import test from "node:test";
import assert from "node:assert/strict";
import { buildStatsOverview } from "../src/lib/stats.js";

test("buildStatsOverview agreguje podle cíle a počítá opakování", () => {
  const fitnessGoalMap = {
    g1: { id: "g1", name: "Hubnutí" },
    g2: { id: "g2", name: "Síla" },
  };
  const exercises = [
    {
      sets: 3,
      repetitions: 10,
      fitnessGoalId: "g1",
      date: "2024-01-01T10:00:00.000Z",
    },
    {
      sets: 2,
      repetitions: 5,
      fitnessGoalId: "g1",
      date: "2024-01-02T10:00:00.000Z",
      durationMinutes: 15,
    },
    {
      sets: 4,
      repetitions: 8,
      fitnessGoalId: "g2",
      date: "2024-01-03T10:00:00.000Z",
    },
  ];

  const out = buildStatsOverview(exercises, fitnessGoalMap);

  assert.equal(out.totalExercises, 3);
  assert.equal(out.totalSessionRepetitions, 3 * 10 + 2 * 5 + 4 * 8);
  assert.equal(out.totalDurationMinutes, 15);
  assert.equal(out.byFitnessGoal.length, 2);

  const hub = out.byFitnessGoal.find((x) => x.fitnessGoalId === "g1");
  assert(hub);
  assert.equal(hub.exerciseCount, 2);
  assert.equal(hub.sessionRepetitions, 40);
  assert.equal(hub.durationMinutes, 15);
});
