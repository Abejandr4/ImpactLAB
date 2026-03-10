import { useState } from "react";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";

export default function Carousel({ slides, onImageClick }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const previousSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  // Función para calcular la posición en el arco
  const getStyles = (index) => {
    let diff = index - current;
    
    // Lógica para el bucle infinito: ajusta la distancia si es muy grande
    if (diff > 1) diff -= slides.length;
    if (diff < -1) diff += slides.length;

    // Solo mostramos la anterior, la actual y la siguiente
    const isActive = index === current;
    const isVisible = Math.abs(diff) <= 1;

    // Configuración del arco
    const translateX = diff * 90; // Espaciado horizontal
    const translateY = Math.abs(diff) * 40; // Cuánto "baja" en el arco
    const scale = isActive ? 1 : 0.7; // Tamaño
    const opacity = isVisible ? 1 : 0;
    const zIndex = isActive ? 20 : 10;

    return {
      transform: `translateX(${translateX}%) translateY(${translateY}px) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
    };
  };

  return (
    <div className="relative w-full h-112.5 flex items-center justify-center overflow-hidden">
      {/* Contenedor de las Slides */}
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute w-75 h-100 transition-all duration-500 ease-in-out"
            style={getStyles(i)}
            onClick={() => onImageClick(s.link)}
          >
            <img
              src={s.image}
              alt={`slide-${i}`}
              className="w-full h-full cursor-pointer object-cover rounded-2xl shadow-2xl border-4 border-white/10"
            />
            <p className="text-white text-center text-2xl font-bold tracking-widest cursor-pointer"> {s.text} </p>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="absolute inset-0 flex justify-between items-center px-5 z-30 pointer-events-none">
        <button onClick={previousSlide} className="pointer-events-auto hover:scale-110 transition-transform text-white/70 hover:text-white text-5xl">
          <FaArrowCircleLeft />
        </button>
        <button onClick={nextSlide} className="pointer-events-auto hover:scale-110 transition-transform text-white/70 hover:text-white text-5xl">
          <FaArrowCircleRight />
        </button>
      </div>
    </div>
  );
}