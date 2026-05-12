import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchengin } from '@fortawesome/free-brands-svg-icons';

function Login() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let username = localStorage.getItem("name");
    if (username !== null) {
      navigate("/home");
    }
  }, [navigate]);

  async function saveUser() {
    if (!name) return;
    
    // Check if valid lowercase and numbers only
    const isValid = /^[a-z0-9]+$/.test(name);
    if (!isValid) {
      setError("Username must only contain lowercase letters and numbers.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // Mock backend call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      localStorage.setItem("name", name);
      navigate("/home");
    } catch (e) {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center p-2 h-screen bg-[var(--color-background)]">
      <div className="flex flex-row items-center w-8/12 justify-center gap-4">
        <input 
          type="text" 
          placeholder="Enter username" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 text-white bg-[var(--component-surface)] text-center border border-1 rounded-3xl text-4xl p-2 outline-none" 
        />
        <FontAwesomeIcon 
          size="2x" 
          icon={faSearchengin} 
          className={`text-[var(--color-logo)] cursor-pointer transition ${loading ? 'opacity-50' : 'hover:scale-110'}`} 
          onClick={() => !loading && saveUser()} 
        />
      </div>
      {error && <p className="text-red-500 mt-4 text-xl">{error}</p>}
      {loading && <p className="text-[var(--color-logo)] mt-4 text-xl">Loading...</p>}
    </div>
  );
}

export default Login;
