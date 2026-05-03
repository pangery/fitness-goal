/**
 * Exercise date must be today or in the past (not after end of local calendar day).
 */
export function isExerciseDateAllowed(isoDateString) {
  const exerciseDay = new Date(isoDateString);
  if (Number.isNaN(exerciseDay.getTime())) return false;
  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return exerciseDay.getTime() <= endOfToday.getTime();
}
