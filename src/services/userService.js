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

// HU-25. La suspensión no borra la cuenta ni su historial: solo cambia
// estadoCuenta, y Login.jsx rechaza el acceso a cualquier cuenta que no
// esté "Activo". Así una medida de moderación es reversible y queda
// rastro de lo que pasó.
export async function suspenderCuenta(uid) {
    const referenciaUsuario = doc(db, "users", uid);

    await updateDoc(referenciaUsuario, {
        estadoCuenta: "Suspendido"
    });
}

export async function reactivarCuenta(uid) {
    const referenciaUsuario = doc(db, "users", uid);

    await updateDoc(referenciaUsuario, {
        estadoCuenta: "Activo"
    });
}

export async function actualizarPerfil(
    uid,
    nombreCompleto,
    telefono,
    departamentoId,
    municipioId
) {
    const referenciaUsuario = doc(db, "users", uid);

    await updateDoc(referenciaUsuario, {
        nombreCompleto: nombreCompleto,
        telefono: telefono,
        departamentoId: departamentoId,
        municipioId: municipioId
    });
}