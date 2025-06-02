import { capitalize } from "./workoutManager.js";

const MUSCLE_GROUPS = ["back", "chest", "arms", "shoulders", "core", "legs"];

// --- Core: Fetching ---

export function getAllWorkouts() {
  return JSON.parse(localStorage.getItem("workouts") || "[]");
}

export function getWorkoutsInRange(startDate, endDate) {
  return getAllWorkouts().filter(w => {
    const d = new Date(w.date);
    return d >= startDate && d <= endDate;
  });
}

// --- Volume: by Muscle Group ---

export function getVolumeByMuscle(startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const volume = Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const group = ex.group || ex.muscleGroup;
      if (!MUSCLE_GROUPS.includes(group)) continue;

      const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 1);
      volume[group] += vol;
    }
  }

  return volume;
}

// --- Sets: by Muscle Group ---

export function getSetDistribution(startDate, endDate) {
  const workouts = getWorkoutsInRange(startDate, endDate);
  const sets = Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0]));

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const group = ex.group || ex.muscleGroup;
      if (!MUSCLE_GROUPS.includes(group)) continue;

      sets[group] += ex.sets || 0;
    }
  }

  return sets;
}

// --- Frequency: Top Exercises ---

export function getTopExercises(limit = 5) {
  const workouts = getAllWorkouts();
  const freq = {};

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const name = ex.name || ex.exerciseName;
      if (!name) continue;

      freq[name] = (freq[name] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// --- Recommendation: Undervalued Group (e.g. for Log Workout UI) ---

export function getRecommendedMuscleGroup(workouts = getAllWorkouts()) {
  const recent = workouts.filter(w => new Date(w.date) >= new Date(Date.now() - 7 * 864e5));
  const volumes = Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0]));

  for (const w of recent) {
    for (const ex of w.exercises || []) {
      const group = ex.group;
      if (!MUSCLE_GROUPS.includes(group)) continue;

      const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 1);
      volumes[group] += vol;
    }
  }

  return Object.entries(volumes).sort((a, b) => a[1] - b[1])[0]?.[0] || "Full Body";
}
