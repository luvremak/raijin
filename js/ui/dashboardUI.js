export function renderCurrentWorkoutList(exercises) {
  const container = document.getElementById("current-workout-list");
  container.innerHTML = exercises.map((ex, i) => `
    <li>
      ${ex.name}: ${ex.sets}×${ex.reps} @ ${ex.weight}kg
      <button class="delete-btn" data-index="${i}">Delete</button>
    </li>
  `).join("");
}

export function renderWorkoutHistory(workouts) {
  const container = document.getElementById("workout-history");
  container.innerHTML = workouts.map(w => `
    <div>
      <strong>${new Date(w.date).toLocaleDateString()}</strong>
      <ul>${w.exercises.map(ex => `<li>${ex.name}</li>`).join("")}</ul>
    </div>
  `).join("");
}
