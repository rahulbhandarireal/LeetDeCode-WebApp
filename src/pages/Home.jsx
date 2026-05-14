import React, { useState, useEffect } from 'react'
import POTD from '../components/POTD'
import RatingChart from '../components/RatingChart'
import Stats from '../components/Stats'
import RecentlySolved from '../components/RecentlySolved'

function Home() {
  const [userData, setUserData] = useState(null);
  const [potdData, setPotdData] = useState({
    issolved: false,
    questioncontent: "Lexicographical Matrix Path Minimization", // Default/Fallback
    tags: ["DP", "Heap"],
    solvedby: "4.2k"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = localStorage.getItem("name") || "Guest";
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (username === "Guest") {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch User Stats (with caching)
        const statsCacheKey = `userStats_${username}`;
        const cachedStats = localStorage.getItem(statsCacheKey);
        let statsData = null;

        if (cachedStats) {
          const { data, timestamp } = JSON.parse(cachedStats);
          if (Date.now() - timestamp < CACHE_TIME) {
            statsData = data;
          }
        }

        if (!statsData) {
          const statsRes = await fetch(`http://localhost:8081/api/leetcode/stats/${username}`);
          const statsResult = await statsRes.json();
          if (statsResult.success) {
            statsData = statsResult.data;
            localStorage.setItem(statsCacheKey, JSON.stringify({ data: statsData, timestamp: Date.now() }));
          } else {
            throw new Error(statsResult.message || "Failed to fetch user data");
          }
        }
        setUserData(statsData);


        // 3. Fetch POTD Status (with specific caching)
        const potdCacheKey = `potdSolved_${username}_${today}`;
        const isPotdSolvedCached = localStorage.getItem(potdCacheKey) === "true";
        
        let potdSolved = isPotdSolvedCached;

        if (!potdSolved) {
          const potdRes = await fetch(`http://localhost:8081/api/leetcode/ispotdsolved/${username}`);
          const potdResult = await potdRes.json();
          if (potdResult.success) {
            // Check if the response is "solved"
            potdSolved = potdResult.data && typeof potdResult.data === 'string' && potdResult.data.toLowerCase() === "solved";
            if (potdSolved) {
              localStorage.setItem(potdCacheKey, "true");
            }
          } else {
            console.error("Failed to fetch POTD status:", potdResult.message);
          }
        }

        setPotdData(prev => ({
          ...prev,
          issolved: potdSolved
        }));

      } catch (err) {
        setError(err.message || "Could not connect to backend API");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, today]);

  const getRank = (rating) => {
    if (!rating) return "Newbie";
    if (rating >= 2200) return "Guardian";
    if (rating >= 1800) return "Knight";
    return "Newbie";
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl font-bold animate-pulse text-[var(--color-logo)]">Syncing with LeetCode...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="text-red-500 text-2xl font-bold mb-4">Error: {error}</div>
        <button 
          onClick={() => {
            localStorage.removeItem(`userStats_${username}`);
            localStorage.removeItem(`potdSolved_${username}_${today}`);
            window.location.reload();
          }}
          className="bg-[var(--color-logo)] px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
        >
          Clear Cache & Retry
        </button>
      </div>
    );
  }

  const userStat = userData ? {
    easy: userData.easySolved || 0,
    medium: userData.mediumSolved || 0,
    hard: userData.hardSolved || 0,
    total: userData.totalSolved || 0
  } : {
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0
  };

  const points = userData?.contributionPoints || 0;
  const rating = userData?.rating || 0;
  const rank = getRank(rating);

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-4 md:p-8'>
      
      {/* User Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[var(--component-surface)] p-6 rounded-md mb-8 w-full text-white shadow-lg border border-gray-800/50">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-[var(--color-logo)]">Welcome back, {username}!</h1>
          <p className="text-gray-400 mt-1">Ready to tackle some problems today?</p>
        </div>
        <div className="flex gap-8 text-center bg-[#1a1a1a] py-3 px-8 rounded-xl border border-gray-700/30">
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Points</p>
            <p className="text-2xl font-extrabold text-orange-400">{points}</p>
          </div>
          <div className="w-[1px] bg-gray-700"></div> {/* Divider */}
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Rating</p>
            <p className="text-2xl font-extrabold text-yellow-400">{isNaN(rating) ? 0 : Math.round(rating)}</p>
          </div>
          <div className="w-[1px] bg-gray-700"></div> {/* Divider */}
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Rank</p>
            <p className={`text-2xl font-extrabold ${rank === 'Guardian' ? 'text-red-400' : rank === 'Knight' ? 'text-blue-400' : 'text-gray-400'}`}>{rank}</p>
          </div>
        </div>
      </div>

      <div className='flex flex-col md:flex-row justify-between w-full gap-6'>
        <Stats userStat={userStat} />
        <RatingChart />
      </div>

      <div className="flex flex-col md:flex-row justify-between mt-10 w-full gap-6">
        <POTD potd={potdData} />
        <RecentlySolved />
      </div>
    </div>
  );
}

export default Home;