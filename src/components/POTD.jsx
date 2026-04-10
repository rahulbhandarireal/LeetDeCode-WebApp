import React from 'react'

function POTD() {

    const potd ={
        issolved:false,
        questioncontent:"Lexicographical Matrix Path Minimization",
        tags:["DP","Heap"],
        solvedby:"4.2k"
    }
  return (
    <div className='text-white md:w-[40%] w-full p-2 bg-[var(--component-surface)] flex gap-10  flex-col w-3/8 m-2 '>

        <div className='flex flex-row justify-between items-center'>
            <h2 className='font-bold text-xl'>PROBLEM OF THE DAY</h2>
            <div className={`${!potd.issolved?"bg-red-500":
                "bg-green-600"} p-2 rounded-xl`}>
                {
                    potd.issolved ? "SOLVED" : "PENDING"
                }
            </div>
        </div>

        <div className='text-2xl font-bold'>
            {potd.questioncontent}
        </div>

        <div className='flex  flex-wrap flex-row justify-around'>
            {
                potd.tags.map( (tag,index) => {
                    return <div key={index}>
                        {tag}
                        </div>
                } )
            }
        </div>

        <button className={`bg-[var(--color-medium)]  
        p-2 w-11/12 m-auto ${potd.issolved? "cursor-not-allowed opacity-50 bg-green-600" : "cursor-pointer"}
        rounded-2xl text-black`}>{potd.issolved?"SOLVED" :"SOLVE NOW"}</button>
        <div className='flex flex-row justify-between text-gray-500'>
            <p>Ends in </p>
            <p>{potd.solvedby}</p>
        </div>

    </div>
  )
}

export default POTD