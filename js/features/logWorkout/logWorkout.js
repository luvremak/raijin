import { loadExercisesData, saveExercisesData } from "../../utils/dataStream.js";
import { capitalize } from "../../utils/formatting.js";
import { getSavedWorkouts, saveWorkout } from '../../core/workoutManager.js';
import { muscleGroups } from "../../utils/constants.js";
import { calculateWorkoutVolume } from './workoutVolume.js';
import { recommendMuscleGroup } from './workoutRecommender.js';

let currentWorkoutExercises = [];

export async function loadLogWorkout() {
  const exercisesData = await loadExercisesData();

  const savedWorkoutsRaw = getSavedWorkouts();
  const savedWorkouts = savedWorkoutsRaw.filter(w => w && w.date && Array.isArray(w.exercises));

  const recommendedGroup = recommendMuscleGroup(savedWorkouts);

  return {
    exercisesData,
    savedWorkouts,
    recommendedGroup,
    currentWorkoutExercises
  };
}

export function buildLogWorkoutSection() {
  const section = document.createElement("section");
  section.id = "log-workout-section";

  section.innerHTML = `
    <h1>Log Workout</h1>
    <div id="log-feedback" class="feedback-message"></div>
    
    <div id="current-workout-list" class="workout-list"></div>
    <div id="current-workout-volume" class="workout-volume"></div>
    <div id="current-workout-buttons" class="workout-buttons"></div>
    
    <h2>Workout History</h2>
    <div id="workout-history-container" class="workout-history"></div>
  `;

  return section;
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

  saveWorkout(newWorkout);
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