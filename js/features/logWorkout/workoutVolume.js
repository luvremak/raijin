import { muscleGroups } from "../../utils/constants.js";

const DEFAULT_WEIGHT = 0;

export function calculateWorkoutVolume({ sets, reps, weight }) {
  return sets * reps * (typeof weight === "number" && weight > 0 ? weight : DEFAULT_WEIGHT);
}

export function calculateGroupVolumes(workouts, fromDate) {
  const groupVolumes = Object.fromEntries(muscleGroups.map(g => [g, 0]));

  workouts
    .filter(w => new Date(w.date) >= fromDate)
    .flatMap(w => w.exercises || [])
    .forEach(ex => {
      if (groupVolumes[ex.muscleGroup] !== undefined) {
        groupVolumes[ex.muscleGroup] += calculateWorkoutVolume(ex);
      }
    });

  return groupVolumes;
}

export function getLeastWorkedMuscleGroup(groupVolumes) {
  return Object.entries(groupVolumes).reduce(
    (min, [group, vol]) => (vol < min.volume ? { group, volume: vol } : min),
    { group: null, volume: Infinity }
  ).group;
}
