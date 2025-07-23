import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "./components/ModalChangeStatus";
import { Toaster } from "react-hot-toast";
dayjs.extend(relativeTime);

let socket;
const socketURL = import.meta.env.VITE_SOCKET_URL;
export default function App() {
  const [machines, setMachines] = useState([]);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lineSelect, setLineSelect] = useState({});
  const [loading, setLoading] = useState(true);
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
      <div className="bg-neutral-300 min-h-screen p-2">
        <p className="text-white text-center my-2 mb-6">REAL TIME APP</p>
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-screen bg-primary-night">
            <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-sm">Cargando datos...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 w-full place-items-center  gap-3 `}>
            {machines.map((machine, index) => (
              <div
                key={index}
                onClick={() => handleModal(machine)}
                className="relative p-1 w-full h-fit  "
              >
                <div
                  className={`absolute inset-0  w-full h-full rounded-lg shadow-md  active:scale-95 transition-transform duration-100 ${
                    machine.status === "RUN"
                      ? "text-gray-300 bg-green-600 animate-pulse"
                      : machine.status === "STOP"
                      ? "text-gray-300 bg-red-600 animate-pulse"
                      : "text-gray-300 bg-neutral-600 "
                  }`}
                ></div>
                <div className="relative z-10 w-full h-full  flex justify-between items-center p-2 ">
                  <div className="flex flex-col gap-3">
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
               {
                machine.meta===null||machine.fabricado===null?(""):(
                     <div className="flex gap-3 flex-col justify-between  items-center ">
                  <div className="flex flex-col text-center gap-0.5">
                      <span className="text-3xl text-neutral-200">
                      {((machine.fabricado / machine.meta) * 100).toFixed()}%
                    </span>
                    <span className="text-xs text-neutral-200">
                      {machine.fabricado} fdn
                    </span>
                  </div>
                    <div>
                      <p className="text-xs text-neutral-900">
                        meta: {machine.meta} fdn
                      </p>
                    </div>
                  </div>
                )
               }
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
      ></Modal>
    </>
  );
}
