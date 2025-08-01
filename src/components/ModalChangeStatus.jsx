import React, { useState } from "react";
import toast from "react-hot-toast";
import ModalParalizaciones from "./ModalParalizaciones";
import save_icon from "../assets/save.svg";
export default function ModalChangeStatus({ isOpen, onClose, lineSelect }) {
  if (!isOpen) return null;
  const socketURL = import.meta.env.VITE_SOCKET_URL;
  const [newStatus, setNewStatus] = useState(lineSelect.status);
  const [newProduct, setNewProduct] = useState(lineSelect.producto);
  const [meta, setMeta] = useState(lineSelect.meta);
  const [fabricado, setFabricado] = useState(lineSelect.fabricado);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [codigos, setCodigos] = useState([]);
  const [codigoProd, setcodigoProd] = useState(lineSelect.codigo ?? "");
  const [paralizacionSeleccionada, setParalizacionSeleccionada] =
    useState(null);
  const [buscando, setBuscando] = useState(false);

  const handleStatus = (state) => {
    setNewStatus(state);

    if (state === "STOP") {
      setShowModal(true);
    } else if (state === "SIN_OP") {
      setParalizacionSeleccionada({ codigo: 401, descripcion: "SIN ORDEN" });
    } else {
      setParalizacionSeleccionada(null); // Limpiar si no es STOP o SIN_OP
    }
  };

  const handleSuccessClose = () => {
    setNewProduct("");
    setNewStatus(lineSelect.status);
    setParalizacionSeleccionada(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!newProduct.trim()) {
      toast.error("Por favor ingresa un producto.");
      return;
    }

    if (!newStatus) {
      toast.error("Por favor selecciona un estado.");
      return;
    }

    if (!fabricado) {
      toast.error("Por favor ingresa las unidades fabricadas.");
      return;
    }

    if (!meta) {
      toast.error("Por favor ingresa la meta.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${socketURL}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lineSelect.id,
          status: newStatus,
          codigo: codigoProd,
          producto: newProduct,
          meta: meta,
          fabricado: fabricado,
          paralizacion: paralizacionSeleccionada?.codigo || null,
          descripcion_paralizacion:
            paralizacionSeleccionada?.descripcion || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar");

      toast.success("Actualización exitosa ");
      handleSuccessClose();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  let buscarTimeout;

  const handleChangeInputCodigo = async (value) => {
    clearTimeout(buscarTimeout);
    setcodigoProd(value);
    setBuscando(true);

    buscarTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`${socketURL}/productos`);
        const data = await res.json();
        setCodigos(data);

        const encontrado = data.find(
          (prod) => prod.item.trim() === value.trim().toUpperCase()
        );

        if (encontrado) {
          setNewProduct(encontrado.observacion);
        } else {
          setNewProduct("NO ENCONTRADO");
        }
      } catch (error) {
        console.error("Error al buscar código:", error);
      } finally {
        setBuscando(false);
      }
    }, 200); // espera 600ms tras la última tecla
  };

  //  método para finalizar orden
  const handleFinalizar = async () => {
    if (!meta || !fabricado) {
      toast.error("Debe ingresar meta y fabricado antes de finalizar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${socketURL}/finalizar-orden`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lineSelect.id,
          meta,
          shift_id: 1,
          fabricado,
          efficiency: (fabricado / meta) * 100,
          paralizacion: 4701,
          descripcion_paralizacion: "SIN ORDEN",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al finalizar");

      toast.success("Orden finalizada y eficiencia guardada ✅");
      handleSuccessClose();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-md bg-white rounded-2xl shadow-xl p-6 px-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">
            Actualizar el estado de la máquina
          </h2>
          <p className="text-sm text-gray-600 mb-4">{lineSelect.name}</p>

          <div className="flex justify-center gap-4">
            {["RUN", "STOP", "SIN_OP"].map((status) => {
              const isCurrent = lineSelect.status === status;
              const isSelected = newStatus === status;

              const baseClasses =
                "px-4 py-2 rounded-md text-white font-medium transition";
              const selectedPulse = isSelected ? "animate-pulse" : "";
              const disabledStyle = isCurrent
                ? "bg-gray-300 cursor-not-allowed text-gray-700"
                : "";
              const bgColor =
                status === "RUN"
                  ? "bg-green-600 hover:bg-green-700"
                  : status === "STOP"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700";

              return (
                <button
                  key={status}
                  onClick={() => handleStatus(status)}
                  disabled={isCurrent}
                  className={`${baseClasses} ${
                    isCurrent ? disabledStyle : bgColor
                  } ${selectedPulse}`}
                >
                  {status.replace("_", "-")}
                </button>
              );
            })}
          </div>

          <div className=" flex items-center justify-center flex-row-reverse gap-4  text-left">
            <div className=" relative w-full ">
              <div className="mt-5 flex items-center gap-2">
                {buscando && (
                  <div className="flex items-center gap-2 text-blue-500">
                    <span>Buscando...</span>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!buscando && newProduct && (
                  <p className=" text-sm text-gray-700">{newProduct}</p>
                )}
              </div>
            </div>

            <div className="mt-5 relative ">
              <input
                id="codigo-input"
                type="text"
                placeholder=" " // espacio vacío obligatorio para peer-placeholder-shown
                className="peer  bg-gray-100 min-w-23 max-w-30 border-1 border-gray-200 rounded w-full py-2 px-2 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9]*$/.test(value)) {
                    handleChangeInputCodigo(value);
                  }
                }}
                value={codigoProd ?? ""}
              />
              <label
                htmlFor="codigo-input"
                className="absolute left-2 top-2 text-gray-500 text-sm transition-all 
               peer-placeholder-shown:top-2 peer-placeholder-shown:bg-gray-200 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-sm 
               peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs peer-focus:text-purple-500
               peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:bg-white  peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-purple-500
                px-1 rounded"
              >
                Código
              </label>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t my-4 border-neutral-300">
            <div className="mt-5 relative w-full">
              <input
                id="meta-input"
                type="text"
                placeholder=" " // espacio vacío obligatorio para el efecto
                className="peer bg-gray-100 border-1 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setMeta(value);
                }}
                value={meta}
              />
              <label
                htmlFor="meta-input"
                className="absolute left-2 top-2 text-gray-500 text-sm transition-all 
               peer-placeholder-shown:top-2 peer-placeholder-shown:bg-gray-200 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-sm 
               peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs peer-focus:text-purple-500
               peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:bg-white  peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-purple-500
                px-1 rounded"
              >
                Meta
              </label>
            </div>

            <div className="mt-5 relative w-full">
              <input
                id="fabricado-input"
                type="text"
                placeholder=" " // placeholder vacío para activar peer-placeholder-shown
                className="peer bg-gray-100 border-1 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setFabricado(value);
                }}
                value={fabricado}
              />
              <label
                htmlFor="fabricado-input"
                className="absolute left-2 top-2 text-gray-500 text-sm transition-all 
               peer-placeholder-shown:top-2 peer-placeholder-shown:bg-gray-200 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-sm 
               peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs peer-focus:text-purple-500
               peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:bg-white  peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-purple-500
                px-1 rounded"
              >
                Fabricado
              </label>
            </div>
            <div className=" w-12 mt-5 h-fit shrink-0 rounded-lg bg-orange-100 p-2">
              {((fabricado / meta) * 100).toFixed()}%
            </div>
          </div>

          {/* ✅ Mostrar código y motivo debajo solo si es STOP */}
          {newStatus === "STOP" && paralizacionSeleccionada && (
            <div className="mt-6 text-left border-t pt-4">
              <p className="text-sm text-gray-700">
                <strong>Código:</strong> {paralizacionSeleccionada.codigo}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Paralizacion:</strong>{" "}
                {paralizacionSeleccionada.descripcion}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3 items-center justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              {loading ? "Actualizando..." : "Guardar cambios"}
            </button>
            <button
              onClick={handleFinalizar}
              disabled={loading}
              className="bg-orange-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              {loading ? "Finalizando..." : "Finalizar"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal de paralizaciones */}
      <ModalParalizaciones
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAceptar={({ codigo, descripcion }) => {
          setParalizacionSeleccionada({ codigo, descripcion });
          setShowModal(false);
        }}
      />
    </div>
  );
}
