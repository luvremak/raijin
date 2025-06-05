import { getSavedWorkouts } from '../../core/workoutManager.js';
import { calculateGroupVolumes, getLeastWorkedMuscleGroup } from "./workoutVolume.js";

export function recommendMuscleGroup(workouts = null, daysBack = 7) {
  const allWorkouts = workouts || getSavedWorkouts();

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - (daysBack - 1));

  const groupVolumes = calculateGroupVolumes(allWorkouts, fromDate);
  return getLeastWorkedMuscleGroup(groupVolumes);
}