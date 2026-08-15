import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ENDPOINTS } from '../config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRightToBracket, faTrophy, faXmark } from '@fortawesome/free-solid-svg-icons';
import { STORAGE_KEYS } from '../constants/storage';
import { ROUTES } from '../constants/routes';

function Battle() {
  const [roomId, setRoomId] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  
  const topics = [
    "Arrays", "Strings", "Hash Table", "Linked List", "Math", 
    "Two Pointers", "Binary Search", "Recursion", "Backtracking", 
    "Sliding Window", "Dynamic Programming", "Trees", "Graphs", 
    "Stack", "Queue", "Heap / Priority Queue", "Trie", "Sorting", "Greedy"
  ];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [questionLevel, setQuestionLevel] = useState('Easy');

  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState('');
  const [problemId, setProblemId] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const currentUsername = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
  const [battleHistory, setBattleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (currentUsername && currentUsername !== "Guest") {
      setHistoryLoading(true);
      fetch(ENDPOINTS.battleHistory(currentUsername))
        .then(res => res.json())
        .then(data => {
          if (data?.status && Array.isArray(data?.data)) {
            setBattleHistory(data.data);
          } else {
            setBattleHistory([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch battle history:", err);
          setHistoryError("Could not load battle history.");
        })
        .finally(() => setHistoryLoading(false));
    } else {
      setHistoryLoading(false);
    }
  }, [currentUsername]);

  const handleCreateRoom = async () => {
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
    const playerId = localStorage.getItem("userId") || username;

    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.battleCreate(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostPlayerId: playerId,
          hostUsername: username,
          topic: selectedTopic,
          level: questionLevel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const resData = await response.json();
      
      if (resData.status && resData.data) {
        const newRoomId = resData.data.roomCode;
        const fetchedProblemId = resData.data.problemId;

        if (newRoomId) {
          setWaitingRoomId(newRoomId);
          setProblemId(fetchedProblemId);
          setIsWaiting(true);
          setActiveRoom(newRoomId);
        } else {
          alert("Failed to get room ID from server");
        }
      } else {
        alert("Failed to create room: " + (resData.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error creating room. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for player two joining (hits battle/roomstatus/{roomCode} every 5 seconds)
  React.useEffect(() => {
    let interval;
    if (isWaiting && waitingRoomId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(ENDPOINTS.roomStatus(waitingRoomId));
          if (response.ok) {
            const resData = await response.json();
            const roomData = resData.data; // Support both {data: {...}} and {...} structures
            
            const players = roomData.players || [];
            const isJoined = 
              players.length > 1 ||
              roomData.status === "IN_PROGRESS";

            // Check if player two joined
            if (isJoined) {
              const currentUser = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
              let opponentUsername = "Opponent";
              if (players.length > 1) {
                const opponent = players.find(p => p.username !== currentUser);
                if (opponent) opponentUsername = opponent.username;
              } 

              const resolvedProblemId =problemId;
              setIsWaiting(false);
              clearInterval(interval);
              alert(`Player joined! Starting battle match...`);
              navigate(`${ROUTES.IDE}?roomId=${waitingRoomId}&problemId=${resolvedProblemId}&opponent=${opponentUsername}`);
            }
          }
        } catch (err) {
          console.error("Error polling room status", err);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaiting, waitingRoomId, problemId, navigate]);

const handleJoinRoom = async (e) => {
  e.preventDefault();
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
  const playerId = localStorage.getItem("userId") || username;

  if (roomId.trim() === '') {
    alert("Please enter a valid Room ID.");
    return;
  }
  const joinedRoom = roomId.toUpperCase().trim();

  let pId = '';
  let opponentUsername = '';
  const currentUser = username;

  try {
    setLoading(true);
    const response = await fetch(ENDPOINTS.joinRoom(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomCode: joinedRoom,
        playerId: playerId,
        username: username
      })
    });

    const resData = await response.json();

    if (resData.status && resData.data) {
      const rObj = resData.data;
      pId = rObj.problemId || rObj.problem?.id || '';

      const players = rObj.players || rObj.playersList || [];
      if (players.length > 0) {
        const opponent = players.find(
          p => (p.username && p.username !== currentUser) || (p.name && p.name !== currentUser)
        );
        if (opponent) {
          opponentUsername = opponent.username || opponent.name || '';
        }
      }
      if (!opponentUsername && rObj.hostUsername) {
        opponentUsername = rObj.hostUsername;
      }

      setActiveRoom(joinedRoom);
      alert(`Successfully joined Room: ${joinedRoom}`);
      setRoomId('');
      navigate(`${ROUTES.IDE}?roomId=${joinedRoom}&problemId=${pId}${opponentUsername ? `&opponent=${opponentUsername}` : ''}`);
    } else {
      alert("Failed to join room: " + (resData.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error joining room:", err);
    alert("Error joining room. Please check the Room ID and try again.");
  } finally {
    setLoading(false);
  }
};

  const leaveRoom = () => {
    setActiveRoom(null);
    setIsWaiting(false);
    setWaitingRoomId('');
  };

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-4 md:p-8 text-white'>
      <div className="mb-8 border-b border-white/20 pb-4 flex justify-between items-center">
        <h1 className='text-3xl font-bold'>Battle Arena</h1>
        {activeRoom && !isWaiting && (
          <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-full flex items-center gap-3 font-bold border border-green-600/50">
            <span className="animate-pulse h-3 w-3 bg-green-500 rounded-full inline-block"></span>
            In Room: {activeRoom}
            <button onClick={leaveRoom} className="ml-4 text-gray-400 hover:text-red-400 transition">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}
      </div>

      {/* Lobby Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Create Room Card */}
        <div className="flex-1 bg-[var(--component-surface)] p-8 rounded-xl shadow-lg border border-white/5 flex flex-col items-center justify-center text-center hover:border-[var(--color-logo)]/50 transition-colors relative overflow-hidden">
          {isWaiting ? (
            <div className="flex flex-col items-center justify-center h-full w-full py-8">
              <div className="w-16 h-16 border-4 border-[var(--color-logo)] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold mb-2">Waiting for Player 2...</h2>
              <p className="text-gray-400 mb-4">Share this Room ID with your opponent:</p>
              <div className="bg-[#2a2a2a] text-[var(--color-logo)] text-3xl tracking-widest font-mono font-bold px-8 py-4 rounded-lg border border-gray-600 mb-6">
                {waitingRoomId}
              </div>
              <button 
                onClick={leaveRoom}
                className="text-gray-400 hover:text-red-400 transition underline"
              >
                Cancel and leave lobby
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 text-2xl">
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Create a Room</h2>
              <p className="text-gray-400 mb-6">Host a battle and invite your friends to compete in real-time.</p>
              
              <div className="w-full max-w-sm flex flex-col gap-4 text-left">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Select Topic</label>
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-[var(--color-logo)] disabled:opacity-50"
                  >
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Level of Question</label>
                  <select 
                    value={questionLevel}
                    onChange={(e) => setQuestionLevel(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-[var(--color-logo)] disabled:opacity-50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <button 
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="mt-2 bg-[var(--color-logo)] text-black font-bold py-3 px-8 rounded-lg hover:bg-orange-400 transition shadow-[0_0_15px_rgba(239,153,55,0.4)] w-full disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>}
                  Start Room
                </button>
              </div>
            </>
          )}
        </div>

        {/* Join Room Card */}
        <div className="flex-1 bg-[var(--component-surface)] p-8 rounded-xl shadow-lg border border-white/5 flex flex-col items-center justify-center text-center hover:border-green-500/50 transition-colors">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 text-2xl">
            <FontAwesomeIcon icon={faRightToBracket} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter a Room</h2>
          <p className="text-gray-400 mb-6">Have an invite code? Enter it below to join an existing battle.</p>
          <form onSubmit={handleJoinRoom} className="w-full max-w-sm flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. X7B9KQ" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500 uppercase font-mono"
            />
            <button 
              type="submit"
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Battle History Section */}
      <div className="bg-[var(--component-surface)] rounded-xl shadow-lg border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-xl" />
          <h2 className="text-xl font-bold">Past Battle History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2a2a2a] text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Opponent</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 animate-pulse">Loading history...</td>
                </tr>
              ) : historyError ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-red-400">{historyError}</td>
                </tr>
              ) : battleHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No battles found. Start your first battle!</td>
                </tr>
              ) : (
                battleHistory.map((battle, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 text-gray-500 font-mono">{index + 1}</td>
                    <td className="p-4 font-mono text-gray-200">@{battle.playerB}</td>
                    <td className="p-4 text-gray-400">
                      {battle.startTime
                        ? new Date(battle.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        battle.win
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {battle.win ? '🏆 Win' : '💀 Lose'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Battle;
