import { capitalize } from "../utils/formatting.js";
const contentSection = document.getElementById("content");

export function loadStats() {
  contentSection.innerHTML = `
    <h2>Workout Stats</h2>
    <h3>Next Recommended Muscle Group: <em id="recommended-group"></em></h3>
    <canvas id="volumeChart" height="150"></canvas>
    <h3>Advanced Statistics</h3>
    <select id="time-range">
      <option value="30">Last 30 Days</option>
      <option value="90">Last 3 Months</option>
      <option value="365">Last Year</option>
      <option value="all">All Time</option>
    </select>
    <canvas id="muscleDistributionChart" height="150"></canvas>
    <div id="topExercises"></div>
  `;

  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  const dailyVolume = Array(7).fill(0);
  const muscleGroups = ["chest", "back", "arms", "shoulders", "core", "legs"];
  const groupTotals = Object.fromEntries(muscleGroups.map(m => [m, 0]));

  // Count top exercises
  const topExercisesCount = {};

  for (const w of workouts) {
    const workoutDate = new Date(w.date);
    if (workoutDate < sevenDaysAgo || workoutDate > now) continue;

    // loop through each exercise inside the workout
    for (const ex of w.exercises || []) {
      const mg = (ex.muscleGroup || "").toLowerCase().trim();
      if (!muscleGroups.includes(mg)) continue;

      const volume = ex.sets * ex.reps * (ex.weight || 1);

      // Add to daily volume
      const dayDiff = Math.floor((workoutDate - sevenDaysAgo) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) dailyVolume[dayDiff] += volume;

      // Add to muscle group totals
      groupTotals[mg] += volume;

      // Count exercises for top list
      if (ex.exerciseName) {
        topExercisesCount[ex.exerciseName] = (topExercisesCount[ex.exerciseName] || 0) + 1;
      }
    }
  }

  // Find muscle group with minimum volume (recommended next)
  const recommendedGroup = Object.entries(groupTotals).reduce((minGroup, [group, volume]) => {
    if (volume < minGroup.volume) return { group, volume };
    return minGroup;
  }, { group: null, volume: Infinity }).group;

  document.getElementById("recommended-group").textContent = capitalize(recommendedGroup || "None");

  // Volume bar chart
  new Chart(document.getElementById("volumeChart"), {
    type: "bar",
    data: {
      labels: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString();
      }),
      datasets: [{
        label: "Volume (last 7 days)",
        data: dailyVolume,
        backgroundColor: "#4ade80"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // Muscle distribution doughnut chart
  new Chart(document.getElementById("muscleDistributionChart"), {
    type: "doughnut",
    data: {
      labels: muscleGroups.map(capitalize),
      datasets: [{
        data: muscleGroups.map(g => groupTotals[g]),
        backgroundColor: ["#f87171", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"]
      }]
    },
    options: { responsive: true }
  });

  // Top exercises list
  const sortedTop = Object.entries(topExercisesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  document.getElementById("topExercises").innerHTML = `
    <h4>Main Exercises</h4>
    <ul>
      ${sortedTop.map(([name, count]) => `<li>${name} (${count} times)</li>`).join("")}
    </ul>
  `;
}