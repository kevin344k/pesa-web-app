import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "./components/ModalChangeStatus";
import { Toaster } from "react-hot-toast";
import NumberFlow from "@number-flow/react";
import svg_sort from "./assets/sort.svg";
dayjs.extend(relativeTime);

let socket;
const socketURL = import.meta.env.VITE_SOCKET_URL;
export default function App() {
  const [machines, setMachines] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [lineSelect, setLineSelect] = useState({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("asc");
  const [, forceUpdate] = useState(0); // 👈 esto fuerza el re-render

  useEffect(() => {
    socket = io(socketURL);

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor socket con ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Error de conexión socket:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🟡 Desconectado del socket:", reason);
    });
    socket.on("pong", (data) => {
      console.log("🔵 Ping recibido del servidor:", data);
    });

    return () => {
      socket.disconnect(); // limpieza al desmontar el componente
    };
  }, []);

  useEffect(() => {
    socket.on("initial_data", (machines) => {
      console.log("Datos iniciales recibidos:", machines);

      // Aquí actualizas tu estado o UI
      setMachines(machines);
      setLoading(false); // ✅ Oculta el loader cuando llega la data

      console.log(dayjs(machines[0].lastUpdated).fromNow());
    });

    socket.on("status_updated", (updatedMachines) => {
      console.log("Actualización recibida:", updatedMachines);
      if (Array.isArray(updatedMachines)) {
        setMachines(updatedMachines); // 👈 Reemplaza el estado, forzando re-render completo
      }
    });

    return () => {
      socket.off("initial_data");
      socket.off("status_updated");
    };
  }, []);

  const handleModal = (data) => {
    setShowModal(true);
    setLineSelect(data);
  };

  const handleSort = () => {
    setSort((prev) => (prev === "asc" ? "desc" : "asc"));

    //Aqui ordenamos
    const sorted = [...machines].sort((a, b) => {
      const aPercent = a.meta === 0 ? 0 : (a.fabricado / a.meta) * 100;
      const bPercent = b.meta === 0 ? 0 : (b.fabricado / b.meta) * 100;

      if (sort === "asc") {
        return aPercent - bPercent;
      } else {
        return bPercent - aPercent;
      }
    });
    console.log(sort);
    setMachines(sorted);
  };

  // 👇 Este es el useEffect que fuerza re-render cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 60000); // cada 60 segundos

    return () => clearInterval(interval); // limpia al desmontar
  }, []);
  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-primary-night min-h-screen p-6">
        <p className="text-white text-center my-1 ">REAL TIME APP</p>
        <div className=" flex justify-end mb-2">
          <div
            onClick={handleSort}
            className="p-1 hover:cursor-pointer active:scale-95 
           border border-neutral-200 rounded-md "
          >
            <img className="w-3 " src={svg_sort} alt="" />
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col justify-start items-center min-h-screen bg-primary-night">
            <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-sm">Cargando datos...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 w-full place-items-center  gap-3 `}>
            {machines.map((machine, index) => (
              <div className="w-full">
                <div
                  key={index}
                  onClick={() => handleModal(machine)}
                  className="relative p-1 w-full h-fit border border-neutral-700 rounded-md "
                >
                  <div
                    className={`absolute inset-0  w-full h-full  rounded-md active:scale-95 transition-transform duration-100  ${
                      machine.status === "RUN"
                        ? "text-gray-300 bg-green-700 animate-pulse"
                        : machine.status === "STOP"
                        ? "text-gray-300 bg-red-600 animate-pulse"
                        : "text-gray-300 bg-neutral-600 "
                    }`}
                  ></div>

                  <div className="relative z-10 w-full h-full  flex justify-between items-center p-1 ">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-white text-left text-center">
                          {machine.name}
                        </p>{" "}
                        <span className="text-sm text-left text-center text-neutral-300 text-ellipsis truncate">
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
                      <div className="flex gap-3 flex-col justify-between  items-center ">
                        <div className="flex flex-col text-center ">
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
                          </p>{" "}
                          <span className="text-xs text-neutral-400">
                            meta: {machine.meta} fdn
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {machine.paralizacion === null ||
                machine.descripcion_paralizacion === null ? (
                  ""
                ) : (
                  <div className="flex gap-3 flex-col justify-between w-fit p-1 px-3 m-auto rounded-bl-lg rounded-br-lg bg-transparent border border-neutral-200 border-t-transparent  items-center ">
                    <div className="flex  text-center ">
                      <p className="text-xs text-neutral-200">
                        {machine.paralizacion} : 
                      </p>{"  "}
                      <span className="text-xs text-neutral-400">
                         {machine.descripcion_paralizacion}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        lineSelect={lineSelect}
      ></Modal>
    </>
  );
}
