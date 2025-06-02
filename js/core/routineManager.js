export function saveRoutine(routine) {
  const routines = JSON.parse(localStorage.getItem("routines") || "[]");
  routines.push(routine);
  localStorage.setItem("routines", JSON.stringify(routines));
}

export function getRoutines() {
  return JSON.parse(localStorage.getItem("routines") || "[]");
}