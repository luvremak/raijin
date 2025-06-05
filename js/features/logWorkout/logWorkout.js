import { loadExercisesData, saveExercisesData } from "../../utils/dataStream.js";
import { capitalize } from "../../utils/formatting.js";
import { workoutManager } from '../../core/workoutManager.js';
import { muscleGroups } from "../../utils/constants.js";
import { calculateExerciseVolume, calculateWorkoutVolume } from "./workoutVolume.js";
import { recommendNextMuscleGroup } from "./workoutRecommender.js";

let currentWorkoutExercises = [];

export async function loadLogWorkout() {
  const exercisesData = await loadExercisesData();

  const savedWorkoutsRaw = workoutManager.getSavedWorkouts();
  const savedWorkouts = savedWorkoutsRaw.filter(w => w && w.date && Array.isArray(w.exercises));

  const groupVolumes = Object.fromEntries(muscleGroups.map(m => [m, 0]));

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  for (const w of savedWorkouts) {
    const date = new Date(w.date);
    if (date >= sevenDaysAgo && w.exercises) {
      for (const ex of w.exercises) {
        if (groupVolumes[ex.muscleGroup] !== undefined) {
          groupVolumes[ex.muscleGroup] += calculateExerciseVolume(ex);
        }
      }
    }
  }

  const recommendedGroup = recommendNextMuscleGroup(groupVolumes);

  return {
    exercisesData,
    savedWorkouts,
    recommendedGroup,
    currentWorkoutExercises
  };
}

export function getCurrentWorkoutExercises() {
  return currentWorkoutExercises;
}

export function addExerciseToCurrentWorkout(exercise) {
  currentWorkoutExercises.push(exercise);
}

export function editExerciseInCurrentWorkout(index, updatedExercise) {
  if (index >= 0 && index < currentWorkoutExercises.length) {
    currentWorkoutExercises[index] = updatedExercise;
  }
}

export function deleteExerciseFromCurrentWorkout(index) {
  if (index >= 0 && index < currentWorkoutExercises.length) {
    currentWorkoutExercises.splice(index, 1);
  }
}

export function clearCurrentWorkout() {
  currentWorkoutExercises = [];
}

export function calculateTotalVolume() {
  return calculateWorkoutVolume(currentWorkoutExercises);
}

export function saveCurrentWorkout() {
  if (currentWorkoutExercises.length === 0) {
    throw new Error("Add at least one exercise before saving.");
  }

  const newWorkout = {
    date: new Date().toISOString(),
    exercises: currentWorkoutExercises
  };

  workoutManager.saveWorkout(newWorkout);
  clearCurrentWorkout();
}

export async function addNewExercise(name, group) {
  const data = await loadExercisesData();

  const newExercise = {
    id: name.toLowerCase().replace(/\s+/g, "_"),
    name
  };

  if (!data[group]) data[group] = [];
  data[group].push(newExercise);

  await saveExercisesData(data);

  return capitalize(group);
}