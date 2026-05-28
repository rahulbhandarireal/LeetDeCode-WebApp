import React from 'react'
import { useLeetCodeData } from '../hooks/useLeetCodeData'
import POTD from '../components/POTD'
import RatingChart from '../components/RatingChart'
import Stats from '../components/Stats'
import RecentlySolved from '../components/RecentlySolved'

function Home() {
  const username = localStorage.getItem("name") || "Guest";
  const { userData, potdData, loading, error, clearCache } = useLeetCodeData(username);

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
          onClick={clearCache}
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