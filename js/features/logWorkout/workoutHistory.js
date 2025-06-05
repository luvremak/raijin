import { getSavedWorkouts } from '../../core/workoutManager.js';
import { capitalize } from "../utils/formatting.js";

export function getWorkoutHistory() {
  return getSavedWorkouts();
}

export function filterWorkoutsByDateRange(workouts, startDate, endDate) {
  return workouts.filter(w => {
    const date = new Date(w.date);
    return date >= startDate && date <= endDate;
  });
}

export function formatWorkoutEntry(workout) {
  const dateStr = new Date(workout.date).toLocaleString();
  const exercises = workout.exercises || [];

  let totalVolume = 0;
  const exercisesFormatted = exercises.map(ex => {
    const name = ex.name || "Unnamed";
    const group = ex.muscleGroup || "Unknown";
    const sets = parseInt(ex.sets) || 0;
    const reps = parseInt(ex.reps) || 0;
    const weight = ex.weight ?? 0;
    const volume = sets * reps * (typeof weight === "number" ? weight : 0);
    totalVolume += volume;

    return {
      name,
      group: capitalize(group),
      sets,
      reps,
      weight,
      volume: volume.toFixed(2),
    };
  });

  return {
    dateStr,
    routineName: workout.routineName || null,
    totalVolume: totalVolume.toFixed(2),
    exercises: exercisesFormatted,
  };
}