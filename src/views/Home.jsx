import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import TimelineRUNSTOP from "../components/graphics/Timeline";
import Modal from "../components/ModalChangeStatus";
import NumberFlow from "@number-flow/react";
import svg_sort from "../assets/sort.svg";

import { SocketContext } from "../App"; // Ajusta si está en otra ruta

dayjs.extend(relativeTime);

export default function Home() {
  const socket = useContext(SocketContext); // ✅ Socket global desde App.jsx
  const location = useLocation();

  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [lineSelect, setLineSelect] = useState({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("asc");
  const [, forceUpdate] = useState(0);
  const [timeRanges, setTimeRanges] = useState({});

  const ranges = ["24h", "48h", "72h", "7d", "1m"];
  // Cuando cambias a Home, pido los datos y activo loader
  useEffect(() => {
    if (location.pathname === "/") {
      setLoading(true);
      socket.emit("request_initial_data"); // Evento para pedir datos al backend
    }
  }, [location.pathname, socket]);

  useEffect(() => {
    // Suscribir listeners socket
    socket.on("initial_data", (machines) => {
      setMachines(machines);
      setLoading(false);
    });

    socket.on("status_updated", (updatedMachines) => {
      if (Array.isArray(updatedMachines)) {
        setMachines(updatedMachines);
        toast.success("Estado actualizado");
      }
    });

    return () => {
      socket.off("initial_data");
      socket.off("status_updated");
    };
  }, [socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleModal = (data) => {
    setShowModal(true);
    setLineSelect(data);
  };

  const handleSort = () => {
    const newSort = sort === "asc" ? "desc" : "asc";
    setSort(newSort);

    const sorted = [...machines].sort((a, b) => {
      const aPercent = a.meta === 0 ? 0 : (a.fabricado / a.meta) * 100;
      const bPercent = b.meta === 0 ? 0 : (b.fabricado / b.meta) * 100;
      return newSort === "asc" ? aPercent - bPercent : bPercent - aPercent;
    });

    setMachines(sorted);
    
  };

  const [expandedMachines, setExpandedMachines] = useState({});

  const toggleExpand = (id) => {
    setExpandedMachines((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <div className="bg-primary-night min-h-screen p-6">
        <p className="text-white text-center my-1">REAL TIME APP</p>

        <div className="flex justify-end mb-2">
          <div
            onClick={handleSort}
            className="p-1 hover:cursor-pointer active:scale-95 border border-neutral-200 rounded-md"
          >
            <img className="w-3" src={svg_sort} alt="sort icon" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-start items-center min-h-screen bg-primary-night">
            <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-sm">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 w-full place-items-center gap-3">
            {machines.map((machine, index) => (
              <div key={index} className="w-full ">
                <div
                  className={`  relative ${
                    machine.status === "STOP" ? "mt-10" : ""
                  } flex `}
                >
                  <div
                    onClick={() => handleModal(machine)}
                    className="relative  p-1 w-full h-fit border border-neutral-700 rounded-md"
                  >
                    <div
                      className={`absolute z-2 inset-0 w-full h-full rounded-md active:scale-95 transition-transform duration-100 ${
                        machine.status === "RUN"
                          ? "text-gray-300 bg-green-700 animate-pulse"
                          : machine.status === "STOP"
                          ? "text-gray-300 bg-red-600  animate-pulse"
                          : "text-gray-300 bg-neutral-600"
                      }`}
                    ></div>

                    <div className="relative  w-full h-full flex justify-between items-center p-1">
                      <div className="flex z-5 flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-white text-left text-center">
                            {machine.name}
                          </p>
                          <span className="text-sm max-w-[170px] text-left text-center text-neutral-300 text-ellipsis truncate">
                            {machine.producto}
                          </span>
                        </div>
                        <p className="text-xs text-white text-left">
                          {machine.updated_at &&
                            dayjs(machine.updated_at).fromNow()}
                        </p>
                      </div>

                      {machine.meta === null || machine.fabricado === null ? (
                        ""
                      ) : (
                        <div className="flex z-5 gap-3 flex-col justify-between items-center">
                          <div className="flex flex-col text-center">
                            <span className="text-2xl text-neutral-200">
                              <NumberFlow
                                value={(
                                  (machine.fabricado / machine.meta) *
                                  100
                                ).toFixed()}
                              />
                              <span className="text-md">%</span>
                            </span>
                            <p className="text-xs text-neutral-200">
                              {machine.fabricado} fdn
                            </p>
                            <span className="text-xs text-neutral-400">
                              meta: {machine.meta} fdn
                            </span>
                          </div>
                        </div>
                      )}

                      {machine.paralizacion &&
                        machine.descripcion_paralizacion && (
                          <div className="absolute z-1 bottom-20 left-0 flex gap-2 flex-col justify-between w-full m-auto p-1 px-1 m-auto rounded-tl-lg rounded-tr-lg bg-transparent border border-neutral-200 border-b-transparent items-center">
                            <div className="flex text-center">
                              <p className="text-xs text-neutral-200">
                                {machine.paralizacion} :
                              </p>
                              <span className="text-xs text-neutral-400">
                                {machine.descripcion_paralizacion}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(machine.id);
                    }}
                    className="ml-2 text-white hover:scale-110 transition-transform rounded"
                    title="Ver historial"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        expandedMachines[machine.id] ? "rotate-180" : "rotate-0"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 border border-neutral-600 rounded flex flex-col items-center justify-center mt-2
    ${
      expandedMachines[machine.id]
        ? "max-h-[1000px] opacity-100 "
        : "max-h-0 opacity-0 p-0"
    }`}
                >
                  {/* Botones para elegir rango */}
                  <div className="flex gap-1 pl-2 pt-2 mr-auto">
                    {ranges.map((range) => (
                      <button
                        key={range}
                        onClick={() =>
                          setTimeRanges((prev) => ({
                            ...prev,
                            [machine.id]: range, // Solo cambia el rango de esa máquina
                          }))
                        }
                        className={`px-2 py-1 rounded text-xs border border-neutral-400 ${
                          timeRanges[machine.id] === range || (!timeRanges[machine.id] && range === "24h")
                            ? "bg-neutral-400 text-white"
                            : "bg-primary-night text-neutral-200 hover:bg-gray-300"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  <TimelineRUNSTOP
                    machineId={machine.id}
                    timeRange={timeRanges[machine.id] || "24h"} // Valor por defecto
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        lineSelect={lineSelect}
      />
    </>
  );
}
