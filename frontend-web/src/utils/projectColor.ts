const COLORS = [
  { bg: "#e0e7ff", text: "#4f46e5" },
  { bg: "#fce7f3", text: "#db2777" },
  { bg: "#d1fae5", text: "#059669" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#fee2e2", text: "#dc2626" },
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#f3e8ff", text: "#7c3aed" },
  { bg: "#ffedd5", text: "#ea580c" },
  { bg: "#ecfdf5", text: "#047857" },
  { bg: "#ede9fe", text: "#6d28d9" },
];

export function getProjectColor(projectId: string) {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
