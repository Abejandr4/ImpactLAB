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
    <nav className="fixed top-0 left-0 w-full overflow-hidden p-1 z-50 shadow-lg border-b border-gray-700" style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(12px)" }}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo o Título de la Aplicación */}

        {/* Botón de Regreso a la Página Principal */}
        <div
          onClick={() => navigate("/")}
          onMouseEnter={e => e.currentTarget.style.textShadow = "0 0 15px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.textShadow = "none"}
          className="flex justify-end items-center gap-1 text-white text-2xl font-bold tracking-normal cursor-pointer transition pl-4"
        >

          <span style={{ fontSize: "1.4rem" }}>☄️</span>
          ImpactLAB
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
