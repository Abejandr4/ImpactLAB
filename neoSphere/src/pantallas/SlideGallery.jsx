import { useState } from "react"; // 1. Added useState
import Carousel from "../components/Carousel";
import Particles from "../components/Particles";
import Modal from "../components/Modal"; // 2. Added Modal import (adjust path if needed)

import imag1 from "../assets/img/astero/imag1.jpg";
import imag2 from "../assets/img/astero/imag2.jpg";
import imag3 from "../assets/img/astero/imag3.jpg";
import imag4 from "../assets/img/astero/imag4.jpg";
import imag5 from "../assets/img/astero/imag5.jpg";
import imag6 from "../assets/img/astero/imag6.jpg";
import imag7 from "../assets/img/astero/imag7.jpg";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "../components/hover-border-gradient";

function SlideGallery() {
    const slides = [
        {image: imag1, link: "https://asteroid-db-q68v.vercel.app/"},
        {image: imag2, link: "https://asteroid-db-q68v.vercel.app/"},
        {image: imag3, link: "https://wikipedia.com/"},
        {image: imag4, link: "https://wikipedia.com/"},
        {image: imag5, link: "https://wikipedia.com/"},
        {image: imag6, link: "https://wikipedia.com/"},
        {image: imag7, link: "https://asteroid-db-q68v.vercel.app/"}
        
    ]
    const navigate = useNavigate();
    const [modalData, setModalData] = useState({ isOpen: false, url: "" });

    const openModal = (url) => setModalData({ isOpen: true, url });
    const closeModal = () => setModalData({ isOpen: false, url: "" });

    return (
        <div className="relative w-full h-screen bg-black flex justify-center items-center overflow-y-auto">

             <div className="absolute inset-0 z-0">
                <Particles
                particleColors={["#ffffff", "#ffffff"]}
                particleCount={600}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
                />
            </div>
            
        <div className="relative z-10 flex flex-col items-center text-white p-10">
            <div className="w-300 m-auto pt-20 p-5">
                <Carousel slides={slides} onImageClick={openModal} />

                <Modal 
                isOpen={modalData.isOpen} 
                url={modalData.url} 
                onClose={closeModal} 
            />
            </div>
        </div>

        </div>
    );
}

export default SlideGallery;