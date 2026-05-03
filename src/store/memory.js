/** Centrální in-memory stav — sdílený mezi DAO a persistencí. */

/** @type {Map<string, { id: string, name: string }>} */
export const fitnessGoalById = new Map();

/**
 * @typedef {object} ExerciseRow
 * @property {string} id
 * @property {string} name
 * @property {number} sets
 * @property {number} repetitions
 * @property {string} date
 * @property {string} fitnessGoalId
 * @property {string} [note]
 * @property {number} [durationMinutes]
 */

/** @type {Map<string, ExerciseRow>} */
export const exerciseById = new Map();

export function clearStoresForTests() {
  fitnessGoalById.clear();
  exerciseById.clear();
}
