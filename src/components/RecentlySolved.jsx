import React, { useState, useEffect } from 'react'
import { ENDPOINTS } from '../config/api';
import { STORAGE_KEYS, CACHE_DURATION } from '../constants/storage';

function RecentlySolved() {
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
  const CACHE_KEY = STORAGE_KEYS.RECENT(username);
  const CACHE_TIME = CACHE_DURATION.RECENT; // 1 hour

  const [recentactivity, setRecentActivity] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) return data;
      } catch (e) { return []; }
    }
    return [];
  });
  
  const [loading, setLoading] = useState(!recentactivity.length && username !== "Guest");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username === "Guest") {
      setLoading(false);
      return;
    }

    const fetchRecentProblems = async () => {
      try {
        if (!recentactivity.length) {
          setLoading(true);
        }

        // 1. Check Cache (re-check in case it was updated by another component)
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) {
              setRecentActivity(data);
              setLoading(false);
              return;
            }
          } catch (e) { }
        }

        const res = await fetch(ENDPOINTS.recentSolved(username));
        if (res && typeof res.json === 'function') {
          const result = await res.json();
          if (result && result.success && Array.isArray(result.data)) {
            // 2. Limit to at most 10 items
            const limitedData = result.data.slice(0, 10);
            setRecentActivity(limitedData);
            
            // 3. Update Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: limitedData,
              timestamp: Date.now()
            }));
          } else {
            setError(result?.message || "Failed to fetch activity");
          }
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProblems();
  }, [username, CACHE_KEY, CACHE_TIME]);

  return (
    <div className='text-white w-4/6 rounded-md bg-[var(--component-surface)] p-4 min-h-[300px]'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='font-bold text-xl'>RECENT ACTIVITY</h1>
          <button className='bg-amber-400 rounded-md px-3 py-1 text-black font-bold cursor-pointer hover:bg-amber-500 transition'>
            View All
          </button>
        </div>

        <div className='w-full flex flex-col'>
          {loading ? (
            <div className="flex flex-col gap-4 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-800/50 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-gray-500 text-center py-10 italic">
              {username === "Guest" ? "Login to see your activity" : error}
            </div>
          ) : recentactivity.length === 0 ? (
            <div className="text-gray-500 text-center py-10 italic">No recent activity found</div>
          ) : (
            recentactivity.map((act, index) => act && <RecentCard key={index} ques={act} />)
          )}
        </div>
    </div>
  );
}

function RecentCard({ ques }) {
  if (!ques) return null;
  const difficulty = ques.difficulty?.toLowerCase();
  let colorClass = 'text-gray-400';
  if (difficulty === 'easy') colorClass = 'text-[var(--color-easy)]';
  else if (difficulty === 'medium') colorClass = 'text-[var(--color-medium)]';
  else if (difficulty === 'hard') colorClass = 'text-[var(--color-hard)]';

  return (
    <div className='flex p-4 justify-between flex-row border-collapse border-t border-b border-white/10 hover:bg-white/5 transition'>
      <div className="font-medium">{ques.title || "Unknown Problem"}</div>
      <div className='flex w-4/12 flex-row justify-between items-center'>
        <span className={`${colorClass} text-sm font-bold`}>
          {ques.difficulty || ""}
        </span>
        <span className='text-gray-500 text-[10px]'>{ques.time || ""}</span>
      </div>
    </div>
  );
}

export default RecentlySolved