import { calculateWorkoutVolume } from "../features/logWorkout/workoutVolume.js";
import { formatDate } from "../utils/formatting.js";

export function renderWorkoutHistory(container, workouts, handlers = {}) {
  container.innerHTML = "";

  if (!Array.isArray(workouts) || workouts.length === 0) {
    container.textContent = "No workout history available.";
    return;
  }

  const list = document.createElement("ul");
  list.className = "workout-history-list";

  workouts.forEach((workout, index) => {
    const item = document.createElement("li");
    item.className = "workout-history-item";

    const dateStr = formatDate(workout.date);
    const exerciseCount = Array.isArray(workout.exercises) ? workout.exercises.length : 0;
    const totalVolume = (Array.isArray(workout.exercises) ? 
      workout.exercises.reduce((sum, ex) => sum + calculateWorkoutVolume(ex), 0) : 0).toFixed(2);

    const info = document.createElement("div");
    info.className = "workout-history-info";
    info.textContent = `${dateStr} — Exercises: ${exerciseCount} — Total Volume: ${totalVolume} kg`;
    item.appendChild(info);

    if (handlers.onViewDetails) {
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.className = "btn-view-workout";
      viewBtn.addEventListener("click", () => handlers.onViewDetails(index));
      item.appendChild(viewBtn);
    }

    if (handlers.onEditWorkout) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn-edit-workout";
      editBtn.addEventListener("click", () => handlers.onEditWorkout(index));
      item.appendChild(editBtn);
    }

    if (handlers.onDeleteWorkout) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "btn-delete-workout";
      deleteBtn.addEventListener("click", () => handlers.onDeleteWorkout(index));
      item.appendChild(deleteBtn);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}
