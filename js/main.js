import { initRoutineUI } from "./ui/routineUI.js";
import { loadLogWorkout } from "./pages/logWorkout.js";
import { loadStats } from "./pages/stats.js";
import { loadProfile } from "./pages/profile.js";
import { muscleGroupRecommender, timeoutIterator } from './utils/generatorUtils.js';
import { muscleGroups } from "./utils/constants.js";

document.getElementById("nav-log").addEventListener("click", loadLogWorkout);
document.getElementById("nav-routines").addEventListener("click", initRoutineUI);
document.getElementById("nav-stats").addEventListener("click", loadStats);
document.getElementById("nav-profile").addEventListener("click", loadProfile);

document.addEventListener("DOMContentLoaded", () => {
  loadLogWorkout(); 
});
document.getElementById("nav-stats").addEventListener("click", e => {
  e.preventDefault();
  loadStats();
});

const excludeSet = new Set();
const recommender = muscleGroupRecommender(muscleGroups, excludeSet);

const suggestedMuscleEl = document.getElementById('suggestedMuscle');

document.getElementById('suggestMuscleBtn').addEventListener('click', () => {
  console.log("Button clicked");
  timeoutIterator(recommender, 5, muscle => {
    console.log("Muscle:", muscle);
    suggestedMuscleEl.textContent = `How about: ${muscle}?`;
  });
});


