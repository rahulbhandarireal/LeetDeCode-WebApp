import React from 'react'

function POTD({ potd = { issolved: false, questioncontent: "Loading...", tags: [], solvedby: "", titleSlug: "" } }) {
  return (
    <div className='text-white md:w-[40%] w-full p-4 bg-[var(--component-surface)] flex gap-6 flex-col m-2 rounded-md'>
        <div className='flex flex-row justify-between items-center'>
            <h2 className='font-bold text-xl'>PROBLEM OF THE DAY</h2>
            <div className={`${!potd.issolved?"bg-red-500":
                "bg-green-600"} p-2 rounded-xl text-sm font-bold`}>
                {
                    potd.issolved ? "SOLVED" : "PENDING"
                }
            </div>
        </div>

        <div className='text-2xl font-bold'>
            {potd.questioncontent}
        </div>

        <div className='flex flex-wrap flex-row gap-2'>
            {
                potd.tags && Array.isArray(potd.tags) && potd.tags.map( (tag,index) => {
                    return <div key={index} className="bg-[#2a2a2a] px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-700">
                        {tag}
                        </div>
                } )
            }
        </div>

        <button 
          onClick={() => !potd.issolved && potd.titleSlug && window.open(`https://leetcode.com/problems/${potd.titleSlug}/`, "_blank")}
          className={`bg-[var(--color-logo)]  
          p-2 w-full mt-4 ${potd.issolved? "cursor-not-allowed opacity-50 bg-green-600" : "cursor-pointer hover:scale-[1.02] transition"}
          rounded-xl text-white font-bold`}>{potd.issolved?"SOLVED" :"SOLVE NOW"}</button>
        
        <div className='flex flex-row justify-between text-gray-500 text-sm mt-2'>
            <p>Difficulty: <span className="text-gray-300">Medium</span></p>
            <p>Acceptance Rate : <span className="text-gray-300">{potd.solvedby}</span></p>
        </div>

    </div>
  )
}

export default POTD