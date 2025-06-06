import { calculateWorkoutVolume } from "../features/logWorkout/workoutVolume.js";
import { formatDate } from "../utils/formatting.js";

export function renderWorkoutHistory(container, workouts, handlers = {}) {
  container.innerHTML = "";

  if (!Array.isArray(workouts) || workouts.length === 0) {
    container.textContent = "No workout history available.";
    return;
  }

  workouts.forEach((workout, index) => {
    const workoutBox = document.createElement("div");
    workoutBox.className = "workout-history-box";

    const dateHeader = document.createElement("h3");
    dateHeader.textContent = formatDate(workout.date);
    workoutBox.appendChild(dateHeader);

    const exercisesList = document.createElement("ul");
    exercisesList.className = "workout-exercises-list";

    let totalVolume = 0;

    if (Array.isArray(workout.exercises)) {
      workout.exercises.forEach(ex => {
        const volume = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        totalVolume += volume;

        const li = document.createElement("li");
        li.textContent = `${ex.name} — Sets: ${ex.sets}, Reps: ${ex.reps}, Weight: ${ex.weight} kg, Volume: ${volume.toFixed(2)} kg`;
        exercisesList.appendChild(li);
      });
    }

    workoutBox.appendChild(exercisesList);

    const totalVolumeDiv = document.createElement("div");
    totalVolumeDiv.className = "workout-total-volume";
    totalVolumeDiv.textContent = `Total Volume: ${totalVolume.toFixed(2)} kg`;
    workoutBox.appendChild(totalVolumeDiv);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "workout-history-buttons";

    if (handlers.onViewDetails) {
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.className = "btn-view-workout";
      viewBtn.addEventListener("click", () => handlers.onViewDetails(index));
      buttonsDiv.appendChild(viewBtn);
    }

    if (handlers.onEditWorkout) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn-edit-workout";
      editBtn.addEventListener("click", () => handlers.onEditWorkout(index));
      buttonsDiv.appendChild(editBtn);
    }

    if (handlers.onDeleteWorkout) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "btn-delete-workout";
      deleteBtn.addEventListener("click", () => handlers.onDeleteWorkout(index));
      buttonsDiv.appendChild(deleteBtn);
    }

    workoutBox.appendChild(buttonsDiv);

    container.appendChild(workoutBox);
  });
}
