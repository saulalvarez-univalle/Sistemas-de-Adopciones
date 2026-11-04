import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Cargando from "./Cargando";

function ProtectedRoute({ children }) {
    const { usuarioFirebase, cargando } = useAuth();

    if (cargando) {
        return (
            <Cargando texto="Comprobando tu sesión" />
        );
    }

    if (!usuarioFirebase) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;