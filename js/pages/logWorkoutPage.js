import { 
  loadLogWorkout, 
  addExerciseToCurrentWorkout, 
  saveCurrentWorkout, 
  clearCurrentWorkout 
} from "../features/logWorkout/logWorkout.js";

import { getSavedWorkouts } from "../core/workoutManager.js";  

import {
  renderWorkoutList,
  renderWorkoutVolume,
  renderWorkoutButtons,
  renderCurrentWorkoutUI 
} from "../ui/workoutUI.js";

import { renderWorkoutHistory } from "../ui/workoutHistoryUI.js";


export async function initLogWorkoutPage() {
  const {
    exercisesData,
    savedWorkouts,
    recommendedGroup,
    currentWorkoutExercises
  } = await loadLogWorkout();

  const listContainer = document.querySelector("#current-workout-container");
  const volumeContainer = document.querySelector("#current-workout-volume");
  const buttonContainer = document.querySelector("#current-workout-buttons");
  const historyContainer = document.querySelector("#workout-history-container");

  function rerenderWorkoutUI() {
    renderCurrentWorkoutUI(
      listContainer,
      volumeContainer,
      buttonContainer,
      { exercises: currentWorkoutExercises }
    );
  }

  renderWorkoutButtons(buttonContainer, {
    onAddExercise: () => {
      const name = prompt("Exercise name?");
      const muscleGroup = prompt("Muscle group?");
      const sets = parseInt(prompt("Sets?"), 10);
      const reps = parseInt(prompt("Reps?"), 10);
      const weight = parseFloat(prompt("Weight (kg)?"));

      if (name && muscleGroup && sets && reps && weight) {
        addExerciseToCurrentWorkout({
          name,
          muscleGroup,
          sets,
          reps,
          weight,
        });
        rerenderWorkoutUI();
      } else {
        alert("Incomplete exercise input.");
      }
    },

    onSaveWorkout: () => {
      try {
        saveCurrentWorkout();
        alert("Workout saved!");
        rerenderWorkoutUI();

        // Fetch fresh saved workouts after saving
        const freshSavedWorkouts = getSavedWorkouts();
        renderWorkoutHistory(historyContainer, freshSavedWorkouts);
      } catch (err) {
        alert(err.message);
      }
    },

    onClearWorkout: () => {
      if (confirm("Clear current workout?")) {
        clearCurrentWorkout();
        rerenderWorkoutUI();
      }
    },
  });

  rerenderWorkoutUI();

  renderWorkoutHistory(historyContainer, savedWorkouts, {
    onDeleteWorkout: (index) => {
      alert("Delete logic goes here.");
    }
  });
}
