import { randomBytes } from "crypto";
import { exerciseById } from "../store/memory.js";
import { schedulePersist } from "../persistence/filePersistence.js";

function newId() {
  return randomBytes(16).toString("hex");
}

function parseExerciseDate(iso) {
  return new Date(iso).getTime();
}

/**
 * @param {import('../store/memory.js').ExerciseRow} row
 */
function cloneExercise(row) {
  return { ...row };
}

/**
 * @param {Omit<import('../store/memory.js').ExerciseRow, 'id'> & { id?: string }} input
 * @returns {import('../store/memory.js').ExerciseRow}
 */
function buildRow(input) {
  /** @type {import('../store/memory.js').ExerciseRow} */
  const row = {
    id: input.id ?? newId(),
    name: input.name,
    sets: input.sets,
    repetitions: input.repetitions,
    date: input.date,
    fitnessGoalId: input.fitnessGoalId,
  };
  if (input.note != null && String(input.note).length > 0) {
    row.note = String(input.note);
  }
  if (input.durationMinutes != null && Number.isFinite(input.durationMinutes)) {
    row.durationMinutes = Math.round(Number(input.durationMinutes));
  }
  return row;
}

export const exerciseDao = {
  /**
   * @param {Parameters<typeof buildRow>[0]} exercise
   */
  create(exercise) {
    const row = buildRow(exercise);
    exerciseById.set(row.id, row);
    schedulePersist();
    return cloneExercise(row);
  },

  /**
   * @param {string} exerciseId
   */
  get(exerciseId) {
    const row = exerciseById.get(exerciseId);
    return row ? cloneExercise(row) : null;
  },

  /**
   * @param {{ year?: number, month?: number }} [filter]
   */
  list(filter = {}) {
    let list = [...exerciseById.values()].map((e) => cloneExercise(e));

    if (
      filter.year != null &&
      filter.month != null &&
      Number.isInteger(filter.year) &&
      Number.isInteger(filter.month)
    ) {
      const y = filter.year;
      const m = filter.month;
      list = list.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }

    list.sort((a, b) => parseExerciseDate(a.date) - parseExerciseDate(b.date));
    return { exerciseList: list };
  },

  /**
   * @param {import('../store/memory.js').ExerciseRow} exercise
   */
  update(exercise) {
    const existing = exerciseById.get(exercise.id);
    if (!existing) return null;
    const row = buildRow(exercise);
    exerciseById.set(exercise.id, row);
    schedulePersist();
    return cloneExercise(row);
  },

  /**
   * @param {string} exerciseId
   */
  remove(exerciseId) {
    exerciseById.delete(exerciseId);
    schedulePersist();
  },

  /**
   * @param {string} fitnessGoalId
   */
  removeByFitnessGoalId(fitnessGoalId) {
    for (const [id, row] of exerciseById.entries()) {
      if (row.fitnessGoalId === fitnessGoalId) {
        exerciseById.delete(id);
      }
    }
    schedulePersist();
  },

  /**
   * @param {string} fitnessGoalId
   */
  listByFitnessGoalId(fitnessGoalId) {
    const list = [...exerciseById.values()]
      .filter((e) => e.fitnessGoalId === fitnessGoalId)
      .map((e) => cloneExercise(e))
      .sort((a, b) => parseExerciseDate(a.date) - parseExerciseDate(b.date));
    return { exerciseList: list };
  },
};
