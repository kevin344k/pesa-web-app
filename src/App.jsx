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
      <div className="bg-primary-night min-h-screen p-4">
        <p className="text-white text-center my-2 mb-12">REAL TIME APP</p>
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-screen bg-primary-night">
            <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-sm">Cargando datos...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-2  gap-4 `}>
            {machines.map((machine, index) => (
              <div
                key={index}
                onClick={() => handleModal(machine)}
                className={`p-2 px-2 rounded-lg shadow-md mb-4 active:scale-95 transition-transform duration-100 ${
                  machine.status === "RUN"
                    ? "text-gray-300 bg-green-600 animate-pulse"
                    : machine.status === "STOP"
                    ? "text-gray-300 bg-red-600 animate-pulse"
                    : "text-gray-300 bg-neutral-600 "
                }`}
              >
                <div className="flex justify-start items-center gap-1 ">
                  <p className="font-bold  text-center">{machine.name}</p>{" "}
                  <span className="text-sm text-center text-ellipsis truncate">
                    ({machine.producto})
                  </span>
                </div>

                <p className="text-xs text-white text-right">
                  {machine.updated_at && dayjs(machine.updated_at).fromNow()}
                </p>
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
