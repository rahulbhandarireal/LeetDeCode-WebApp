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
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Contest Performance",
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: "#F57F31",
        backgroundColor: "rgba(239, 153, 55, 0.2)", // light fill
        fill: true,
        tension: 0.2, 
        pointRadius: 4,
        pointBackgroundColor: "#CF7E19",
        pointBorderColor: "#CF2B19",
        borderWidth: 2,
      },
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

  return (
    <div className="bg-[var(--component-surface)] rounded-md relative m-2 w-4/7 p-4 rounded-lg shadow-md">
      <Line data={data} options={options} />
      <div className="text-orange-300 absolute top-20 font-bold right-10">
        1589<br/><span className="text-green-600 capitalize text-sm font-thin">+42 LAST WEEK</span>
      </div>

    </div>
  );
}