import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ModalChangeStatus({ isOpen, onClose, lineSelect }) {
  if (!isOpen) return null;
  const socketURL = import.meta.env.VITE_SOCKET_URL;
  const [newStatus, setNewStatus] = useState(lineSelect.status);
  const [newProduct, setNewProduct] = useState(lineSelect.producto);
  const [meta, setMeta] = useState(lineSelect.meta);
  const [fabricado, setFabricado] = useState(lineSelect.fabricado);
  const [loading, setLoading] = useState(false);

  const handleStatus = (state) => {
    setNewStatus(state);
  };

  const handleSuccessClose = () => {
    setNewProduct("");
    setNewStatus(lineSelect.status);
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
      toast.error("Por favor  ingresa las unidades fabricadas.");
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
          producto: newProduct,
          meta: meta,
          fabricado: fabricado,
        }),
      });

      console.log(meta, fabricado);

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al actualizar");

      toast.success("Actualización exitosa 🎉");
      handleSuccessClose(); // ✅ Cierra y limpia
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
        className="w-[90%] max-w-md bg-white rounded-2xl shadow-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
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

          <div className="mt-5">
            <input
              className="bg-gray-200 max-w-80 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              type="text"
              placeholder="Producto"
              onChange={(e) => setNewProduct(e.target.value)}
              value={newProduct}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="mt-5">
              <input
                className="bg-gray-200 max-w-80 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Meta"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setMeta(value);
                }}
                value={meta}
              />
            </div>

            <div className="mt-5">
              <input
                className="bg-gray-200 max-w-80 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Fabricado"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setFabricado(value);
                }}
                value={fabricado}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              {loading ? "Actualizando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
