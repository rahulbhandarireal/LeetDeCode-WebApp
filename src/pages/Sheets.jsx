import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import SheetModal from '../components/SheetModal';
import SheetCard from '../components/SheetCard';
import { ENDPOINTS } from '../config/api';
import { STORAGE_KEYS, CACHE_DURATION } from '../constants/storage';

function Sheets() {
  const [activeTab, setActiveTab] = useState("popular"); // "popular" or "topic"
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);

  useEffect(() => {
    const fetchallSheets = async () => {
      const CACHE_KEY = STORAGE_KEYS.SHEETS;
      const cached = localStorage.getItem(CACHE_KEY);
      const now = Date.now();

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // If data is less than 24 hours old, use it
        if (now - timestamp < CACHE_DURATION.SHEETS) {
          console.log("Using cached sheets data");
          setSheets(data);
          return;
        }
      }

      try {
        const res = await fetch(ENDPOINTS.allSheets(), {
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
