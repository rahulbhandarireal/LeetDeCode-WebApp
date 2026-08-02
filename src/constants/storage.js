export const STORAGE_KEYS = {
  USERNAME:    'name',
  USER_STATS:  (u)    => `userStats_${u}`,
  POTD_DATA:   (date) => `potdData_${date}`,
  POTD_SOLVED: (u, d) => `potdSolved_${u}_${d}`,
  FRIENDS:     (u, d) => `friendsList_${u}_${d}`,
  RECENT:      (u)    => `recentSolved_${u}`,
  SHEETS:                'sheets_data',
  SHEET_SOLVED:(u, id)=> `solved_problems_${u}_${id}`,
  USER_POINTS: (u)    => `userPoints_${u}`,
};

export const CACHE_DURATION = {
  USER_STATS:  5  * 60 * 1000,   // 5 min
  RECENT:      60 * 60 * 1000,   // 1 hr
  FRIENDS:     24 * 60 * 60 * 1000, // 1 day
  SHEETS:      24 * 60 * 60 * 1000, // 1 day
  USER_POINTS: 5  * 60 * 1000,   // 5 min
};
