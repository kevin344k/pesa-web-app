import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function GraphExample() {
  // Datos inventados
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
  ];
  const values = [2.45, 2.52, 2.48, 2.55, 2.60, 2.53, 2.58, 2.50];

  const spec = 2.5;
  const lcl = 2.3;
  const ucl = 2.7;

  const data = {
    labels: times,
    datasets: [
      {
        label: "Valor",
        data: values,
        borderColor: "#a855f7",
        backgroundColor: "#a855f7",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
      },
      {
        label: "Especificación",
        data: times.map(() => spec),
        borderColor: "blue",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Límite Superior (UCL)",
        data: times.map(() => ucl),
        borderColor: "red",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Límite Inferior (LCL)",
        data: times.map(() => lcl),
        borderColor: "red",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Gráfico CEP - Datos Inventados",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: { color: "#333" },
        grid: { color: "#ccc" },
      },
      y: {
        ticks: { color: "#333" },
        grid: { color: "#ccc" },
        min: 2.2,
        max: 2.8,
      },
    },
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto" }}>
      <Line data={data} options={options} />
    </div>
  );
}
