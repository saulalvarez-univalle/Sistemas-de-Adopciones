import { createContext, useContext, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuarioFirebase, setUsuarioFirebase] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cancelarObservador = onAuthStateChanged(
            auth,
            async (usuario) => {
                if (usuario) {
                    setUsuarioFirebase(usuario);

                    try {
                        const documento = await getDoc(
                            doc(db, "users", usuario.uid)
                        );

                        if (documento.exists()) {
                            setPerfil(documento.data());
                        } else {
                            setPerfil(null);
                        }
                    } catch (error) {
                        console.error(
                            "Error al obtener el perfil:",
                            error
                        );

                        setPerfil(null);
                    }
                } else {
                    setUsuarioFirebase(null);
                    setPerfil(null);
                }

                setCargando(false);
            }
        );

        return () => cancelarObservador();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                usuarioFirebase,
                perfil,
                cargando
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}