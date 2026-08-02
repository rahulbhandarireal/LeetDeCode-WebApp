import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCode } from '@fortawesome/free-solid-svg-icons';
import { ROUTES } from "../constants/routes";
import { STORAGE_KEYS } from "../constants/storage";
import { ENDPOINTS } from "../config/api";

function Login() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    if (username !== null) {
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  async function saveUser() {
    if (!name) return;
    
    // Check if valid lowercase and numbers only
    const isValid = /^[a-zA-Z0-9_]+$/.test(name);
    if (!isValid) {
      setError("Username must only contain letters, numbers, and underscores.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch(ENDPOINTS.userStats(name));
      const data = await res.json();
      
      if (data && data.success) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, name);
        
        // Cache the stats immediately so Home page loads instantly
        if (data.data) {
          localStorage.setItem(
            STORAGE_KEYS.USER_STATS(name), 
            JSON.stringify({ data: data.data, timestamp: Date.now() })
          );
        }
        
        navigate(ROUTES.HOME);
      } else {
        setError("User not found. Please enter a correct username.");
      }
    } catch (e) {
      setError("Connection failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveUser();
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center p-4 min-h-screen bg-[var(--color-background)] relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-logo)] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-lg w-full shadow-2xl flex flex-col items-center text-center transform transition-all">
        
        {/* Animated Header */}
        <div className="mb-6 relative">
          <h1 className="text-5xl font-extrabold font-headline tracking-wider flex items-center justify-center gap-4">
            <FontAwesomeIcon icon={faCode} className="text-gray-400 text-4xl" />
            <span className="bg-gradient-to-r from-[var(--color-logo)] via-orange-400 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              LeetDeCode
            </span>
          </h1>
        </div>

        <p className="text-gray-300 text-lg mb-8 font-medium">
          Start battling with your friends, enter your LeetCode username.
        </p>

        {/* Input Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="e.g. touryst" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-14 bg-[#1a1a1a] text-white text-center border border-gray-700 rounded-xl text-xl px-4 outline-none transition-all focus:border-[var(--color-logo)] focus:ring-2 focus:ring-[var(--color-logo)]/30 placeholder-gray-600" 
            />
          </div>
          
          <button 
            onClick={() => !loading && saveUser()} 
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[var(--color-logo)] to-orange-500 hover:from-orange-500 hover:to-yellow-500 text-black font-extrabold text-xl rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-[0_0_20px_rgba(207,126,25,0.3)] hover:shadow-[0_0_25px_rgba(207,126,25,0.6)]"
          >
            {loading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                Let's Battle <FontAwesomeIcon icon={faBolt} className="text-black" />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium w-full text-center animate-bounce-short">
            {error}
          </div>
        )}
      </div>

    </div>
  );
}

export default Login;
