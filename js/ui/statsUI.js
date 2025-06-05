import { capitalize } from "../utils/formatting.js";
import { muscleGroups } from "../utils/constants.js";
import {
  getVolumeByMuscle,
  getDailyVolume,
  getTopExercises,
  getLeastTrainedMuscle
} from "../core/statsManager.js";

let volumeChart = null;
let muscleChart = null;

export function renderStatsUI(container) {
  container.innerHTML = `
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

  renderDailyVolumeChart(7);
  renderMuscleDistribution(30); // default 30 days
  setupTimeRangeListener();
}

function renderDailyVolumeChart(days) {
  const volumes = getDailyVolume(days);
  const now = new Date();
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1) + i);
    return d.toLocaleDateString();
  });

  const ctx = document.getElementById("volumeChart").getContext("2d");
  if (volumeChart) volumeChart.destroy();

  volumeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `Volume (last ${days} days)`,
        data: volumes,
        backgroundColor: "#4ade80"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function renderMuscleDistribution(days) {
  let startDate = null;
  const now = new Date();
  if (days !== "all") {
    startDate = new Date();
    startDate.setDate(now.getDate() - days);
  }

  const groupTotals = getVolumeByMuscle(startDate || new Date(0), now);
  const recommended = getLeastTrainedMuscle(groupTotals);
  document.getElementById("recommended-group").textContent = capitalize(recommended || "None");

  const ctx = document.getElementById("muscleDistributionChart").getContext("2d");
  if (muscleChart) muscleChart.destroy();

  muscleChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: muscleGroups.map(capitalize),
      datasets: [{
        data: muscleGroups.map(g => groupTotals[g] || 0),
        backgroundColor: ["#f87171", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"]
      }]
    },
    options: { responsive: true }
  });

  renderTopExercises();
}

function renderTopExercises(limit = 5) {
  const topExercises = getTopExercises(limit);
  const container = document.getElementById("topExercises");
  container.innerHTML = `
    <h4>Main Exercises</h4>
    <ul>
      ${topExercises.map(([name, count]) => `<li>${name} (${count} times)</li>`).join("")}
    </ul>
  `;
}

function setupTimeRangeListener() {
  const rangeSelect = document.getElementById("time-range");
  rangeSelect.addEventListener("change", () => {
    const val = rangeSelect.value === "all" ? "all" : parseInt(rangeSelect.value);
    renderMuscleDistribution(val);
  });
}