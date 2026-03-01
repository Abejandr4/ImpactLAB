import React from "react";
import { useNavigate } from "react-router-dom";
import BlurText from "../components/BlurText";
import { HoverBorderGradient } from "../components/hover-border-gradient";
import Asteroid from "../assets/img/Asteroid_placeholder.png";
import MeteorShower from "../components/MeteorShower";

function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-black flex justify-center items-center overflow-hidden">
      {/* Background Layer: Particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <MeteorShower/>
      </div>

      {/* Middle Layer: The Peeking Asteroid */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
        <img 
          src={Asteroid} 
          alt="Asteroid"
          className="w-1/2 max-w-2xl transform translate-y-1/4 opacity-80" 
          /* translate-y-1/4 pushes it down so it peeks from behind the text */
        />
      </div>

      {/* Top Layer: UI Content */}
      <div className="relative flex flex-col justify-center items-center z-20 w-full text-center">
        {/* Título animado */}
        <div className="flex flex-row items-center mb-2">
          <BlurText
            text="Asteroides"
            delay={100}
            animateBy="letters"
            direction="top"
            className="text-white text-9xl font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
        </div>
        
        <div className="mb-12">
           <h1 className="text-sky-100 text-lg tracking-widest uppercase">
             Aprende sobre estos objetos espaciales
           </h1>
        </div>

        {/* Botones - Elevated higher via z-index and mt */}
        <div className="flex flex-row gap-10 mt-10">
          <HoverBorderGradient
            containerClassName="hover:bg-[#FFDD0F] rounded-lg transition px-10 py-4 text-xl min-w-[200px]"
            as="button"
            onClick={() => navigate("/slide-gallery")}
          >
            Galería y orbitas
          </HoverBorderGradient>
          <HoverBorderGradient
            containerClassName="hover:bg-[#1D0175] rounded-lg transition px-10 py-4 text-xl min-w-[200px]"
            as="button"
            onClick={() => navigate("/skyfallx-game")}
          >
            Simulador
          </HoverBorderGradient>
        </div>
      </div>
    </div>
  );
}

export default Inicio;