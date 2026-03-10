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
        {image: imag1, text: "Ceres", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%201%20Ceres%20%28A801%20AA%29"},
        {image: imag2, text: "Vesta", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%204%20Vesta%20%28A807%20FA%29"},//vesta
        {image: imag3, text: "Ida", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%20243%20Ida%20%28A884%20SB%29"}, //ida 
        {image: imag4, text: "Psyche", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%2016%20Psyche%20%28A852%20FA%29"}, //psyche
        {image: imag5, text: "Pallas", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%202%20Pallas%20%28A802%20FA%29"}, //eros changed to pallas
        {image: imag6, text: "Mathilde", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%20253%20Mathilde%20%28A885%20VA%29"}, //mathilde
        {image: imag7, text: "Hektor", link: "https://asteroid-catalogue.vercel.app/%20%20%20%20%20624%20Hektor%20%28A907%20CF%29"} //hektor
        
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