// ─────────────────────────────────────────────────────────────────────────────
// API Configuration
// To change backend URLs: edit .env in the project root.
//   VITE_USER_SERVICE_URL   → LeetCode / User / Friends / POTD service
//   VITE_BATTLE_SERVICE_URL → Battle / Execute / Problem service
// ─────────────────────────────────────────────────────────────────────────────

/** Base URL for the User / LeetCode service (default: localhost:8081) */
export const USER_API = import.meta.env.VITE_USER_SERVICE_URL ?? 'http://localhost:8081';

/** Base URL for the Battle / Execute service (default: localhost:8082) */
export const BATTLE_API = import.meta.env.VITE_BATTLE_SERVICE_URL ?? 'http://localhost:8082';

// ─────────────────────────────────────────────────────────────────────────────
// Named Endpoints
// All API calls in the app should use these instead of raw URL strings.
// ─────────────────────────────────────────────────────────────────────────────
export const ENDPOINTS = {

  // ── User / LeetCode Service (USER_API) ──────────────────────────────────

  /** GET user stats (easy/medium/hard solved, rating, etc.) */
  userStats: (username) =>
    `${USER_API}/api/leetcode/stats/${username}`,

  /** GET today's problem of the day */
  potd: () =>
    `${USER_API}/api/leetcode/questionoftheday`,

  /** GET whether the current user has solved today's POTD */
  potdSolved: (username) =>
    `${USER_API}/api/leetcode/ispotdsolved/${username}`,

  /** GET full contest rating history for a user */
  ratingHistory: (username) =>
    `${USER_API}/api/leetcode/rating/${username}`,

  /** GET recently solved problems for a user */
  recentSolved: (username) =>
    `${USER_API}/api/leetcode/recentsolvedproblem/${username}`,

  /** GET all friends/known users for a given username */
  allFriends: (username) =>
    `${USER_API}/relation/findallknown/${username}`,

  /** POST create a friendship relation between two users */
  makeRelation: (currentUser, targetUser) =>
    `${USER_API}/relation/makerelation/${currentUser}/${targetUser}`,

  /** DELETE a friendship relation */
  deleteRelation: (currentUser, targetUser) =>
    `${USER_API}/relation/deleteknown/${currentUser}/${targetUser}`,

  // ── Battle / Execute Service (BATTLE_API) ───────────────────────────────

  /** GET decode-points for a player */
  userPoints: (username) =>
    `${BATTLE_API}/user/getuserpoints?playerId=${encodeURIComponent(username)}`,

  /** POST create a new battle room */
  battleCreate: () =>
    `${BATTLE_API}/battle/create`,

  /** GET battle history for a host username */
  battleHistory: (username) =>
    `${BATTLE_API}/battle/history?hostUsername=${encodeURIComponent(username)}`,

  /** GET current status of a battle room by room code */
  roomStatus: (roomCode) =>
    `${BATTLE_API}/battle/roomstatus/${roomCode}`,

  joinRoom : () =>
    `${BATTLE_API}/battle/join`,

  /** GET problem details by problem ID (AI-generated) */
  getProblem: (problemId) =>
    `${BATTLE_API}/getproblem/ai/?problemId=${problemId}`,

  /** POST run code against sample test cases only */
  runSample: () =>
    `${BATTLE_API}/execute/run/sample`,

  /** POST submit code against all test cases */
  runSubmit: () =>
    `${BATTLE_API}/execute/run/submit`,

  /** POST force-full-submit (used when exiting battle early) */
  forceSubmit: () =>
    `${BATTLE_API}/execute/run/forcefullsubmit`,

  // ── Sheets / Practice (USER_API) ─────────────────────────────────────────

  /** GET all sheets (popular/topic wise) */
  allSheets: () =>
    `${USER_API}/sheets/all`,

  /** GET questions for a specific sheet by ID */
  sheetById: (id) =>
    `${USER_API}/sheets/${id}`,
};
