export const RANK_THRESHOLDS = [
  { name: 'Guardian', minRating: 2200, color: 'text-red-400' },
  { name: 'Knight',   minRating: 1800, color: 'text-blue-400' },
  { name: 'Newbie',   minRating: 0,    color: 'text-gray-400' },
];

export function getRank(rating) {
  if (!rating) return "Newbie";
  if (rating >= 2200) return "Guardian";
  if (rating >= 1800) return "Knight";
  return "Newbie";
}
