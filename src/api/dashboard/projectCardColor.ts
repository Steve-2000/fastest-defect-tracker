export const getProjectCardColor = (index: number) => {
  const colors = ["#6366f1","#0ea5e9","#f59e0b","#10b981","#ef4444","#8b5cf6"];
  return colors[index % colors.length];
};
