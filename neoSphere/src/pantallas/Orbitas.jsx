import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import OrbitSimulator from '../components/OrbitSimulator';
import AsteroidsDisplayBar from "../components/AsteroidsDisplayBar";
import catalogoAsteroides from '../data/catalogoAsteroides.json';

const topAsteroids = [
  "1 Ceres (A801 AA)",
  "2 Pallas (A802 FA)",
  "3 Juno (A804 RA)",
  "4 Vesta (A807 FA)",
  "6 Hebe (A847 NA)",
  "7 Iris (A847 PA)",
  "10 Hygiea (A849 GA)",
  "13 Egeria (A850 VA)",
  "15 Eunomia (A851 KA)",
  "16 Psyche (A852 FA)",
  "19 Fortuna (A852 VA)",
  "24 Themis (A853 FA)",
  "29 Amphitrite (A854 EA)",
  "31 Euphrosyne (A855 KA)",
  "48 Doris (A857 KA)",
  "52 Europa (A858 CA)",
  "65 Cybele (A861 EA)",
  "87 Sylvia (A866 KA)",
  "88 Thisbe (A866 RA)",
  "94 Aurora (A867 VA)",
  "107 Camilla (A868 KA)",
  "121 Hermione (A871 EA)",
  "324 Bamberga (A891 KA)",
  "451 Patientia (A899 FA)",
  "511 Davida (A903 NB)",
  "532 Herculina (A904 NB)",
  "624 Hektor (A907 KA)",
  "704 Interamnia (A910 KD)",
];

const Orbitas = () => {
  const [focusedAsteroid, setFocusedAsteroid] = useState(null);

  const handleDetailRedirect = () => {
    if (focusedAsteroid) {
      console.log("Navigating to details of:", focusedAsteroid);
    } else {
      alert("Selecciona un asteroide primero para ver sus detalles.");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto p-15">
          <AsteroidsDisplayBar
            topAsteroids={topAsteroids}
            asteroidsDatabase={catalogoAsteroides}
            onSelectAsteroid={(name) => setFocusedAsteroid(name)}
          />
        </div>
      </div>

      <main className="absolute inset-0 z-0">
        <OrbitSimulator
          targetAsteroid={focusedAsteroid}
          onReturn={handleDetailRedirect}
        />
      </main>

      <AnimatePresence>
        {focusedAsteroid && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-10 left-10 z-40 p-4 bg-black/60 border border-white/20 rounded-lg backdrop-blur-md"
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest">Objetivo Enfocado</p>
            <h2 className="text-white text-2xl font-bold">{focusedAsteroid}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orbitas;