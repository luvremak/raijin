import { capitalize } from "../utils/formatting.js";
import { muscleGroups } from "../utils/constants.js";

const contentSection = document.getElementById("content");

let usernameInput, avatarInput, totalWorkoutsElem, favMuscleElem, messageDiv, avatarPreview;

export function loadProfile() {
  contentSection.innerHTML = `
    <h2>Your Profile</h2>
    <form id="profile-form" aria-label="User Profile Form">
      <div id="profile-info">
        <label for="username">Name:</label>
        <input type="text" id="username" placeholder="Enter your name" aria-required="true" />
        
        <label for="avatar-url">Avatar URL:</label>
        <input type="url" id="avatar-url" placeholder="Enter avatar image URL" aria-describedby="avatar-desc" />
        <small id="avatar-desc">Optional: Provide a link to your avatar image.</small>
        <img id="avatar-preview" alt="Avatar Preview" style="max-width:100px; margin-top:5px; display:none;" />
        
        <button type="submit" id="save-profile">Save Profile</button>
      </div>
    </form>

    <h3>Workout Summary</h3>
    <p>Total workouts logged: <strong id="total-workouts">0</strong></p>
    <p>Favorite muscle group: <strong id="fav-muscle">N/A</strong></p>

    <div id="profile-message" role="alert" aria-live="assertive"></div>
  `;

  // Cache elements for performance
  usernameInput = document.getElementById("username");
  avatarInput = document.getElementById("avatar-url");
  totalWorkoutsElem = document.getElementById("total-workouts");
  favMuscleElem = document.getElementById("fav-muscle");
  messageDiv = document.getElementById("profile-message");
  avatarPreview = document.getElementById("avatar-preview");

  // Load saved data into inputs and summary
  loadProfileData();

  // Avatar live preview on input
  avatarInput.addEventListener("input", updateAvatarPreview);

  // Handle form submit
  const form = document.getElementById("profile-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfileData();
  });
}

function loadProfileData() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");

  usernameInput.value = profile.name || "";
  avatarInput.value = profile.avatar || "";

  updateAvatarPreview();

  totalWorkoutsElem.textContent = workouts.length;

  // Count muscle group usage
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

  favMuscleElem.textContent = capitalize(favMuscle);
}

function updateAvatarPreview() {
  const url = avatarInput.value.trim();
  if (url) {
    avatarPreview.src = url;
    avatarPreview.style.display = "block";
    avatarPreview.onerror = () => {
      showMessage("Could not load avatar image. Please check the URL.", true);
      avatarPreview.style.display = "none";
    };
    avatarPreview.onload = () => {
      clearMessage();
      avatarPreview.style.display = "block";
    };
  } else {
    avatarPreview.style.display = "none";
    avatarPreview.src = "";
  }
}

function saveProfileData() {
  const name = usernameInput.value.trim();
  const avatar = avatarInput.value.trim();

  if (!name) {
    showMessage("Please enter your name.", true);
    usernameInput.focus();
    return;
  }

  if (avatar && !isValidUrl(avatar)) {
    showMessage("Please enter a valid avatar URL or leave it blank.", true);
    avatarInput.focus();
    return;
  }

  localStorage.setItem("profile", JSON.stringify({ name, avatar }));
  showMessage("Profile saved successfully!", false);
}

function showMessage(msg, isError) {
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "crimson" : "green";
}

function clearMessage() {
  messageDiv.textContent = "";
}

// Simple URL validation
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
