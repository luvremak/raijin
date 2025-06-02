import { capitalize } from "../utils/generatorUtils.js";

export function renderCurrentWorkout(currentWorkoutExercises) {
  const list = document.getElementById("current-workout-list");
  const totalVolumeEl = document.getElementById("total-volume");
  const saveWorkoutBtn = document.getElementById("save-workout-btn");

  if (!currentWorkoutExercises.length) {
    list.innerHTML = "<li>No exercises added yet.</li>";
    saveWorkoutBtn.disabled = true;
    totalVolumeEl.textContent = "0";
    return;
  }

  let totalVolume = 0;
  list.innerHTML = currentWorkoutExercises.map((ex, i) => {
    const volume = ex.sets * ex.reps * (ex.weight || 1);
    totalVolume += volume;
    return `
      <li>
        <strong>${ex.exerciseName} (${capitalize(ex.muscleGroup)})</strong> — Sets: ${ex.sets}, Reps: ${ex.reps}, Weight: ${ex.weight || "Bodyweight"}, Notes: ${ex.notes || "-"}
        <br>Volume: ${volume.toFixed(2)}
        <br>
        <button data-index="${i}" class="edit-exercise-btn">Edit</button>
        <button data-index="${i}" class="delete-exercise-btn">Delete</button>
      </li>
    `;
  }).join("");

  totalVolumeEl.textContent = totalVolume.toFixed(2);
  saveWorkoutBtn.disabled = false;
}

export function renderWorkoutHistory(savedWorkouts) {
  const historyEl = document.getElementById("workout-history");

  if (!savedWorkouts.length) {
    historyEl.innerHTML = "<p>No workouts logged yet.</p>";
    return;
  }

  const html = savedWorkouts.map(workout => {
    const dateStr = new Date(workout.date).toLocaleString();
    const exercisesHtml = workout.exercises.map(ex => {
      const vol = ex.sets * ex.reps * (ex.weight || 1);
      return `<li><strong>${ex.exerciseName} (${capitalize(ex.muscleGroup)})</strong> - Sets: ${ex.sets}, Reps: ${ex.reps}, Weight: ${ex.weight || "Bodyweight"}, Volume: ${vol.toFixed(2)}</li>`;
    }).join("");

    const totalVol = workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * (ex.weight || 1)), 0);

    return `
      <div class="workout-history-entry">
        <strong>Workout on ${dateStr}</strong> - Total Volume: ${totalVol.toFixed(2)}
        <ul>${exercisesHtml}</ul>
      </div>
    `;
  }).reverse().join("");

  historyEl.innerHTML = html;
}
