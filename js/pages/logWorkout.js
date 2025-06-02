import { loadExercisesData, saveExercisesData } from "../utils/dataStream.js";
import { capitalize } from "../utils/formatting.js";
import { workoutManager } from "../core/workoutManager.js";

const contentSection = document.getElementById("content");

export async function loadLogWorkout() {
  const exercisesData = await loadExercisesData();

  const savedWorkoutsRaw = workoutManager.getSavedWorkouts();
  const savedWorkouts = savedWorkoutsRaw.filter(w => w && w.date && Array.isArray(w.exercises));

  let currentWorkoutExercises = [];

  const muscleGroups = ["chest", "back", "arms", "shoulders", "core", "legs"];
  const groupVolumes = Object.fromEntries(muscleGroups.map(m => [m, 0]));

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  for (const w of savedWorkouts) {
    const date = new Date(w.date);
    if (date >= sevenDaysAgo && w.exercises) {
      for (const ex of w.exercises) {
        if (groupVolumes[ex.muscleGroup] !== undefined) {
          const vol = ex.sets * ex.reps * (ex.weight || 1);
          groupVolumes[ex.muscleGroup] += vol;
        }
      }
    }
  }

  const recommendedGroup = Object.entries(groupVolumes).reduce((minGroup, [group, volume]) => {
    if (volume < minGroup.volume) return { group, volume };
    return minGroup;
  }, { group: null, volume: Infinity }).group;

  let optionsHTML = '<option value="" disabled selected>Select exercise</option>';
  for (const [group, exercises] of Object.entries(exercisesData)) {
    optionsHTML += `<optgroup label="${capitalize(group)}">`;
    for (const ex of exercises) {
      optionsHTML += `<option value="${ex.id}" data-group="${group}">${ex.name}</option>`;
    }
    optionsHTML += "</optgroup>";
  }

  contentSection.innerHTML = `
    <h3>Next Recommended Muscle Group: <em>${capitalize(recommendedGroup)}</em></h3>

    <form id="add-exercise-to-workout-form">
      <h2>Add Exercise to Workout</h2>
      <label for="exercise-select">Exercise</label>
      <select id="exercise-select" required>${optionsHTML}</select>

      <label for="sets">Sets</label>
      <input type="number" id="sets" min="1" max="20" value="3" required />

      <label for="reps">Reps</label>
      <input type="number" id="reps" min="1" max="100" value="8" required />

      <label for="weight">Weight (kg)</label>
      <input type="number" id="weight" min="0" step="0.5" placeholder="Optional" />

      <label for="notes">Notes</label>
      <textarea id="notes" rows="3" placeholder="Add notes (optional)"></textarea>

      <button type="submit">Add Exercise</button>
    </form>

    <h3>Current Workout Exercises</h3>
    <ul id="current-workout-list"></ul>
    <p><strong>Total Volume: </strong><span id="total-volume">0</span></p>

    <button id="save-workout-btn" disabled>Save Workout</button>

    <h3>Add New Exercise</h3>
    <form id="add-exercise-form">
      <label for="exercise-name">Exercise Name</label>
      <input type="text" id="exercise-name" required />
      <label for="exercise-group">Muscle Group</label>
      <select id="exercise-group" required>
        <option value="chest">Chest</option>
        <option value="back">Back</option>
        <option value="arms">Arms</option>
        <option value="shoulders">Shoulders</option>
        <option value="core">Core</option>
        <option value="legs">Legs</option>
      </select>
      <button type="submit">Add Exercise</button>
    </form>

    <h3>History of Workouts</h3>
    <div id="workout-history"></div>
  `;

  const currentWorkoutList = document.getElementById("current-workout-list");
  const totalVolumeEl = document.getElementById("total-volume");
  const saveWorkoutBtn = document.getElementById("save-workout-btn");

  function renderCurrentWorkout() {
    if (currentWorkoutExercises.length === 0) {
      currentWorkoutList.innerHTML = "<li>No exercises added yet.</li>";
      saveWorkoutBtn.disabled = true;
      totalVolumeEl.textContent = "0";
      return;
    }

    let html = "";
    let totalVolume = 0;

    currentWorkoutExercises.forEach((ex, i) => {
      const volume = ex.sets * ex.reps * (ex.weight || 1);
      totalVolume += volume;

      html += `
        <li>
          <strong>${ex.name} (${capitalize(ex.muscleGroup)})</strong> — Sets: ${ex.sets}, Reps: ${ex.reps}, Weight: ${ex.weight || "Bodyweight"}, Notes: ${ex.notes || "-"}
          <br>Volume: ${volume.toFixed(2)}
          <br>
          <button data-index="${i}" class="edit-exercise-btn">Edit</button>
          <button data-index="${i}" class="delete-exercise-btn">Delete</button>
        </li>
      `;
    });

    currentWorkoutList.innerHTML = html;
    totalVolumeEl.textContent = totalVolume.toFixed(2);
    saveWorkoutBtn.disabled = false;
  }

  currentWorkoutList.addEventListener("click", e => {
    if (e.target.classList.contains("edit-exercise-btn")) {
      const idx = Number(e.target.dataset.index);
      const ex = currentWorkoutExercises[idx];

      document.getElementById("exercise-select").value = ex.exerciseId;
      document.getElementById("sets").value = ex.sets;
      document.getElementById("reps").value = ex.reps;
      document.getElementById("weight").value = ex.weight || "";
      document.getElementById("notes").value = ex.notes;

      currentWorkoutExercises.splice(idx, 1);
      renderCurrentWorkout();
    } else if (e.target.classList.contains("delete-exercise-btn")) {
      const idx = Number(e.target.dataset.index);
      currentWorkoutExercises.splice(idx, 1);
      renderCurrentWorkout();
    }
  });

  document.getElementById("add-exercise-to-workout-form").addEventListener("submit", e => {
    e.preventDefault();

    const select = e.target["exercise-select"];
    const exerciseId = select.value;
    const exerciseName = select.options[select.selectedIndex].text;
    const muscleGroup = select.options[select.selectedIndex].dataset.group;

    const sets = Number(e.target.sets.value);
    const reps = Number(e.target.reps.value);
    const weight = e.target.weight.value ? Number(e.target.weight.value) : null;
    const notes = e.target.notes.value.trim();

    currentWorkoutExercises.push({
      exerciseId,
      name: exerciseName,
      muscleGroup,
      sets,
      reps,
      weight,
      notes
    });

    e.target.reset();
    select.selectedIndex = 0;

    renderCurrentWorkout();
  });

  saveWorkoutBtn.addEventListener("click", () => {
    if (currentWorkoutExercises.length === 0) {
      alert("Add at least one exercise before saving.");
      return;
    }

    const newWorkout = {
      date: new Date().toISOString(),
      exercises: currentWorkoutExercises
    };

    workoutManager.saveWorkout(newWorkout);

    alert("Workout saved!");
    currentWorkoutExercises = [];
    renderCurrentWorkout();
    renderWorkoutHistory();
  });

  document.getElementById("add-exercise-form").addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("exercise-name").value.trim();
    const group = document.getElementById("exercise-group").value;
    if (!name || !group) return;

    const data = await loadExercisesData();

    const newExercise = {
      id: name.toLowerCase().replace(/\s+/g, "_"),
      name
    };

    if (!data[group]) data[group] = [];
    data[group].push(newExercise);

    await saveExercisesData(data);

    alert(`Exercise '${name}' added to ${capitalize(group)}`);
    loadLogWorkout();
  });

  function renderWorkoutHistory() {
    const historyEl = document.getElementById("workout-history");
    const rawWorkouts = workoutManager.getSavedWorkouts();

    if (rawWorkouts.length === 0) {
      historyEl.innerHTML = "<p>No workouts logged yet.</p>";
      return;
    }

    let html = rawWorkouts
      .map((workout) => {
        const dateStr = new Date(workout.date).toLocaleString();
        const exercises = workout.exercises || [];

        let totalVol = 0;
        const exercisesHtml = exercises
          .map((ex) => {
            const name = ex.name || "Unnamed";
            const group = ex.muscleGroup || "Unknown";
            const sets = parseInt(ex.sets) || 0;
            const reps = parseInt(ex.reps) || 0;
            const weight = ex.weight ?? 1;

            let volume = sets * reps * (typeof weight === "number" ? weight : 1);
            totalVol += volume;

            return `<li>
              <strong>${name} (${capitalize(group)})</strong> - 
              Sets: ${sets}, Reps: ${reps}, Weight: ${weight}, 
              Volume: ${volume.toFixed(2)}
            </li>`;
          })
          .join("");

        return `
          <div class="workout-history-entry" style="margin-bottom:1em; border: 1px solid #ccc; padding: 8px; border-radius:4px;">
            <strong>Workout on ${dateStr}</strong>
            ${workout.routineName ? `<div><em>Routine: ${workout.routineName}</em></div>` : ""}
            <div>Total Volume: ${totalVol.toFixed(2)}</div>
            <ul>${exercisesHtml}</ul>
          </div>
        `;
      })
      .reverse()
      .join("");

    historyEl.innerHTML = html;
  }

  renderCurrentWorkout();
  renderWorkoutHistory();
}

export function logWorkoutSession(session) {
  const completeSession = {
    ...session,
    date: session.date || new Date().toISOString(),
  };
  workoutManager.saveWorkout(completeSession);
}

export function startRoutineSession(routine) {
  const content = document.getElementById("content");

  content.innerHTML = `
  <h2>Logging: ${routine.name}</h2>
  <form id="routine-log-form">
    <label for="routine-date">Date</label>
    <input type="date" id="routine-date" name="routine-date" />
    <ul id="routine-log-list">
      ${routine.exercises.map((ex, i) => `
        <li>
          <strong>${ex.name} (${capitalize(ex.group)})</strong><br>
          Sets: <input type="number" name="sets-${i}" min="1" required>
          Reps: <input type="number" name="reps-${i}" min="1" required>
        </li>
      `).join("")}
    </ul>
    <br>
    <button type="submit">Finish Workout</button>
  </form>
`;

  // Set default date input to today
  const dateInput = document.getElementById("routine-date");
  dateInput.value = new Date().toISOString().slice(0, 10);

  document.getElementById("routine-log-form").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;

    const rawDate = form["routine-date"].value;
    const date = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

    const sessionExercises = routine.exercises.map((ex, i) => {
      return {
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.group,
        sets: Number(form[`sets-${i}`].value),
        reps: Number(form[`reps-${i}`].value),
        weight: null,
        notes: ""
      };
    });

    logWorkoutSession({ date, exercises: sessionExercises, routineName: routine.name });
    alert("Routine workout saved!");
    loadLogWorkout();
  });
}
