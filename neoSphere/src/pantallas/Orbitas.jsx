import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import OrbitSimulator from '../components/OrbitSimulator';
import AsteroidsDisplayBar from "../components/AsteroidsDisplayBar";
import catalogoAsteroides from "../../public/catalogoAsteroides.json";

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
            
            {/* 1. TOP UI LAYER (Asteroids Bar) */}
            <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
                <div className="pointer-events-auto p-4">
                    <AsteroidsDisplayBar 
                        asteroids={catalogoAsteroides} 
                        onSelectAsteroid={(name) => setFocusedAsteroid(name)} 
                    />
                </div>
            </div>

            {/* 2. BACKGROUND SIMULATOR LAYER */}
            <main className="absolute inset-0 z-0">
                <OrbitSimulator 
                    targetAsteroid={focusedAsteroid} 
                    onReturn={handleDetailRedirect}
                />
            </main>

            {/* 3. OPTIONAL: Overlay Label for Focused Asteroid */}
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
}

export default Orbitas;