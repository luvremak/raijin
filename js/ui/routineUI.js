import * as routineMgr from "../core/routineManager.js";
console.log("routineMgr exports:", routineMgr);

import { getRoutines, createRoutine, updateRoutine, findRoutineById } from "../core/routineManager.js";
import { loadExercisesData } from "../utils/dataStream.js";
import { saveCurrentWorkout as logWorkoutSession, loadLogWorkout } from "../features/logWorkout/logWorkout.js";


const contentSection = document.getElementById("content");

export function initRoutineUI() {
  renderMainUI();
  renderRoutineList();

  document.getElementById("create-routine-form").addEventListener("submit", e => {
    e.preventDefault();
    const nameInput = e.target["routine-name"];
    const name = nameInput.value.trim();
    if (!name) return;

    createRoutine(name);
    nameInput.value = "";
    renderRoutineList();
  });
}

function renderMainUI() {
  contentSection.innerHTML = `
    <h2>Create Routine</h2>
    <form id="create-routine-form">
      <label for="routine-name">Routine Name</label>
      <input type="text" id="routine-name" required />
      <button type="submit">Create Routine</button>
    </form>
    <h3>My Routines</h3>
    <div id="routine-list"></div>
    <div id="routine-editor" style="margin-top: 2em;"></div>
  `;
}

function renderRoutineList() {
  const routines = getRoutines();
  const listHTML = routines.map(r => `
    <div>
      <strong>${r.name}</strong>
      <button data-id="${r.id}" class="edit-routine-btn">Edit</button>
      <button data-id="${r.id}" class="show-routine-btn">Show Routine</button>
      <button data-id="${r.id}" class="start-routine-btn">Start Routine</button>
    </div>
  `).join("");

  const listContainer = document.getElementById("routine-list");
  listContainer.innerHTML = listHTML;

  listContainer.querySelectorAll(".edit-routine-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const routineId = Number(btn.dataset.id);
      const routine = findRoutineById(routineId);
      if (routine) loadRoutineEditor(routine);
    });
  });

  listContainer.querySelectorAll(".show-routine-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const routine = findRoutineById(Number(btn.dataset.id));
      if (routine) showRoutineDetails(routine);
    });
  });

  listContainer.querySelectorAll(".start-routine-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const routine = findRoutineById(Number(btn.dataset.id));
      if (routine) startRoutineSession(routine);
    });
  });
}

function showRoutineDetails(routine) {
  const editor = document.getElementById("routine-editor");
  editor.innerHTML = `
    <h3>Routine: ${routine.name}</h3>
    <ul>
      ${routine.exercises.map(ex => `
        <li>${ex.name} (${ex.group})</li>
      `).join("")}
    </ul>
  `;
}

async function loadRoutineEditor(routine) {
  const editor = document.getElementById("routine-editor");

  const exercisesData = await loadExercisesData();

  const allExercises = Object.entries(exercisesData).flatMap(([group, exercises]) =>
    exercises.map(ex => ({ ...ex, group }))
  );

  editor.innerHTML = `
    <h3>Edit Routine: ${routine.name}</h3>
    <ul id="routine-exercises-list">
      ${routine.exercises.map((ex, i) => `
        <li>
          ${ex.name} (${ex.group})
          <label>Sets: <input type="number" min="1" value="${ex.sets || 3}" data-index="${i}" data-field="sets" class="exercise-input" style="width: 50px;" /></label>
          <label>Reps: <input type="number" min="1" value="${ex.reps || 10}" data-index="${i}" data-field="reps" class="exercise-input" style="width: 50px;" /></label>
          <button data-index="${i}" class="remove-exercise-btn">Remove</button>
        </li>
      `).join("")}
    </ul>

    <label for="custom-exercise-name">Custom Exercise Name:</label>
    <input type="text" id="custom-exercise-name" placeholder="Exercise name" />

    <label for="custom-exercise-group">Group:</label>
    <input type="text" id="custom-exercise-group" placeholder="Group (e.g. arms)" />

    <button id="add-custom-exercise-btn">Add Custom Exercise</button>

    <br><br>

    <select id="add-exercise-select">
      <option value="" disabled selected>Select Exercise to Add</option>
      ${allExercises.map(ex => `<option value="${ex.id}" data-group="${ex.group}">${ex.name} (${ex.group})</option>`).join("")}
    </select>
    <button id="add-exercise-btn">Add Exercise</button>
    <br><br>
    <button id="save-routine-btn">Save Routine</button>
  `;

  editor.querySelectorAll(".remove-exercise-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      routine.exercises.splice(idx, 1);
      loadRoutineEditor(routine);
    });
  });

  editor.querySelectorAll(".exercise-input").forEach(input => {
    input.addEventListener("input", e => {
      const idx = Number(e.target.dataset.index);
      const field = e.target.dataset.field;
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) {
        routine.exercises[idx][field] = val;
      }
    });
  });

  editor.querySelector("#add-exercise-btn").addEventListener("click", () => {
    const select = editor.querySelector("#add-exercise-select");
    const exId = select.value;
    if (!exId) return alert("Select an exercise to add");

    if (!routine.exercises.find(e => e.id === exId)) {
      const option = select.selectedOptions[0];
      const newEx = {
        id: exId,
        name: option.textContent,
        group: option.dataset.group,
        sets: 3,
        reps: 10
      };
      routine.exercises.push(newEx);
      loadRoutineEditor(routine);
    } else {
      alert("Exercise already added");
    }
  });

  editor.querySelector("#add-custom-exercise-btn").addEventListener("click", () => {
    const nameInput = editor.querySelector("#custom-exercise-name");
    const groupInput = editor.querySelector("#custom-exercise-group");
    const name = nameInput.value.trim();
    const group = groupInput.value.trim() || "general";

    if (!name) {
      alert("Please enter an exercise name");
      return;
    }

    const id = "custom-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    if (!routine.exercises.find(e => e.name.toLowerCase() === name.toLowerCase())) {
      routine.exercises.push({ id, name, group, sets: 3, reps: 10 });
      loadRoutineEditor(routine);
    } else {
      alert("Exercise already added");
    }

    nameInput.value = "";
    groupInput.value = "";
  });

  editor.querySelector("#save-routine-btn").addEventListener("click", () => {
    updateRoutine(routine);
    alert("Routine saved!");
    renderRoutineList();
    loadRoutineEditor(routine);
  });
}

function startRoutineSession(routine) {
  const session = {
    name: routine.name + " - " + new Date().toLocaleString(),
    exercises: routine.exercises.map(ex => ({
      ...ex,
      sets: ex.sets || 3,
      reps: ex.reps || 10
    }))
  };


  const editor = document.getElementById("routine-editor");

  editor.innerHTML = `
    <h3>Start Routine: ${routine.name}</h3>
    <form id="routine-session-form">
      ${session.exercises.map((ex, i) => `
        <div>
          <strong>${ex.name} (${ex.group})</strong><br>
          Sets: <input type="number" name="sets-${i}" value="${ex.sets}" min="1" required />
          Reps: <input type="number" name="reps-${i}" value="${ex.reps}" min="1" required />
        </div><br>
      `).join("")}
      <button type="submit">Finish & Log Workout</button>
    </form>
  `;

  document.getElementById("routine-session-form").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;

    session.exercises.forEach((ex, i) => {
      ex.sets = Number(form[`sets-${i}`].value);
      ex.reps = Number(form[`reps-${i}`].value);
    });

    logWorkoutSession(session);

    alert("Workout logged!");

    loadLogWorkout();
  });
}
