import React, { useState, useEffect } from "react";
import paralizaciones from "../data/paralizaciones.json"; // Asegúrate del path

export default function ModalParalizaciones({ isOpen, onClose, onAceptar }) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (codigo.trim() === "") {
      setDescripcion("");
      return;
    }

    setIsLoading(true);

    const timeout = setTimeout(() => {
      const resultado = paralizaciones.find(p => String(p.codigo) === codigo);
      setDescripcion(resultado ? resultado.descripcion : "");
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [codigo]);

  if (!isOpen) return null;

  const handleAceptar = () => {
    if (descripcion) {
      onAceptar({ codigo, descripcion });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] bg-white rounded-xl shadow-lg max-w-md p-6 relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Ingresa el código de la paralización
        </h2>

        <div className="mt-5">
          <label className="text-purple-500" htmlFor="codigo-input">
            Código
          </label>
          <input
            className="bg-gray-200 max-w-80 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            type="text"
            placeholder="Código"
            id="codigo-input"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) setCodigo(value);
            }}
            value={codigo}
          />
        </div>

        <div className="mt-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Buscando...</p>
          ) : descripcion ? (
            <p className="text-green-700 font-semibold">
              {codigo} – {descripcion}
            </p>
          ) : codigo !== "" ? (
            <p className="text-red-600 text-sm">Código no encontrado</p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAceptar}
            disabled={!descripcion}
            className={`px-4 py-2 rounded bg-purple-600 text-white font-semibold transition hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
