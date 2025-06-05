import { loadLogWorkout } from "../features/logWorkout/logWorkout.js";
import { renderCurrentWorkoutUI, setupCurrentWorkoutHandlers } from "../ui/workoutUI.js";
import { renderWorkoutHistoryUI } from "../ui/workoutHistoryUI.js";
import logWorkoutHTML from "../features/logWorkout/logWorkout.html?raw";

const contentSection = document.getElementById("content");

export async function initLogWorkoutPage() {
  contentSection.innerHTML = logWorkoutHTML;

  await loadLogWorkout();

  renderCurrentWorkoutUI();
  setupCurrentWorkoutHandlers();

  renderWorkoutHistoryUI();
}