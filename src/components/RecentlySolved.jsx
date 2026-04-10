import React from 'react'

function RecentlySolved() {
    const recentactivity=[
        {
            title:"Container With Most Water",
            difficulty:"Medium",
            time:"2H AGO",
        },
        {
            title:"Two Sum",
            difficulty:"Easy",
            time:"5H AGO",
        },
        {
            title:"N-Queens III",
            difficulty:"Hard",
            time:"YESTERDAY",
        },
        {
            title:"Kth Largest Element",
            difficulty:"Medium",
            time:"2D AGO",
        },
    ]

  return (
    <div className='text-white w-4/7 rounded-md
     bg-[var(--component-surface)] p-4'>
        <div className='flex justify-between'>
        <h1 className='font-bold text-xl'>
            RECENT ACTIVITY
        </h1>
        <button className='bg-amber-400 rounded-md p-1
        font-bold cursor-pointer'>View All</button>
         </div>
        <div className='w-full flex flex-col mt-4
         justify-between'>
        {
            recentactivity.map( (act,index) => <RecentCard key={index} ques={act} />)
        }
        </div>
    </div>
  )
}

function RecentCard({ques}){
    return (
        <div className='flex p-4 justify-between flex-row border-collapse border-t border-b border-white/20'>
           <div>{ques.title}</div>
           <div className='flex w-2/12 flex-row justify-between '>
             <span>{ques.difficulty} </span> 
             <span className='text-gray-400 text-[10px] align-bottom'>{ques.time}</span> 
            </div>
        </div>
    )
}

export default RecentlySolved