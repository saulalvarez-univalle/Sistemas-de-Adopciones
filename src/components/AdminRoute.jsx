import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
    const { usuarioFirebase, perfil, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Comprobando permisos...</p>
            </div>
        );
    }

    if (!usuarioFirebase) {
        return <Navigate to="/login" replace />;
    }

    if (
        perfil === null ||
        (perfil.rol !== "Admin" &&
            perfil.rol !== "Superusuario")
    ) {
        return <Navigate to="/panel" replace />;
    }

    return children;
}

export default AdminRoute;