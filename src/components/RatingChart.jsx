import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RatingChart() {
  const username = localStorage.getItem("name") || "Guest";
  const CACHE_TIME = 5 * 60 * 1000;

  const [ratingHistory, setRatingHistory] = useState(() => {
    const cacheKey = `ratingHistory_${username}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) return data;
      } catch (e) { return []; }
    }
    return [];
  });

  const [loading, setLoading] = useState(!ratingHistory || !ratingHistory.length && username !== "Guest");

  useEffect(() => {
    if (username === "Guest") {
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        if (!ratingHistory || !ratingHistory.length) setLoading(true);
        const ratingCacheKey = `ratingHistory_${username}`;
        let ratingData = ratingHistory;

        if (!ratingData || !ratingData.length) {
          const ratingRes = await fetch(`http://localhost:8081/api/leetcode/rating/${username}`);
          if (ratingRes) {
            const ratingResult = await ratingRes.json();
            if (ratingResult && ratingResult.success) {
              ratingData = ratingResult.data;
              localStorage.setItem(ratingCacheKey, JSON.stringify({ data: ratingData, timestamp: Date.now() }));
              setRatingHistory(ratingData);
            }
          }
        }
      } catch(err) {
         console.error("Failed to fetch rating history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [username]);

  const rating = ratingHistory && ratingHistory.length ? ratingHistory.map(item => parseFloat(item.rating)) : [];
  const problemsolved = ratingHistory && ratingHistory.length ? ratingHistory.map(item => item.problemsSolved) : [];

  if (loading) {
    return (
      <div className="bg-transparent rounded-md relative m-2 w-4/7 p-4 shadow-md flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500 animate-pulse">Loading Chart...</div>
      </div>
    );
  }
  const data = {
    labels: problemsolved,
    datasets: [
        {
          label: "Rating",
          data: rating,
          borderColor: "#F57F31",
          backgroundColor: "transparent",
          // remove background fill for a clean line chart
          fill: false,
          tension: 0.2,
          pointRadius: 4,
          pointBackgroundColor: "#F57F31",
          pointBorderColor: "#F57F31",
          borderWidth: 2,        },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#A39E9E",
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#131313",
        },
        ticks: {
          color: "#666",
        },
      },
      y: {
        grid: {
          color: "#131313",
        },
        ticks: {
          color: "#666",
        },
      },
    },
  };

  let currentRating = 0;
  let ratingChange = 0;
  
  if (rating && rating.length > 0) {
    currentRating = Math.round(rating[rating.length - 1]);
    if (rating.length > 1) {
      ratingChange = Math.round(rating[rating.length - 1] - rating[rating.length - 2]);
    }
  }

  const changeText = ratingChange >= 0 ? `+${ratingChange}` : `${ratingChange}`;
  const changeColor = ratingChange >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-transparent rounded-md relative m-2 w-4/7 p-4 rounded-lg shadow-md">
      <Line data={data} options={options} />
      {rating && rating.length > 0 && (
        <div className="absolute top-4 left-1/3 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-7xl font-extrabold leading-none text-[var(--color-logo)]">
            {currentRating}
          </span>
          <span className={`${changeColor} text-sm font-medium mt-1`}>
            {changeText} LAST CONTEST
          </span>
        </div>
      )}
    </div>
  );
}