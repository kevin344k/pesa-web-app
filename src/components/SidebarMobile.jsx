// components/SidebarMobile.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // iconos, o usa SVGs

export default function SidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="fixed top-4 left-4 z-50 bg-neutral-300 p-2 rounded shadow-md md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Fondo oscuro al abrir */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Menú</h2>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link to="/" onClick={() => setOpen(false)}>
            Inicio
          </Link>
          <Link to="/paralizaciones" onClick={() => setOpen(false)}>
            Paralizaciones
          </Link>
              <Link to="/dash" onClick={() => setOpen(false)}>
            Dasboard
          </Link>
           <Link to="/cpk" onClick={() => setOpen(false)}>
            Cpk
          </Link>
        </nav>
      </div>
    </>
  );
}
