import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

export default function SheetModal({ sheet, onClose }) {
  const username = localStorage.getItem("name") || "Guest";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track solved problems locally
  const cacheKey = `solved_problems_${username}_${sheet.sheetId}`;
  const [solvedState, setSolvedState] = useState(() => {
    try {
      const stored = localStorage.getItem(cacheKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:8081/sheets/${sheet.sheetId}`);
        const result = await res.json();
        if (result && result.success) {
          setQuestions(result.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [sheet.sheetId]);

  const handleToggleSolved = (problemId) => {
    const newState = { ...solvedState, [problemId]: !solvedState[problemId] };
    setSolvedState(newState);
    localStorage.setItem(cacheKey, JSON.stringify(newState));
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "EASY") return "text-[var(--color-easy)] border-[var(--color-easy)]/20 bg-[var(--color-easy)]/10";
    if (difficulty === "MEDIUM") return "text-[var(--color-medium)] border-[var(--color-medium)]/20 bg-[var(--color-medium)]/10";
    if (difficulty === "HARD") return "text-[var(--color-hard)] border-[var(--color-hard)]/20 bg-[var(--color-hard)]/10";
    return "text-gray-400 border-gray-400/20 bg-gray-400/10";
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-[var(--component-surface)] rounded-2xl border border-[#2a2a2a] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-2xl font-bold text-white">{sheet.name}</h2>
            <p className="text-neutral-400 text-sm mt-1">{sheet.description || "Practice problems"}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-[#2a2a2a] transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-[var(--color-logo)] animate-pulse text-lg font-bold">Loading questions...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center text-neutral-400 py-10">No questions found for this sheet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {questions.map((q) => (
                <div key={q.problemId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800/50 hover:border-[var(--color-logo)]/50 transition-colors gap-4">
                  
                  <div className="flex items-start sm:items-center gap-4">
                    <input 
                      type="checkbox"
                      checked={!!solvedState[q.problemId]}
                      onChange={() => handleToggleSolved(q.problemId)}
                      className="w-5 h-5 mt-1 sm:mt-0 rounded border-gray-600 text-[var(--color-logo)] focus:ring-[var(--color-logo)] bg-[#2a2a2a] cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-lg font-semibold ${solvedState[q.problemId] ? 'text-neutral-500 line-through' : 'text-gray-200'}`}>
                        {q.problemId}. {q.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                        <span className={`px-2 py-0.5 rounded border font-bold ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        {q.topic && (
                          Array.isArray(q.topic) ? q.topic.map((tag, idx) => (
                            <span key={tag.id || tag.name || idx} className="px-2 py-0.5 rounded border border-gray-700 bg-[#2a2a2a] text-gray-300">
                              {tag.name || tag}
                            </span>
                          )) : (
                            <span className="px-2 py-0.5 rounded border border-gray-700 bg-[#2a2a2a] text-gray-300">
                              {q.topic}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <a 
                    href={`https://leetcode.com/problems/${q.titleSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-logo)] hover:bg-orange-500 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-orange-500/20 whitespace-nowrap"
                  >
                    Solve <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </a>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
