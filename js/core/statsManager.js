import { muscleGroups, normalizedMuscleGroups } from "../utils/constants.js";
import { capitalize } from "../utils/formatting.js";
import { memoize } from "../utils/memoize.js";

export function normalizeGroup(name) {
  return (name || "").toLowerCase().trim();
}

export function getAllWorkouts() {
  return JSON.parse(localStorage.getItem("workouts") || "[]");
}

export const getWorkoutsInRange = memoize(function (startDate, endDate) {
  return getAllWorkouts().filter(w => {
    const d = new Date(w.date);
    return d instanceof Date && !isNaN(d) && d >= startDate && d <= endDate;
  });
});

export const getVolumeByMuscle = memoize(function (startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const volume = Object.fromEntries(muscleGroups.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const rawGroup = ex.group || ex.muscleGroup;
      const normGroup = normalizeGroup(rawGroup);
      if (!normalizedMuscleGroups.has(normGroup)) continue;

      const canonicalGroup = capitalize(normGroup);
      const sets = ex.sets ?? 0;
      const reps = ex.reps ?? 0;
      const weight = ex.weight ?? 1;

      volume[canonicalGroup] += sets * reps * weight;
    }
  }

  return volume;
});

export const getSetDistribution = memoize(function (startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const sets = Object.fromEntries(muscleGroups.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const rawGroup = ex.group || ex.muscleGroup;
      const normGroup = normalizeGroup(rawGroup);
      if (!normalizedMuscleGroups.has(normGroup)) continue;

      const canonicalGroup = capitalize(normGroup);
      sets[canonicalGroup] += ex.sets ?? 0;
    }
  }

  return sets;
});

export const getTopExercises = memoize(function (limit = 5) {
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
});

export const getDailyVolume = memoize(function (days = 7) {
  const workouts = getAllWorkouts();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  const dailyVolume = Array(days).fill(0);

  for (const w of workouts) {
    const workoutDate = new Date(w.date);
    if (workoutDate < start || workoutDate > now) continue;

    const dayDiff = Math.floor((workoutDate - start) / (1000 * 60 * 60 * 24));
    if (dayDiff < 0 || dayDiff >= days) continue;

    for (const ex of w.exercises || []) {
      const sets = ex.sets ?? 0;
      const reps = ex.reps ?? 0;
      const weight = ex.weight ?? 1;
      dailyVolume[dayDiff] += sets * reps * weight;
    }
  }

  return dailyVolume;
});

export function getLeastTrainedMuscle(groupTotals) {
  return Object.entries(groupTotals).reduce((minGroup, [group, volume]) => {
    if (volume < minGroup.volume) return { group, volume };
    return minGroup;
  }, { group: null, volume: Infinity }).group;
}
