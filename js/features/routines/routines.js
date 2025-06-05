const ROUTINES_STORAGE_KEY = "routines";

function getRoutines() {
  return JSON.parse(localStorage.getItem(ROUTINES_STORAGE_KEY) || "[]");
}

function saveRoutines(routines) {
  localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
}

function createRoutine(name) {
  const routines = getRoutines();
  const newRoutine = { id: Date.now(), name, exercises: [] };
  routines.push(newRoutine);
  saveRoutines(routines);
  return newRoutine;
}

function updateRoutine(updatedRoutine) {
  const routines = getRoutines();
  const idx = routines.findIndex(r => r.id === updatedRoutine.id);
  if (idx !== -1) {
    routines[idx] = updatedRoutine;
    saveRoutines(routines);
  }
}

function findRoutineById(id) {
  const routines = getRoutines();
  return routines.find(r => r.id === id);
}

export { getRoutines, createRoutine, updateRoutine, findRoutineById };