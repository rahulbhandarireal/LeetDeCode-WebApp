import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRightToBracket, faTrophy, faXmark } from '@fortawesome/free-solid-svg-icons';

function Battle() {
  const [roomId, setRoomId] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);

  // Mock battle history data
  const battleHistory = [
    { id: 1, opponent: "algo_master", date: "2026-05-10", result: "Win", score: "+15", duration: "12m" },
    { id: 2, opponent: "dp_god", date: "2026-05-09", result: "Loss", score: "-8", duration: "45m" },
    { id: 3, opponent: "graph_ninja", date: "2026-05-08", result: "Win", score: "+20", duration: "18m" },
    { id: 4, opponent: "tree_hugger", date: "2026-05-05", result: "Draw", score: "+0", duration: "30m" },
  ];

  const handleCreateRoom = () => {
    // Generate a mock random 6-character room ID
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    setActiveRoom(newRoom);
    alert(`Room Created! Your Room ID is: ${newRoom}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() === '') {
      alert("Please enter a valid Room ID.");
      return;
    }
    setActiveRoom(roomId.toUpperCase());
    alert(`Successfully joined Room: ${roomId.toUpperCase()}`);
    setRoomId('');
  };

  const leaveRoom = () => {
    setActiveRoom(null);
  };

  return (
    <div className='bg-[var(--color-background)] min-h-screen p-4 md:p-8 text-white'>
      <div className="mb-8 border-b border-white/20 pb-4 flex justify-between items-center">
        <h1 className='text-3xl font-bold'>Battle Arena</h1>
        {activeRoom && (
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
        <div className="flex-1 bg-[var(--component-surface)] p-8 rounded-xl shadow-lg border border-white/5 flex flex-col items-center justify-center text-center hover:border-[var(--color-logo)]/50 transition-colors">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 text-2xl">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Create a Room</h2>
          <p className="text-gray-400 mb-6">Host a battle and invite your friends to compete in real-time.</p>
          <button 
            onClick={handleCreateRoom}
            className="bg-[var(--color-logo)] text-black font-bold py-3 px-8 rounded-lg hover:bg-orange-400 transition shadow-[0_0_15px_rgba(239,153,55,0.4)]"
          >
            Create Battle Room
          </button>
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
                <th className="p-4 font-semibold">Opponent</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Result</th>
                <th className="p-4 font-semibold text-right">Score Change</th>
              </tr>
            </thead>
            <tbody>
              {battleHistory.map((battle) => (
                <tr key={battle.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-gray-200">@{battle.opponent}</td>
                  <td className="p-4 text-gray-400">{battle.date}</td>
                  <td className="p-4 text-gray-400">{battle.duration}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      battle.result === 'Win' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      battle.result === 'Loss' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {battle.result}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${
                    battle.score.startsWith('+') && battle.score !== '+0' ? 'text-green-400' : 
                    battle.score.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {battle.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Battle;
