import { useNavigate } from "react-router-dom";

import { cerrarSesion } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Panel() {
    const navigate = useNavigate();
    const { perfil } = useAuth();

    async function manejarCerrarSesion() {
        await cerrarSesion();
        navigate("/login");
    }

    return (
        <main className="simple-panel">

            <h1>Bienvenido, {perfil?.nombreCompleto}</h1>

            <p>
                Has iniciado sesión correctamente.
            </p>

            <p>
                Tipo de cuenta: <strong>{perfil?.rol}</strong>
            </p>

            <button onClick={manejarCerrarSesion}>
                Cerrar sesión
            </button>

        </main>
    );
}

export default Panel;