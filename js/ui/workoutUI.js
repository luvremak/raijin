import { calculateWorkoutVolume } from "../features/logWorkout/workoutVolume.js";
import { capitalize } from "../utils/formatting.js";

export function renderWorkoutList(container, workout, handlers = {}) {
  container.innerHTML = "";

  if (!workout || !Array.isArray(workout.exercises)) {
    container.textContent = "No exercises logged yet.";
    return;
  }

  const list = document.createElement("ul");
  list.className = "workout-exercise-list";

  workout.exercises.forEach((ex, index) => {
    const item = document.createElement("li");
    item.className = "workout-exercise-item";

    const name = ex.name || "Unnamed Exercise";
    const muscleGroup = capitalize(ex.muscleGroup || "Unknown");
    const sets = ex.sets || 0;
    const reps = ex.reps || 0;
    const weight = ex.weight || 0;
    const volume = calculateWorkoutVolume(ex);

    item.textContent = `${name} (${muscleGroup}) - Sets: ${sets}, Reps: ${reps}, Weight: ${weight} kg, Volume: ${volume}`;

    if (handlers.onEditExercise) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn-edit-exercise";
      editBtn.addEventListener("click", () => handlers.onEditExercise(index));
      item.appendChild(editBtn);
    }

    if (handlers.onRemoveExercise) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "btn-remove-exercise";
      removeBtn.addEventListener("click", () => handlers.onRemoveExercise(index));
      item.appendChild(removeBtn);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}

export function renderWorkoutVolume(container, workout) {
  if (!workout || !Array.isArray(workout.exercises)) {
    container.textContent = "Volume: 0";
    return;
  }

  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + calculateWorkoutVolume(ex);
  }, 0);

  container.textContent = `Total Volume: ${totalVolume.toFixed(2)} kg`;
}

export function renderWorkoutButtons(container, handlers = {}) {
  container.innerHTML = "";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Exercise";
  addBtn.className = "btn-add-exercise";
  if (handlers.onAddExercise) addBtn.addEventListener("click", handlers.onAddExercise);
  container.appendChild(addBtn);

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Workout";
  saveBtn.className = "btn-save-workout";
  if (handlers.onSaveWorkout) saveBtn.addEventListener("click", handlers.onSaveWorkout);
  container.appendChild(saveBtn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear Workout";
  clearBtn.className = "btn-clear-workout";
  if (handlers.onClearWorkout) clearBtn.addEventListener("click", handlers.onClearWorkout);
  container.appendChild(clearBtn);
}
