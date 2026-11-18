// Automatically determine the badge color class for a match percentage:
//   >= 80%: green
//   >= 70%: blue
//   >= 60%: yellow
//   < 60%: red
export function getMatchBadgeClass(percent) {
  if (percent >= 80) return "green-badge";
  if (percent >= 70) return "blue-badge";
  if (percent >= 60) return "yellow-badge";
  return "red-badge";
}