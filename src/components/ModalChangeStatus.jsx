import React, { useState } from "react";
import toast from "react-hot-toast";
import ModalParalizaciones from "./ModalParalizaciones";

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
    } else {
      setParalizacionSeleccionada(null); // Limpiar si no es STOP
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
          codigo:codigoProd,
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

      toast.success("Actualización exitosa 🎉");
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
  }, 600); // espera 600ms tras la última tecla
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

          <div className=" flex flex-col text-left">
            <div className="mt-5 flex flex-col ">
              <label className="text-purple-500" htmlFor="producto-input">
                Producto
              </label>
              <input
                className="bg-gray-200 text-gray-600 max-w-80 border-2 border-gray-200 rounded w-full py-2 px-4 text-neutral-400 focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
               placeholder={buscando ? "Buscando..." : ""}
                id="producto-input"
                onChange={(e) => setNewProduct(e.target.value)}
                value={newProduct}
                disabled
              />
            </div>
            <div className="mt-5 flex gap-1 flex-col">
              <label className="text-purple-500" htmlFor="producto-input">
                Codigo
              </label>
              <input
                className="bg-gray-200 max-w-30 border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Codigo"
                id="codigo-input"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9]*$/.test(value)) {
                    handleChangeInputCodigo(value);
                  }
                }}
                value={codigoProd ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="mt-5">
              <label className="text-purple-500" htmlFor="meta-input">
                Meta
              </label>
              <input
                className="bg-gray-200 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                id="meta-input"
                placeholder="Meta"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setMeta(value);
                }}
                value={meta}
              />
            </div>

            <div className="mt-5">
              <label className="text-purple-500" htmlFor="fabricado-input">
                Fabricado
              </label>
              <input
                className="bg-gray-200 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Fabricado"
                id="fabricado-input"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) setFabricado(value);
                }}
                value={fabricado}
              />
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
