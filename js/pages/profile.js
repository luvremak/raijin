import { capitalize } from "../utils/formatting.js";
import { muscleGroups } from "../utils/constants.js";

const contentSection = document.getElementById("content");

export function loadProfile() {
  contentSection.innerHTML = `
    <h2>Your Profile</h2>
    <div id="profile-info">
      <label for="username">Name:</label>
      <input type="text" id="username" placeholder="Enter your name" />
      
      <label for="avatar-url">Avatar URL:</label>
      <input type="url" id="avatar-url" placeholder="Enter avatar image URL" />

      <button id="save-profile">Save Profile</button>
    </div>

    <h3>Workout Summary</h3>
    <p>Total workouts logged: <strong id="total-workouts">0</strong></p>
    <p>Favorite muscle group: <strong id="fav-muscle">N/A</strong></p>

    <div id="profile-message"></div>
  `;

  loadProfileData();

  document.getElementById("save-profile").addEventListener("click", saveProfileData);
}

function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");

  document.getElementById("username").value = profile.name || "";
  document.getElementById("avatar-url").value = profile.avatar || "";

  document.getElementById("total-workouts").textContent = workouts.length;

  const muscleCounts = {};
  for (const group of muscleGroups) muscleCounts[group] = 0;

  for (const workout of workouts) {
    for (const ex of workout.exercises || []) {
      const mg = (ex.muscleGroup || "").toLowerCase();
      if (muscleCounts[mg] !== undefined) muscleCounts[mg]++;
    }
  }

  const favMuscle = Object.entries(muscleCounts).reduce(
    (max, [group, count]) => (count > max.count ? { group, count } : max),
    { group: "N/A", count: 0 }
  ).group;

  document.getElementById("fav-muscle").textContent = capitalize(favMuscle);
}

function saveProfileData() {
  const name = document.getElementById("username").value.trim();
  const avatar = document.getElementById("avatar-url").value.trim();

  if (!name) {
    showMessage("Please enter a name.", true);
    return;
  }

  localStorage.setItem("profile", JSON.stringify({ name, avatar }));
  showMessage("Profile saved successfully!", false);
}

function showMessage(msg, isError) {
  const msgDiv = document.getElementById("profile-message");
  msgDiv.textContent = msg;
  msgDiv.style.color = isError ? "red" : "green";
  setTimeout(() => {
    msgDiv.textContent = "";
  }, 3000);
}
