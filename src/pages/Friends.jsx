import React, { useState, useEffect } from 'react';
import Stats from '../components/Stats';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call to fetch friends' stats
    const fetchFriends = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockFriends = [
          {
            id: 1,
            name: "Alice Hacker",
            username: "alice_h",
            userStat: { easy: 120, medium: 85, hard: 40, total: 245 }
          },
          {
            id: 2,
            name: "Bob Coder",
            username: "bob_coder",
            userStat: { easy: 45, medium: 20, hard: 5, total: 70 }
          },
          {
            id: 3,
            name: "Charlie Dev",
            username: "charlie_d",
            userStat: { easy: 200, medium: 150, hard: 90, total: 440 }
          },
          {
            id: 4,
            name: "Dave Algorithm",
            username: "dave_algo",
            userStat: { easy: 10, medium: 5, hard: 1, total: 16 }
          }
        ];
        setFriends(mockFriends);
        setLoading(false);
      }, 1500); // 1.5 second delay
    };

    fetchFriends();
  }, []);

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-8'>
      <h1 className='text-3xl font-bold text-white mb-8 border-b border-white/20 pb-4'>Friends Stats</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64 text-[var(--color-logo)] text-2xl font-bold animate-pulse">
          Loading friends data...
        </div>
      ) : (
        <div className='flex flex-wrap gap-8 justify-start'>
          {friends.map((friend) => (
            <div key={friend.id} className="w-full md:w-[45%] flex flex-col items-center">
              <div className="text-white text-center w-full bg-[var(--component-surface)] py-3 rounded-t-md border-b border-gray-700">
                <span className="text-xl font-bold">{friend.name}</span>
                <span className="text-gray-400 ml-2">@{friend.username}</span>
              </div>
              {/* Force Stats to fill its container and remove its default margin so it aligns nicely */}
              <Stats userStat={friend.userStat} className="!w-full !md:w-full !m-0 rounded-t-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Friends;
