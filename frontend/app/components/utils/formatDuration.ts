export const formatDuration = (totalMinutes: number) => {
  const safeMinutes = Math.floor(totalMinutes || 0); // ensure integer
  const hrs = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (hrs === 0 && mins === 0) return "0h";

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;

  return `${hrs}h ${mins}m`;
};