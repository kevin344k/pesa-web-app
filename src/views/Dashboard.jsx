import React, { useEffect, useState } from "react";
import paralizaciones from "../data/paralizaciones.json";
import BarChart from "../components/graphics/BarChart";
import BarChartMachine from "../components/graphics/BarChartMachine";
export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/paralizaciones`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Error cargando logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  console.log(logs);


//////por paralizacion
  const dataAgrupada = logs.reduce((acc, log) => {
    acc[log.paralizacion] = (acc[log.paralizacion] || 0) + Number(log.duracion_horas);
    return acc;
  }, {});

  const dataChart = Object.entries(dataAgrupada)
    .map(([codigo, horas]) => ({
      codigo,
      descripcion:
        paralizaciones.find((p) => p.codigo === Number(codigo))?.descripcion || "Sin descripción",
      horas,
    }))
    .sort((a, b) => b.horas - a.horas);

/////por maquina

const dataAgrupadaMachina = logs.reduce((acc, log) => {
  acc[log.machine_name] = (acc[log.machine_name] || 0) + Number(log.duracion_horas);
  return acc;
}, {});

const dataChartMachina = Object.entries(dataAgrupadaMachina)
  .map(([maquina, horas]) => ({
    maquina,
    horas,
  }))
  .sort((a, b) => b.horas - a.horas);



console.log(dataChartMachina);

  
  return (
    <div className="p-4 pt-12 bg-primary-night min-h-screen">
      <h1 className="text-xl text-white text-center font-bold mb-4">Paralizaciones</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-white">No se encontraron registros.</p>
      ) : (
     <>
     <div className="inline-flex m-auto w-full items-center justify-center rounded-md shadow-sm" role="group">
  <button className="px-4 py-2 text-sm font-medium text-white bg-primary-night border border-secondary-night rounded-l-md hover:bg-blue-700">
    24h
  </button>
  <button className="px-4 py-2 text-sm font-medium text-white bg-primary-night border-t border-b border-secondary-night hover:bg-blue-700">
    1S
  </button>
  <button className="px-4 py-2 text-sm font-medium text-white bg-primary-night border border-secondary-night rounded-r-md hover:bg-blue-700">
    1M
  </button>
</div>

       <div className="w-full m-auto bg-secondary-night rounded-md gap-4 my-4 flex  flex-col  items-center justify-center ">
   <p className="text-neutral-400 pt-3 ">
    Tiempo perdido por paralizacion
  </p>
      <BarChart data={dataChart} />
 </div>
   <div className="w-full m-auto bg-secondary-night rounded-md gap-4 my-4 flex  flex-col  items-center justify-center ">
   <p className="text-neutral-400 pt-3 ">
    Tiempo perdido por màquina
  </p>
      <BarChartMachine data={dataChartMachina} />
 </div>
     </>

 
      )}

    </div>
  );
}
