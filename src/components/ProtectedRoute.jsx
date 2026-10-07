import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { usuarioFirebase, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Comprobando sesión...</p>
            </div>
        );
    }

    if (!usuarioFirebase) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;