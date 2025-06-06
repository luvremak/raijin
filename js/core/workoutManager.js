const WORKOUTS_KEY = "workouts";

export function getSavedWorkouts() {
  const raw = JSON.parse(localStorage.getItem(WORKOUTS_KEY) || "[]");
  return raw.filter(w => w && w.date && Array.isArray(w.exercises));
}

export function createNewWorkout() {
  return {
    date: new Date().toISOString(),
    exercises: []
  };
}

export function saveWorkout(workout) {
  if (!workout || !workout.date || !Array.isArray(workout.exercises)) {
    throw new Error("Invalid workout object.");
  }

  const workouts = getSavedWorkouts();
  workouts.push(workout);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function clearAllWorkouts() {
  localStorage.removeItem(WORKOUTS_KEY);
}

export function deleteWorkoutByDate(dateStr) {
  const workouts = getSavedWorkouts();
  const filtered = workouts.filter(w => w.date !== dateStr);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
}

export function updateWorkout(updatedWorkout) {
  if (!updatedWorkout || !updatedWorkout.date) {
    throw new Error("Invalid workout object.");
  }

  const workouts = getSavedWorkouts();
  const index = workouts.findIndex(w => w.date === updatedWorkout.date);
  if (index === -1) {
    throw new Error("Workout not found.");
  }

  workouts[index] = updatedWorkout;
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function deleteWorkoutAtIndex(index) {
  const workouts = getSavedWorkouts();
  if (index >= 0 && index < workouts.length) {
    workouts.splice(index, 1);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  }
}

export const workoutManager = {
  getSavedWorkouts,
  createNewWorkout,
  saveWorkout,
  clearAllWorkouts,
  deleteWorkoutByDate,
  updateWorkout,
  deleteWorkoutAtIndex
};

