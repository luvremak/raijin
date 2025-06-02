async function loadExercisesData() {
  const res = await fetch("data/exercises.json");
  const defaultData = await res.json();

  const customDataStr = localStorage.getItem("customExercises");
  if (!customDataStr) return defaultData;

  try {
    const customData = JSON.parse(customDataStr);

    for (const [group, exercises] of Object.entries(customData)) {
      if (!defaultData[group]) defaultData[group] = [];
      const existingIds = new Set(defaultData[group].map(e => e.id));
      exercises.forEach(ex => {
        if (!existingIds.has(ex.id)) defaultData[group].push(ex);
      });
    }
    return defaultData;
  } catch {
    return defaultData;
  }
}

function saveExercisesData(data) {
  localStorage.setItem("customExercises", JSON.stringify(data));
}

function saveWorkout(entry) {
  let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  workouts.push(entry);
  localStorage.setItem("workouts", JSON.stringify(workouts));
}

export { loadExercisesData, saveExercisesData, saveWorkout };
