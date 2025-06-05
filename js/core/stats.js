import { capitalize } from "../utils/formatting.js";
import { muscleGroups } from "../utils/constants.js";

export function getAllWorkouts() {
  return JSON.parse(localStorage.getItem("workouts") || "[]");
}

export function getWorkoutsInRange(startDate, endDate) {
  return getAllWorkouts().filter(w => {
    const d = new Date(w.date);
    return d >= startDate && d <= endDate;
  });
}


export function getVolumeByMuscle(startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const volume = Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const group = normalizeGroup(ex.group || ex.muscleGroup);
      if (!muscleGroups.includes(group)) continue;

      const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 1);
      volume[group] += vol;
    }
  }

  return volume;
}

export function getSetDistribution(startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const sets = Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const group = normalizeGroup(ex.group || ex.muscleGroup);
      if (!muscleGroups.includes(group)) continue;

      sets[group] += ex.sets || 0;
    }
  }

  return sets;
}

export function getTopExercises(limit = 5) {
  const workouts = getAllWorkouts();
  const freq = {};

  for (const w of workouts) {
    if (!Array.isArray(w.exercises)) continue;

    for (const ex of w.exercises) {
      let name = ex.name || ex.exerciseName;
      if (!name || typeof name !== "string") continue;

      name = name.trim().toLowerCase(); 

      freq[name] = (freq[name] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => [capitalize(name), count]);
}

function normalizeGroup(name) {
  return (name || "").toLowerCase();
}

export {
  getTopExercises,
  getVolumeByMuscle,
  getSetDistribution,
  getRecommendedMuscleGroup,
  getWorkoutsInRange,
  getAllWorkouts
};