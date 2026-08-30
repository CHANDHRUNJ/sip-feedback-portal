import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ helpful, notHelpful }) => {
  const data = {
    labels: ['Helpful', 'Not Helpful'],
    datasets: [{
      label: 'Feedback on Helpfulness',
      data: [helpful, notHelpful],
      backgroundColor: ['#4ade80', '#f87171'],
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
