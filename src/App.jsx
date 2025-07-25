// App.jsx
import { io } from "socket.io-client";
import { createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import SidebarMobile from "./components/SidebarMobile";
import { Toaster } from "react-hot-toast";

export const SocketContext = createContext();
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default function App() {
  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <SidebarMobile />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paralizaciones" element={<Dashboard />} />
        </Routes>
        <Toaster position="top-right" reverseOrder={false} />
      </Router>
    </SocketContext.Provider>
  );
}
