import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "./components/ModalChangeStatus";
import { Toaster } from 'react-hot-toast';
dayjs.extend(relativeTime);

let socket;

export default function App() {
  const [machines, setMachines] = useState([]);
   const [open, setOpen] = useState(false);
     const [showModal, setShowModal] = useState(false);
    const [lineSelect,setLineSelect]=useState({})
  useEffect(() => {
    socket = io("http://localhost:3010", {
      transports: ["websocket"], // fuerza uso de WebSocket puro
    });

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
      console.log(dayjs(machines[0].lastUpdated).fromNow());
    });

  socket.on("status_updated", (updatedMachine) => {
    console.log("Actualización recibida:", updatedMachine);
    setMachines((prevMachines) =>
      prevMachines.map((m) =>
        m.id === updatedMachine.id ? { ...m, ...updatedMachine } : m
      )
    );
  });



    return () => {
      socket.off("initial_data");
       socket.off("status_updated");
    };
  }, []);

const handleModal=(data)=>{
   setShowModal(true)
   setLineSelect(data)

}


console.log(lineSelect);


  return (
   
    <>
     <Toaster position="top-right" />
     <div className="bg-primary-night min-h-screen p-4">
      <p className="text-white text-center my-2 mb-12">REAL TIME APP</p>
      <div className={`grid grid-cols-2  gap-4 `}>
        {machines.map((machine, index) => (
          <div
            key={index}
            onClick={()=>handleModal(machine)}
            className={`p-2 px-2 rounded-lg shadow-md mb-4 active:scale-95 transition-transform duration-100 ${
              machine.status === "RUN"
                ? "text-gray-300 bg-green-600 animate-pulse"
                : machine.status === "STOP"
                ? "text-gray-300 bg-red-600 animate-pulse"
                : "text-gray-300 bg-neutral-600 "
            }`}
          >
           <div className="flex justify-start items-center gap-1 ">
            <p className="font-bold  text-center">{machine.name}</p> <span className="text-sm text-center text-ellipsis truncate">({machine.producto})</span>
           </div>

            <p className="text-xs text-white text-right">
              {machine.updated_at && dayjs(machine.updated_at).fromNow()}
            </p>
          </div>
        ))}
      </div>
    </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} lineSelect={lineSelect}>
   
      </Modal>
    </>
  );
}
