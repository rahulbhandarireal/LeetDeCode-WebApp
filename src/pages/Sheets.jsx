import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import SheetModal from '../components/SheetModal';






function SheetCard({ sheet, onClick }) {
  const percentage = Math.round((sheet.sheetId / sheet.total) * 100);

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
        {sheet.sheetId} / {sheet.total} problems solved
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
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);

  useEffect(() => {
    const fetchallSheets = async () => {
      const CACHE_KEY = "sheets_data";
      const cached = localStorage.getItem(CACHE_KEY);
      const now = Date.now();

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // If data is less than 24 hours old, use it
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          console.log("Using cached sheets data");
          setSheets(data);
          return;
        }
      }

      try {
        const res = await fetch("http://localhost:8081/sheets/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        });
        const shetres = await res.json();
        const sr = shetres.data;

        console.log("Fetched fresh sheets data");
        if (shetres.success) {
          setSheets(sr);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: sr,
            timestamp: now
          }));
        }
      } catch (err) {
        console.log(err);
        // If fetch fails but we have old cache, use it as fallback
        if (cached) {
          const { data } = JSON.parse(cached);
          setSheets(data);
        }
      }
    }
    fetchallSheets();
  }, []);

  const currentSheets = sheets.filter(sheet =>
    activeTab === "popular" ? sheet.type === "sheet" : sheet.type === "topic"
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8 text-white font-body" >
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
            <SheetCard
              key={sheet.id || sheet.sheetId}
              sheet={sheet}
              onClick={() => setSelectedSheet(sheet)}
            />
          ))}
        </div>

        {selectedSheet && (
          <SheetModal
            sheet={selectedSheet}
            onClose={() => setSelectedSheet(null)}
          />
        )}

      </div>
    </div>
  );
}

export default Sheets;
