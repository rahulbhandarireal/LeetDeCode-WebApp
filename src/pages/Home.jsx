import React from 'react'

import POTD from '../components/POTD'
import RatingChart from '../components/RatingChart'
import Stats from '../components/Stats'
import RecentlySolved from '../components/RecentlySolved'

function Home() {
  const userStat={
        easy:89,
        medium:50,
        hard:34,
        total:500
    }
  const username = localStorage.getItem("name") || "Guest";
  const points = 1589;
  const rank = "Knight";

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-4 md:p-8'>
      
      {/* User Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[var(--component-surface)] p-6 rounded-md mb-8 w-full text-white shadow-lg">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-[var(--color-logo)]">Welcome back, {username}!</h1>
          <p className="text-gray-400 mt-1">Ready to tackle some problems today?</p>
        </div>
        <div className="flex gap-8 text-center bg-[#2a2a2a] py-3 px-6 rounded-lg">
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Points</p>
            <p className="text-2xl font-extrabold text-orange-400">{points}</p>
          </div>
          <div className="w-[1px] bg-gray-600"></div> {/* Divider */}
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Rank</p>
            <p className="text-2xl font-extrabold text-blue-400">{rank}</p>
          </div>
        </div>
      </div>

      <div className='flex flex-col md:flex-row justify-between w-full gap-6'>
    <Stats userStat={userStat} />
    <RatingChart />
    </div >

    <div className="flex flex-row justify-between mt-10 w-full">
    <POTD />
    <RecentlySolved />
  </div>
   </div>)
}

export default Home