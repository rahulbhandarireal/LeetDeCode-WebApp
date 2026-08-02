import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';
import { STORAGE_KEYS, CACHE_DURATION } from '../constants/storage';

export function useLeetCodeData(username) {
  const CACHE_TIME = CACHE_DURATION.USER_STATS; // 5 minutes for user stats
  const today = new Date().toISOString().split('T')[0];

  const [userData, setUserData] = useState(() => {
    const statsCacheKey = STORAGE_KEYS.USER_STATS(username);
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
    const potdDataCacheKey = STORAGE_KEYS.POTD_DATA(today);
    const potdSolvedCacheKey = STORAGE_KEYS.POTD_SOLVED(username, today);
    const cachedPotdData = localStorage.getItem(potdDataCacheKey);
    const cachedSolved = localStorage.getItem(potdSolvedCacheKey);

    let issolved = false;
    if (cachedSolved === "true") issolved = true;

    if (cachedPotdData) {
      try {
        const parsed = JSON.parse(cachedPotdData);
        return {
          issolved,
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
      const statsCacheKey = STORAGE_KEYS.USER_STATS(username);

      // We always fetch to keep the cache updated (stale-while-revalidate)
      const fetchStats = async () => {
        try {
          const statsRes = await fetch(ENDPOINTS.userStats(username));
          const statsResult = await statsRes.json();
          if (statsResult && statsResult.success) {
            setUserData(statsResult.data);
            localStorage.setItem(statsCacheKey, JSON.stringify({ data: statsResult.data, timestamp: Date.now() }));
          } else if (!userData) {
            throw new Error(statsResult?.message || "Failed to fetch user data");
          }
        } catch (err) {
          if (!userData) throw err; // Only throw if we have no fallback data
        }
      };

      // ── 2. POTD details + solved status (always fresh) ─────────
      const potdDataCacheKey = STORAGE_KEYS.POTD_DATA(today);
      const potdCacheKey = STORAGE_KEYS.POTD_SOLVED(username, today);
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
          fetch(ENDPOINTS.potd()),
          fetch(ENDPOINTS.potdSolved(username))
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

      // Run both stats and POTD fetch concurrently if needed, but we await POTD above
      await fetchStats();

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
    // Fetch every 10 minutes as requested
    const interval = setInterval(fetchData, 10 * 60 * 1000); 
    
    // Also fetch immediately when user switches back to the tab
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData]);

  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_STATS(username));
    localStorage.removeItem(STORAGE_KEYS.POTD_SOLVED(username, today));
    localStorage.removeItem(STORAGE_KEYS.POTD_DATA(today));
    window.location.reload();
  };

  return { userData, potdData, loading, error, clearCache };
}
