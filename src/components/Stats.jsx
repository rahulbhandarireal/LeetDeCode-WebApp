import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'; // Don't forget this for base styles!

function Stats({ userStat }) {
  return (
    // Added 'flex flex-col items-center' to ensure the header and chart are aligned
    <div className='w-full md:w-[40%] rounded-md m-2 bg-[var(--component-surface)] text-white p-4 flex flex-col items-center'>
        <h3 className='font-[var(--font-body)]  font-bold
        text-2xl
        w-full text-left self-start mb-2'>Solved Problems</h3>

        {/* This container is now a square and centered */}
        <div className="relative w-64 h-64 mx-auto"> 

          {/* Outer: Easy */}
          <div className="w-full h-full absolute top-0 left-0">
            <CircularProgressbar
              value={userStat.easy}
              strokeWidth={6}
              styles={buildStyles({
                pathColor: "var(--color-easy)",
                trailColor: "#2a2a2a",
              })}
            />
          </div>

          {/* Middle: Medium */}
          <div className="w-[75%] h-[75%] absolute top-[12.5%] left-[12.5%]">
            <CircularProgressbar
              value={userStat.medium}
              strokeWidth={8} // Slightly thicker looks better on inner rings
              styles={buildStyles({
                pathColor: "var(--color-medium)",
                trailColor: "#2a2a2a",
              })}
            />
          </div>

          {/* Inner: Hard */}
          <div className="w-[50%] h-[50%] absolute top-[25%] left-[25%]">
            <CircularProgressbar
              value={userStat.hard}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: "var(--color-hard)",
                trailColor: "#2a2a2a",
              })}
            />
          </div>

          {/* Total Count in Center */}
          <div className="flex flex-col items-center justify-center absolute inset-0">
             <span className="text-2xl font-bold">{userStat.total}</span>
             <span className="text-xs text-gray-400 uppercase">Total</span>
          </div>
        </div>

        {/* Legend / Stats Row */}
        <div className='flex flex-row justify-between w-full mt-6 px-2'>
           <StatItem color="var(--color-easy)" label="EASY" value={userStat.easy} />
           {/* Fixed the typo from 'meadium' to 'medium' */}
           <StatItem color="var(--color-medium)" label="MEDIUM" value={userStat.medium} />
           <StatItem color="var(--color-hard)" label="HARD" value={userStat.hard} />
        </div>
    </div>
  )
}

// Small helper component to keep your code clean
const StatItem = ({ color, label, value }) => (
  <div className="text-center">
    <div style={{ backgroundColor: color }} className="w-3 h-3 rounded-full inline-block mr-2"></div>
    <span className="text-xs font-semibold text-gray-300">{label}</span>
    <p className="text-xl font-bold mt-1">{value}</p>
  </div>
);

export default Stats