import { 
  loadLogWorkout, 
  addExerciseToCurrentWorkout, 
  editExerciseInCurrentWorkout,
  deleteExerciseFromCurrentWorkout,
  saveCurrentWorkout, 
  clearCurrentWorkout,
  buildLogWorkoutSection
} from "../features/logWorkout/logWorkout.js";

import { getSavedWorkouts, deleteWorkoutAtIndex } from "../core/workoutManager.js";
import { renderWorkoutHistory } from "../ui/workoutHistoryUI.js";
import { BiDirectionalPriorityQueue } from "../utils/priorityQueue.js";

function sortWorkoutsByDate(workouts) {
  const pq = new BiDirectionalPriorityQueue();

  workouts.forEach((workout) => {
    pq.enqueue(workout, new Date(workout.date).getTime());
  });

  const sortedWorkouts = [];
  while (pq.size() > 0) {
    sortedWorkouts.push(pq.dequeue('highest'));
  }
  return sortedWorkouts;
}

export async function initLogWorkoutPage() {
  const mainContent = document.querySelector("#content");
  mainContent.innerHTML = "";
  mainContent.appendChild(buildLogWorkoutSection());

  const {
    exercisesData,
    savedWorkouts,
    currentWorkoutExercises
  } = await loadLogWorkout();

  const listContainer = document.querySelector("#current-workout-list");
  const volumeContainer = document.querySelector("#current-workout-volume");
  const buttonContainer = document.querySelector("#current-workout-buttons");
  const historyContainer = document.querySelector("#workout-history-container");
  const feedbackContainer = document.querySelector("#log-feedback");

  function showFeedback(message, type = "info") {
    feedbackContainer.textContent = message;
    feedbackContainer.className = `feedback-message ${type}`;
    setTimeout(() => {
      feedbackContainer.textContent = "";
      feedbackContainer.className = "feedback-message";
    }, 3000);
  }

  function createExerciseSelect(selectedId = "") {
    const allExercises = [];
    for (const group in exercisesData) {
      exercisesData[group].forEach(ex => {
        allExercises.push({ id: ex.id, name: ex.name, muscleGroup: group });
      });
    }

    const select = document.createElement("select");
    select.className = "exercise-select";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select exercise...";
    placeholderOption.disabled = true;
    placeholderOption.selected = !selectedId;
    select.appendChild(placeholderOption);

    allExercises.forEach(({ id, name }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      if (id === selectedId) option.selected = true;
      select.appendChild(option);
    });

    return select;
  }

  function renderWorkoutUI() {
    listContainer.innerHTML = "";

    if (currentWorkoutExercises.length === 0) {
      listContainer.textContent = "No exercises added.";
      renderVolume();
      return;
    }

    currentWorkoutExercises.forEach((ex, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "workout-exercise-item";

      const exerciseSelect = createExerciseSelect(ex.id);
      exerciseSelect.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        let matchedEx = null;
        for (const group in exercisesData) {
          matchedEx = exercisesData[group].find(x => x.id === selectedId);
          if (matchedEx) {
            ex.id = matchedEx.id;
            ex.name = matchedEx.name;
            ex.muscleGroup = group;
            break;
          }
        }
        editExerciseInCurrentWorkout(index, ex);
        renderVolume();
      });
      itemDiv.appendChild(exerciseSelect);

      const setsInput = document.createElement("input");
      setsInput.type = "number";
      setsInput.min = 0;
      setsInput.value = ex.sets || 0;
      setsInput.placeholder = "Sets";
      setsInput.addEventListener("input", (e) => {
        ex.sets = parseInt(e.target.value) || 0;
        editExerciseInCurrentWorkout(index, ex);
        renderVolume();
      });
      itemDiv.appendChild(setsInput);

      const repsInput = document.createElement("input");
      repsInput.type = "number";
      repsInput.min = 0;
      repsInput.value = ex.reps || 0;
      repsInput.placeholder = "Reps";
      repsInput.addEventListener("input", (e) => {
        ex.reps = parseInt(e.target.value) || 0;
        editExerciseInCurrentWorkout(index, ex);
        renderVolume();
      });
      itemDiv.appendChild(repsInput);

      const weightInput = document.createElement("input");
      weightInput.type = "number";
      weightInput.min = 0;
      weightInput.step = "0.1";
      weightInput.value = ex.weight || 0;
      weightInput.placeholder = "Weight (kg)";
      weightInput.addEventListener("input", (e) => {
        ex.weight = parseFloat(e.target.value) || 0;
        editExerciseInCurrentWorkout(index, ex);
        renderVolume();
      });
      itemDiv.appendChild(weightInput);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "btn-remove-exercise";
      removeBtn.addEventListener("click", () => {
        deleteExerciseFromCurrentWorkout(index);
        renderWorkoutUI();
      });
      itemDiv.appendChild(removeBtn);

      listContainer.appendChild(itemDiv);
    });

    renderVolume();
  }

  function renderVolume() {
    const totalVolume = currentWorkoutExercises.reduce((sum, ex) => {
      return sum + (ex.sets * ex.reps * ex.weight || 0);
    }, 0);

    volumeContainer.textContent = `Total Volume: ${totalVolume.toFixed(2)} kg`;
  }

  function renderButtons() {
    buttonContainer.innerHTML = "";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Exercise";
    addBtn.addEventListener("click", () => {
      addExerciseToCurrentWorkout({
        id: "",
        name: "",
        muscleGroup: "",
        sets: 0,
        reps: 0,
        weight: 0
      });
      renderWorkoutUI();
    });
    buttonContainer.appendChild(addBtn);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Workout";
    saveBtn.addEventListener("click", () => {
      try {
        if (currentWorkoutExercises.length === 0) {
          showFeedback("Add at least one exercise before saving.", "warning");
          return;
        }
        saveCurrentWorkout();
        showFeedback("Workout saved!", "success");
        clearCurrentWorkout();
        renderWorkoutUI();
        renderButtons();

        const freshSavedWorkouts = getSavedWorkouts();
        const sorted = sortWorkoutsByDate(freshSavedWorkouts);
        renderWorkoutHistory(historyContainer, sorted, { onDeleteWorkout });
      } catch (err) {
        showFeedback(err.message, "error");
      }
    });
    buttonContainer.appendChild(saveBtn);

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear Workout";
    clearBtn.addEventListener("click", () => {
      renderClearConfirmation();
    });
    buttonContainer.appendChild(clearBtn);
  }

  function renderClearConfirmation() {
    buttonContainer.innerHTML = "";

    const confirmDiv = document.createElement("div");
    confirmDiv.className = "clear-confirmation";

    const message = document.createElement("span");
    message.textContent = "Clear all exercises?";
    confirmDiv.appendChild(message);

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.addEventListener("click", () => {
      clearCurrentWorkout();
      renderWorkoutUI();
      renderButtons();
      showFeedback("Workout cleared.", "success");
    });
    confirmDiv.appendChild(yesBtn);

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.addEventListener("click", () => {
      renderButtons();
    });
    confirmDiv.appendChild(noBtn);

    buttonContainer.appendChild(confirmDiv);
  }

  function onDeleteWorkout(index) {
    deleteWorkoutAtIndex(index);
    const updatedWorkouts = getSavedWorkouts();
    const sorted = sortWorkoutsByDate(updatedWorkouts);
    renderWorkoutHistory(historyContainer, sorted, { onDeleteWorkout });
    showFeedback("Workout deleted.", "success");
  }

  renderWorkoutUI();
  renderButtons();

  const sortedWorkouts = sortWorkoutsByDate(savedWorkouts);
  renderWorkoutHistory(historyContainer, sortedWorkouts, { onDeleteWorkout });
}
