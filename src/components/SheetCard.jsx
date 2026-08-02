import React from "react";
import { STORAGE_KEYS } from "../constants/storage";

export default function SheetCard({ sheet, onClick }) {
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || "Guest";
  const cacheKey = STORAGE_KEYS.SHEET_SOLVED(username, sheet.sheetId);
  
  let solved = 0;
  if (username !== "Guest") {
    try {
      const stored = localStorage.getItem(cacheKey);
      const parsed = stored ? JSON.parse(stored) : {};
      solved = Object.values(parsed).filter(Boolean).length;
    } catch (e) {}
  }
  
  // Prevent division by zero if total is 0
  const total = sheet.total || 1;
  const percentage = Math.round((solved / total) * 100);

  return (
    <div
      onClick={onClick}
      className="bg-[var(--component-surface)] p-6 rounded-2xl border border-[#2a2a2a] hover:border-[var(--color-logo)] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[var(--color-logo)]/20 cursor-pointer flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-white">{sheet.name}</h3>
        <span className="text-[var(--color-logo)] font-extrabold text-lg">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#2a2a2a] rounded-full h-2.5 overflow-hidden">
        <div className="bg-[var(--color-logo)] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>

      <div className="text-neutral-400 text-sm">
        {solved}/{sheet.total} problems solved
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
