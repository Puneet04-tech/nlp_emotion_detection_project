import React from 'react';
import { Radar } from 'react-chartjs-2';

export default function EmotionRadarChart({ scores }) {
  const labels = Object.keys(scores);
  const data = {
    labels,
    datasets: [
      {
        label: 'Emotion Intensity',
        data: labels.map(l => scores[l]),
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,1)',
        pointBackgroundColor: 'rgba(239,68,68,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(239,68,68,1)',
      }
    ]
  };
  const options = {
    scale: {
      ticks: { beginAtZero: true, min: 0, max: 2, stepSize: 0.2 }
    },
    plugins: {
      legend: { display: false }
    }
  };
  return <Radar data={data} options={options} />;
}
