import React, { useState, useEffect } from 'react'

function RecentlySolved() {
  const [recentactivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = localStorage.getItem("name") || "Guest";

  useEffect(() => {
    if (username === "Guest") {
      setLoading(false);
      return;
    }

    const fetchRecentProblems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8081/api/leetcode/recentsolvedproblem/${username}`);
        const result = await res.json();
        
        if (result.success && Array.isArray(result.data)) {
          setRecentActivity(result.data);
        } else {
          setError(result.message || "Failed to fetch activity");
        }
      } catch (err) {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProblems();
  }, [username]);

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

function RecentCard({ques}){
    if (!ques) return null;
    return (
        <div className='flex p-4 justify-between flex-row border-collapse border-t border-b border-white/10 hover:bg-white/5 transition'>
           <div className="font-medium">{ques.title || "Unknown Problem"}</div>
           <div className='flex w-4/12 flex-row justify-between items-center'>
             <span className={`${
               ques.difficulty === 'Easy' ? 'text-green-400' : 
               ques.difficulty === 'Medium' ? 'text-yellow-400' : 
               ques.difficulty === 'Hard' ? 'text-red-400' : 'text-gray-400'
             } text-sm`}>{ques.difficulty || ""}</span> 
             <span className='text-gray-500 text-[10px]'>{ques.time || ""}</span> 
            </div>
        </div>
    )
}

export default RecentlySolved