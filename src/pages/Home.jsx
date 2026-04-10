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
   return (<div className='bg-[var(--color-background)] h-full'>
    <div className='flex flex-row justify-between w-full'>
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