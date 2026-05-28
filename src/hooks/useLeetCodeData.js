import { useState, useEffect, useCallback } from 'react';

export function useLeetCodeData(username) {
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes for user stats
  const today = new Date().toISOString().split('T')[0];

  const [userData, setUserData] = useState(() => {
    const statsCacheKey = `userStats_${username}`;
    const cachedStats = localStorage.getItem(statsCacheKey);
    if (cachedStats) {
      try {
        const { data, timestamp } = JSON.parse(cachedStats);
        if (Date.now() - timestamp < CACHE_TIME) return data;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [potdData, setPotdData] = useState(() => {
    const potdDataCacheKey = `potdData_${today}`;
    const cachedPotdData = localStorage.getItem(potdDataCacheKey);

    if (cachedPotdData) {
      try {
        const parsed = JSON.parse(cachedPotdData);
        return {
          issolved: false, // always start as false; API will update this
          questioncontent: parsed.questioncontent || "Problem of the Day",
          tags: parsed.tags || [],
          solvedby: parsed.solvedby || "N/A",
          titleSlug: parsed.titleSlug || ""
        };
      } catch (e) { /* ignore */ }
    }
    return {
      issolved: false,
      questioncontent: "",
      tags: [],
      solvedby: "",
      titleSlug: ""
    };
  });

  const [loading, setLoading] = useState(!userData || !potdData.questioncontent);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (username === "Guest") {
      setLoading(false);
      return;
    }

    try {
      // Show loading only when no cached data exists
      if (!userData || !potdData.questioncontent) {
        setLoading(true);
      }

      // ── 1. User Stats ──────────────────────────────────────────
      const statsCacheKey = `userStats_${username}`;
      let statsData = userData;

      if (!statsData) {
        const statsRes = await fetch(`http://localhost:8081/api/leetcode/stats/${username}`);
        const statsResult = await statsRes.json();
        if (statsResult && statsResult.success) {
          statsData = statsResult.data;
          localStorage.setItem(statsCacheKey, JSON.stringify({ data: statsData, timestamp: Date.now() }));
        } else {
          throw new Error(statsResult?.message || "Failed to fetch user data");
        }
      }
      setUserData(statsData);

      // ── 2. POTD details + solved status (always fresh) ─────────
      const potdDataCacheKey = `potdData_${today}`;
      const potdCacheKey = `potdSolved_${username}_${today}`;
      const cachedPotdData = localStorage.getItem(potdDataCacheKey);

      let potdSolved = false;
      let potdquestion = "";
      let tags = [];
      let solvedby = "";
      let titleSlug = "";

      // Pre-fill from cache so question title shows immediately
      if (cachedPotdData) {
        try {
          const parsed = JSON.parse(cachedPotdData);
          potdquestion = parsed.questioncontent || "";
          tags = parsed.tags || [];
          solvedby = parsed.solvedby || "";
          titleSlug = parsed.titleSlug || "";
        } catch (e) {
          console.error("Failed to parse cached POTD data", e);
        }
      }

      // Always call both endpoints so solved status is never stale
      try {
        const [potdRes, issolvedRes] = await Promise.all([
          fetch(`http://localhost:8081/api/leetcode/questionoftheday`),
          fetch(`http://localhost:8081/api/leetcode/ispotdsolved/${username}`)
        ]);

        const potdResult = await potdRes.json();
        if (potdResult && potdResult.success) {
          potdquestion = potdResult.data?.title || "";
          tags = potdResult.data?.topicTags || [];
          solvedby = potdResult.data?.acceptanceRate || "";
          titleSlug = potdResult.data?.titleSlug || "";
          localStorage.setItem(potdDataCacheKey, JSON.stringify({
            questioncontent: potdquestion,
            tags,
            solvedby,
            titleSlug
          }));
        }

        const issolvedres = await issolvedRes.json();
        if (issolvedres && issolvedres.success) {
          potdSolved = issolvedres.data === "solved";
          localStorage.setItem(potdCacheKey, potdSolved ? "true" : `false_${Date.now()}`);
        }
      } catch (fetchErr) {
        console.error("Failed to fetch POTD data:", fetchErr);
      }

      setPotdData({
        issolved: potdSolved,
        questioncontent: potdquestion || "Problem of the Day",
        tags: tags || [],
        solvedby: solvedby || "N/A",
        titleSlug
      });

    } catch (err) {
      setError(err.message || "Could not connect to backend API");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [username, today]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // re-check every 5 min
    return () => clearInterval(interval);
  }, [fetchData]);

  const clearCache = () => {
    localStorage.removeItem(`userStats_${username}`);
    localStorage.removeItem(`potdSolved_${username}_${today}`);
    localStorage.removeItem(`potdData_${today}`);
    window.location.reload();
  };

  return { userData, potdData, loading, error, clearCache };
}
