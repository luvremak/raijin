import { renderStatsUI } from "../../ui/statsUI.js";

export function loadStatsPage() {
  const contentSection = document.getElementById("content");
  renderStatsUI(contentSection);
}