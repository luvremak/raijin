import { initRoutineUI } from "./ui/routineUI.js";
import { loadLogWorkout } from "./pages/logWorkout.js";
import { loadStats } from "./pages/stats.js";
import { loadProfile } from "./pages/profile.js";

document.getElementById("nav-log").addEventListener("click", loadLogWorkout);
document.getElementById("nav-routines").addEventListener("click", initRoutineUI);
document.getElementById("nav-stats").addEventListener("click", loadStats);
document.getElementById("nav-profile").addEventListener("click", loadProfile);

document.addEventListener("DOMContentLoaded", () => {
  loadLogWorkout(); 
});