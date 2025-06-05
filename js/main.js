import { initRoutineUI } from "./ui/routineUI.js";
import { loadLogWorkout } from "./pages/logWorkoutPage.js";
import { loadStats } from "./features/stats/stats.js";
import { loadProfile } from "./pages/profilePage.js";
import { muscleGroupRecommender, timeoutIterator } from './utils/generatorUtils.js';
import { muscleGroups } from "./utils/constants.js";

document.addEventListener("DOMContentLoaded", () => {
  // Navigation buttons map: id => handler
  const navMap = {
    "nav-log": loadLogWorkout,
    "nav-routines": initRoutineUI,
    "nav-stats": (e) => {
      e.preventDefault();
      loadStats();
    },
    "nav-profile": loadProfile,
  };

  for (const [id, handler] of Object.entries(navMap)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
  }

  loadLogWorkout();

  const excludeSet = new Set();
  const recommender = muscleGroupRecommender(muscleGroups, excludeSet);

  const suggestMuscleBtn = document.getElementById('suggestMuscleBtn');
  const suggestedMuscleEl = document.getElementById('suggestedMuscle');

  if (suggestMuscleBtn && suggestedMuscleEl) {
    suggestMuscleBtn.addEventListener('click', () => {
      timeoutIterator(recommender, 5, muscle => {
        suggestedMuscleEl.textContent = `How about: ${muscle}?`;
      });
    });
  }
});
