export const workoutManager = {
  getSavedWorkouts() {
    const raw = JSON.parse(localStorage.getItem("workouts") || "[]");
    return raw.filter(w => w && w.date && Array.isArray(w.exercises));
  },
  createNewWorkout() {
    return { date: new Date().toISOString(), exercises: [] };
  },
  saveWorkout(workout) {
    const workouts = this.getSavedWorkouts();
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }
};
