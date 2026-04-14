import catalogoAsteroides from "../../public/catalogoAsteroides.json";
import AsteroidsDisplayBar from "../components/AsteroidsDisplayBar";

const Orbitas = () => {
    return (
        <div className="orbitas-screen">
            <h1>Deep Space Radar</h1>
            
            {/* Pass the array from your JSON file directly */}
            <AsteroidsDisplayBar asteroids={catalogoAsteroides} />
            
            <div className="main-content">
                {/* Your other screen content */}
            </div>
        </div>
    );
}

export default Orbitas;