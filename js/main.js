import { initRoutineUI } from "./ui/routineUI.js";
import { initLogWorkoutPage } from "./pages/logWorkoutPage.js";
import { loadStatsPage } from "./features/stats/stats.js";
import { loadProfile } from "./features/profile/profile.js";
import { muscleGroupRecommender, timeoutIterator } from './utils/generatorUtils.js';
import { muscleGroups } from "./utils/constants.js";

document.addEventListener("DOMContentLoaded", () => {
  // Navigation buttons map: id => handler
  const navMap = {
    "nav-log": initLogWorkoutPage,
    "nav-routines": initRoutineUI,
    "nav-stats": (e) => {
      e.preventDefault();
      loadStatsPage();
    },
    "nav-profile": loadProfile,
  };

  for (const [id, handler] of Object.entries(navMap)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
  }

  initLogWorkoutPage();

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
