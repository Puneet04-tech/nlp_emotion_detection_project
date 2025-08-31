import React from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function getChartType(data) {
  // Heuristic: if there are 2-6 keys and all values are numbers, use Pie. If more, use Bar.
  if (!data || typeof data !== 'object') return null;
  const keys = Object.keys(data);
  const values = Object.values(data);
  if (values.every(v => typeof v === 'number')) {
    if (keys.length >= 2 && keys.length <= 6) return 'pie';
    if (keys.length > 6) return 'bar';
  }
  return null;
}

export default function AnalysisChart({ data, title }) {
  if (!data || typeof data !== 'object') return null;
  const chartType = getChartType(data);
  if (!chartType) return null;

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: title || 'Analysis',
        data: Object.values(data),
        backgroundColor: [
          '#60a5fa', '#fbbf24', '#34d399', '#f472b6', '#a78bfa', '#f87171', '#facc15', '#38bdf8', '#818cf8', '#f472b6',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: chartType === 'pie', position: 'bottom' },
      title: { display: !!title, text: title },
    },
  };

  return (
    <div style={{ width: 260, height: 260, margin: '0 auto' }}>
      {chartType === 'pie' ? <Pie data={chartData} options={options} /> : <Bar data={chartData} options={options} />}
    </div>
  );
}
