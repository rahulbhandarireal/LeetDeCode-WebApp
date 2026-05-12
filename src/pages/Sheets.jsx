import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBookOpen } from '@fortawesome/free-solid-svg-icons';

const popularSheets = [
  { id: 1, name: "Striver's SDE Sheet", total: 191, solved: 19, easy: 50, medium: 100, hard: 41 },
  { id: 2, name: "NeetCode 150", total: 150, solved: 75, easy: 40, medium: 80, hard: 30 },
  { id: 3, name: "Blind 75", total: 75, solved: 60, easy: 20, medium: 40, hard: 15 },
  { id: 4, name: "Top Interview 150", total: 150, solved: 15, easy: 45, medium: 80, hard: 25 }
];

const topicSheets = [
  { id: 11, name: "Arrays & Hashing", total: 150, solved: 135, easy: 60, medium: 70, hard: 20 },
  { id: 12, name: "Dynamic Programming", total: 100, solved: 20, easy: 30, medium: 50, hard: 20 },
  { id: 13, name: "Trees & Binary Search", total: 80, solved: 32, easy: 25, medium: 40, hard: 15 },
  { id: 14, name: "Graphs", total: 60, solved: 6, easy: 15, medium: 30, hard: 15 },
  { id: 15, name: "Sliding Window", total: 40, solved: 38, easy: 10, medium: 20, hard: 10 }
];

function SheetCard({ sheet }) {
  const percentage = Math.round((sheet.solved / sheet.total) * 100);
  
  return (
    <div className="bg-[var(--component-surface)] p-6 rounded-2xl border border-[#2a2a2a] hover:border-[var(--color-logo)] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[var(--color-logo)]/20 cursor-pointer flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-white">{sheet.name}</h3>
        <span className="text-[var(--color-logo)] font-extrabold text-lg">{percentage}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-[#2a2a2a] rounded-full h-2.5 overflow-hidden">
        <div className="bg-[var(--color-logo)] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      
      <div className="text-neutral-400 text-sm">
        {sheet.solved} / {sheet.total} problems solved
      </div>
      
      {/* Difficulties */}
      <div className="flex flex-row justify-between mt-auto pt-2">
        <div className="flex flex-col items-center p-2 bg-[#22c55e]/10 rounded-lg w-1/3 mr-2 border border-[#22c55e]/20">
          <span className="text-[var(--color-easy)] text-xs font-bold uppercase tracking-wider mb-1">Easy</span>
          <span className="text-white font-semibold">{sheet.easy}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-[#eab308]/10 rounded-lg w-1/3 mr-2 border border-[#eab308]/20">
          <span className="text-[var(--color-medium)] text-xs font-bold uppercase tracking-wider mb-1">Med</span>
          <span className="text-white font-semibold">{sheet.medium}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-[#ef4444]/10 rounded-lg w-1/3 border border-[#ef4444]/20">
          <span className="text-[var(--color-hard)] text-xs font-bold uppercase tracking-wider mb-1">Hard</span>
          <span className="text-white font-semibold">{sheet.hard}</span>
        </div>
      </div>
    </div>
  );
}

function Sheets() {
  const [activeTab, setActiveTab] = useState("popular"); // "popular" or "topic"
  
  const currentSheets = activeTab === "popular" ? popularSheets : topicSheets;

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8 text-white font-body">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header and Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h1 className="text-4xl font-headline font-bold">Practice <span className="text-[var(--color-logo)]">Sheets</span></h1>
          
          <div className="flex p-1 bg-[var(--component-surface)] rounded-xl border border-[#2a2a2a]">
            <button 
              onClick={() => setActiveTab("popular")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "popular" ? 'bg-[var(--color-logo)] text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            >
              <FontAwesomeIcon icon={faFire} />
              Most Popular
            </button>
            <button 
              onClick={() => setActiveTab("topic")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "topic" ? 'bg-[var(--color-logo)] text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            >
              <FontAwesomeIcon icon={faBookOpen} />
              Topic Wise
            </button>
          </div>
        </div>

        {/* Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentSheets.map(sheet => (
            <SheetCard key={sheet.id} sheet={sheet} />
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default Sheets;
