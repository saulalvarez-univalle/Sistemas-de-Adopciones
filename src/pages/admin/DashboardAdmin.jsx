import { useNavigate } from "react-router-dom";

import { cerrarSesion } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function DashboardAdmin() {
    const navigate = useNavigate();
    const { perfil } = useAuth();

    async function manejarCerrarSesion() {
        await cerrarSesion();
        navigate("/login");
    }

    return (
        <main className="simple-panel">

            <h1>Panel administrativo</h1>

            <p>
                Bienvenido, {perfil?.nombreCompleto}.
            </p>

            <p>
                Rol: <strong>{perfil?.rol}</strong>
            </p>

            <button onClick={manejarCerrarSesion}>
                Cerrar sesión
            </button>

        </main>
    );
}

export default DashboardAdmin;