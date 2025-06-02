document.querySelectorAll("nav button").forEach(button => {
  button.addEventListener("click", () => {
    const viewId = button.dataset.view;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
  });
});

document.getElementById("DashboardView").classList.add("active");
