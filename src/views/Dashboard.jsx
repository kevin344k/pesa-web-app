import React, { useEffect, useState } from "react";
import paralizaciones from "../data/paralizaciones.json";

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

  return (
    <div className="p-4 bg-primary-night min-h-screen">
      <h1 className="text-xl text-white text-center font-bold mb-4">Paralizaciones</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-white">No se encontraron registros.</p>
      ) : (
        <ul className="space-y-2">
          {logs
            .slice()
            .sort((a, b) => b.duracion_horas - a.duracion_horas)
            .map((log, i) => {
              const descripcion =
                paralizaciones.find(
                  (p) => p.codigo === Number(log.paralizacion)
                )?.descripcion || "Descripción no encontrada";

              return (
                <li
                  key={i}
                  className="p-3 flex bg-secondary-night justify-between text-white rounded shadow-sm border-l-4 border-red-400"
                >
                  <div>
                    <p>{log.machine_name}</p>
                    <p className="text-sm">
                      <strong>Motivo:</strong> {descripcion}
                    </p>
                  </div>
                  <div className="bg-red-400 flex items-center min-w-[50px] p-1 text-md">
                    {log.duracion_horas} <span className="text-xs"> hrs.</span>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
