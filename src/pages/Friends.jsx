import React, { useState, useEffect } from 'react';
import Stats from '../components/Stats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSearch, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [addStatus, setAddStatus] = useState({ type: null, message: "" });
  const [isAdding, setIsAdding] = useState(false);

  const currentUser = localStorage.getItem("name") || "Guest";

  const fetchFriends = async () => {
    if (currentUser === "Guest") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8081/relation/findallknown/${currentUser}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const mappedFriends = result.data.map((user, index) => ({
          id: user.id || index,
          name: user.name || user.username || "LeetCoder",
          username: user.username || "unknown",
          userStat: {
            easy: user.easySolved || 0,
            medium: user.mediumSolved || 0,
            hard: user.hardSolved || 0,
            total: user.totalSolved || 0
          }
        }));
        setFriends(mappedFriends);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUser]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    if (currentUser === "Guest") {
      setAddStatus({ type: 'error', message: "Please login to add friends." });
      return;
    }

    try {
      setIsAdding(true);
      setAddStatus({ type: null, message: "" });
      
      // Try without /api prefix first as per debug findings, and use POST
      const response = await fetch(`http://localhost:8081/relation/makerelation/${currentUser}/${searchUsername.trim()}`, {
        method: 'POST'
      });
      
      const result = await response.json();

      if (result.success || response.ok) {
        setAddStatus({ type: 'success', message: `Friend request sent to ${searchUsername}!` });
        setSearchUsername("");
        // Refresh friends list without full page reload
        fetchFriends(); 
      } else {
        setAddStatus({ type: 'error', message: result.message || "Failed to add friend." });
      }
    } catch (err) {
      setAddStatus({ type: 'error', message: "Connection error. Make sure backend is running." });
    } finally {
      setIsAdding(false);
      setTimeout(() => setAddStatus({ type: null, message: "" }), 3000);
    }
  };

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-4 md:p-8'>
      
      {/* Header & Add Friend Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className='text-3xl font-bold text-white'>Friends Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your coding companions' progress</p>
        </div>

        <form onSubmit={handleAddFriend} className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 group-focus-within:text-[var(--color-logo)] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Find friend by username..." 
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="block w-full pl-11 pr-32 py-3 bg-[var(--component-surface)] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-logo)]/50 focus:border-[var(--color-logo)] transition-all"
          />
          <button 
            type="submit"
            disabled={isAdding}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[var(--color-logo)] text-white rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isAdding ? "Adding..." : (
              <>
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Add Friend</span>
              </>
            )}
          </button>

          {/* Status Toast-like notification */}
          {addStatus.message && (
            <div className={`absolute -bottom-12 left-0 right-0 p-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-bounce-short ${
              addStatus.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'
            }`}>
              <FontAwesomeIcon icon={addStatus.type === 'success' ? faCheckCircle : faExclamationCircle} />
              {addStatus.message}
            </div>
          )}
        </form>
      </div>
      
      <div className="border-t border-gray-800/50 mb-10"></div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="w-full h-96 bg-gray-900/50 animate-pulse rounded-xl border border-gray-800"></div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {friends.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500 italic text-xl">
              You haven't added any friends yet. Use the search bar above to find some!
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="w-full flex flex-col items-center bg-[var(--component-surface)] rounded-xl overflow-hidden border border-gray-800/50 hover:border-[var(--color-logo)]/30 transition-all shadow-xl group">
                <div className="text-white flex justify-between items-center w-full px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
                  <div>
                    <span className="text-xl font-bold block group-hover:text-[var(--color-logo)] transition-colors">{friend.name}</span>
                    <span className="text-gray-400 text-sm">@{friend.username}</span>
                  </div>
                  <div className="bg-gray-800 px-3 py-1 rounded-full text-xs font-mono text-gray-400">
                    ID: {friend.id}
                  </div>
                </div>
                <Stats userStat={friend.userStat} className="!w-full !m-0 !bg-transparent border-none shadow-none" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Friends;
