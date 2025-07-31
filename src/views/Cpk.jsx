import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import GraphCEP from "../components/graphics/GraphCEP";
export default function SpcForm() {
  const [form, setForm] = useState({
    machine_id: "1",
    shift_date: "",
    shift_hour: "",
    weight_1: "",
    weight_2: "",
    weight_3: "",
    weight_4: "",
    thickness_1: "",
    thickness_2: "",
    thickness_3: "",
    thickness_4: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Al montar el componente, precargar fecha y hora actuales
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    setForm((prev) => ({
      ...prev,
      shift_date: currentDate,
      shift_hour: currentTime,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/cep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");

      setMessage("✅ Datos registrados correctamente");
          toast.success("registro guardado");


      setForm((prev) => ({
        ...prev,
        weight_1: "",
        weight_2: "",
        weight_3: "",
        weight_4: "",
        thickness_1: "",
        thickness_2: "",
        thickness_3: "",
        thickness_4: "",
      }));
    } catch (err) {
      setMessage("❌ " + err.message);
          toast.error("error al guardar el registro");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#18181b] min-h-screen p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Registro SPC</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-[#2a2a2d] p-4 rounded-md"
      >
        <input
          name="machine_id"
          placeholder="ID Máquina"
          value={form.machine_id}
          onChange={handleChange}
          className="p-2 rounded bg-[#1f1f21] text-white"
        />
        <input
          type="date"
          name="shift_date"
          value={form.shift_date}
          onChange={handleChange}
          className="p-2 rounded bg-[#1f1f21] text-white"
        />
        <input
          type="time"
          name="shift_hour"
          value={form.shift_hour}
          onChange={handleChange}
          className="p-2 rounded bg-[#1f1f21] text-white"
        />

        <p className="col-span-2 font-bold mt-4">Pesos (kg)</p>
        {[1, 2, 3, 4].map((i) => (
          <input
            key={i}
            type="number"
            step="0.01"
            name={`weight_${i}`}
            placeholder={`Peso ${i}`}
            value={form[`weight_${i}`]}
            onChange={handleChange}
            className="p-2 rounded bg-[#1f1f21] text-white"
          />
        ))}

        <p className="col-span-2 font-bold mt-4">Espesores (mm)</p>
        {[1, 2, 3, 4].map((i) => (
          <input
            key={i}
            type="number"
            step="0.001"
            name={`thickness_${i}`}
            placeholder={`Espesor ${i}`}
            value={form[`thickness_${i}`]}
            onChange={handleChange}
            className="p-2 rounded bg-[#1f1f21] text-white"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded mt-4"
        >
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>
      <GraphCEP></GraphCEP>

    
    </div>
  );
}
