import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Cargando from "./Cargando";

function AdminRoute({ children }) {
    const { usuarioFirebase, perfil, cargando } = useAuth();

    if (cargando) {
        return (
            <Cargando texto="Comprobando tus permisos" />
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