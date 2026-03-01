import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HoverBorderGradient } from "../components/hover-border-gradient";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica si estamos en la página de inicio.
  // Si estamos en la raíz ('/'), no mostramos la barra para que no se superponga con el menú principal.
  if (location.pathname === "/") {
    return null;
  }

  return (
    // La barra se fija en la parte superior, tiene un fondo semitransparente oscuro y utiliza Flexbox.
    <nav className="fixed top-0 left-0 w-full overflow-hidden bg-black bg-opacity-70 p-1 z-50 shadow-lg border-b border-gray-700">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo o Título de la Aplicación */}

        {/* Botón de Regreso a la Página Principal */}
        <div
          onClick={() => navigate("/")}
          className="text-white text-right text-2xl font-bold tracking-widest cursor-pointer hover:text-yellow-400 transition"
        >
          Asteroides
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
