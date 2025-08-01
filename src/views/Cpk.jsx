import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import GraphCEP from "../components/graphics/GraphCEP";
import save_icon from "../assets/save.svg";

export default function SpcForm() {
  const [cards, setCards] = useState([
    {
      shift_hour: "",
      weight: "",
      weights: ["", ""],
      thicknesses: ["", ""],
      isExpanded: false,
    },
  ]);

  const [form, setForm] = useState({
    machine_id: "1",
    shift_date: "",
  });

  const [loading, setLoading] = useState(false);

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      {
        shift_hour: "",
        weight: "",
        weights: ["", ""],
        thicknesses: ["", ""],
        isExpanded: false,
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handleNestedChange = (index, type, subIndex, value) => {
    const updatedCards = [...cards];
    updatedCards[index][type][subIndex] = value;
    setCards(updatedCards);
  };

  const toggleExpand = (index) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, isExpanded: !card.isExpanded } : card
      )
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };



  // Al montar el componente, asignar la fecha actual
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    setForm((prev) => ({ ...prev, shift_date: formattedDate }));
  }, []);

  const handleSaveButton = async (index) => {
    const card = cards[index];

console.log(card);

    // Validación rápida
    if ( !form.shift_date || !card.shift_hour || !card.weight) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

     // Convertir los arrays en valores individuales (o vacíos si no existen)
  const payload = {
    indexCard:index+1,
    machine_id: form.machine_id,
    shift_date: form.shift_date,
    shift_hour: card.shift_hour,
    weight_1: card.weights[0] || 0,
    weight_2: card.weights[1] || 0,
    thickness_1: card.thicknesses[0] || 0,
    thickness_2: card.thicknesses[1] || 0,
  };

  console.log(payload);
  
    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/cep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Error al guardar los datos");

      toast.success("Datos guardados correctamente");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181b] min-h-screen p-3  text-white">
      <h2 className="text-xl text-center font-bold mb-4">CEP</h2>
      <div className="flex flex-col gap-4 bg-[#2a2a2d] p-2 mt-8 rounded-md">
        <div>
          <label className="text-neutral-400">Laminadora Sunwell</label>
          <input
            type="date"
            name="shift_date"
            value={form.shift_date}
            onChange={handleFormChange}
            className="p-2 rounded bg-[#1f1f21] text-white"
          />
        </div>

        {/* Cards dinámicas */}
        <div className="flex flex-col gap-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative p-2 pt-4 gap-2 border  border-neutral-600 rounded-md justify-center opacity-0 translate-y-4 animate-[fadeInUp_0.4s_ease-out_forwards]"
            >
              <span className="absolute  top-0 rounded-br-full text-left p-2 pl-1 bg-neutral-400 left-0">
                {index + 1}
              </span>
              <div className="w-full">
                <div className="flex w-full gap-2 justify-around items-center">
                  <div className="text-center">
                    <p className="font-bold text-sm text-neutral-400">Hora</p>
                    <input
                      type="time"
                      value={card.shift_hour}
                      onChange={(e) =>
                        handleChange(index, "shift_hour", e.target.value)
                      }
                      className="p-2 text-sm rounded bg-[#1f1f21] text-white"
                    />
                  </div>
                  <div className="text-center text-sm text-neutral-400 gap-1">
                    <p className="font-bold text-sm">Peso Rollo (kg)</p>
                    <input
                      type="number"
                      step="0.01"
                      value={card.weight}
                      onChange={(e) =>
                        handleChange(index, "weight", e.target.value)
                      }
                      className="p-2 rounded bg-[#1f1f21] max-w-32 text-white"
                    />
                  </div>
                  <button
                    onClick={() => toggleExpand(index)}
                    className="ml-2 text-white hover:scale-110 transition-transform rounded"
                    title="Ver historial"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        card.isExpanded ? "rotate-180" : "rotate-0"
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

                {/* Campos adicionales */}
                <div
                  className={`flex gap-3 mt-2 transition-all duration-300 ${
                    card.isExpanded ? "flex" : "hidden"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm text-neutral-400">
                      Peso muestra
                    </p>
                    <div className="flex gap-1">
                      {card.weights.map((w, i) => (
                        <input
                          key={i}
                          type="number"
                          step="0.01"
                          value={w}
                          onChange={(e) =>
                            handleNestedChange(
                              index,
                              "weights",
                              i,
                              e.target.value
                            )
                          }
                          className="p-1 py-2 w-[60px] rounded bg-[#1f1f21] text-white"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold truncate text-sm text-neutral-400">
                      Espesor muestra
                    </p>
                    <div className="flex gap-1">
                      {card.thicknesses.map((t, i) => (
                        <input
                          key={i}
                          type="number"
                          step="0.001"
                          value={t}
                          onChange={(e) =>
                            handleNestedChange(
                              index,
                              "thicknesses",
                              i,
                              e.target.value
                            )
                          }
                          className="p-1 py-2 w-[60px] rounded bg-[#1f1f21] text-white"
                        />
                      ))}
                      <button
                        onClick={() => handleSaveButton(index)}
                        className=" w-9 h-9 ml-3 bg-purple-600/60 flex items-center justify-center rounded-full"
                      >
                        <img
                          className="w-5 h-4"
                          src={save_icon}
                          alt="icon-svg"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón agregar card */}
        <button
          onClick={addCard}
          className="relative p-4 mt-4 bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all ease-in-out duration-100 shadow-lg mx-auto"
        >
          <span className="absolute top-0 left-0 inset-0 text-4xl">+</span>
        </button>

        {/* Animación personalizada */}
        <style>
          {`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded mt-4"
        >
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </div>
      <GraphCEP machineId={1} />
    </div>
  );
}
