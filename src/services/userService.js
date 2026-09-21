import {
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";

import { db } from "./firebase";

export async function obtenerPerfil(uid) {
    const referenciaUsuario = doc(db, "users", uid);

    const documento = await getDoc(referenciaUsuario);

    if (!documento.exists()) {
        throw new Error("No se encontró el perfil del usuario.");
    }

    return documento.data();
}

export async function actualizarPerfil(
    uid,
    nombreCompleto,
    telefono
) {
    const referenciaUsuario = doc(db, "users", uid);

    await updateDoc(referenciaUsuario, {
        nombreCompleto: nombreCompleto,
        telefono: telefono
    });
}