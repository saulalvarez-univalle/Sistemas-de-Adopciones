import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";


export async function registrarUsuario(
    nombreCompleto,
    email,
    telefono,
    rol,
    departamentoId,
    municipioId,
    password
) {

    const resultado = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const usuario = resultado.user;

    await setDoc(doc(db, "users", usuario.uid), {

        uid: usuario.uid,

        nombreCompleto: nombreCompleto,

        email: email,

        telefono: telefono,

        rol: rol,

        departamentoId: departamentoId,

        municipioId: municipioId,

        fechaRegistro: serverTimestamp(),

        estadoCuenta: "Activo"

    });

    return usuario;
}


export async function iniciarSesion(email, password) {

    const resultado = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    const usuario = resultado.user;

    const documento = await getDoc(
        doc(db, "users", usuario.uid)
    );

    if (!documento.exists()) {
        throw new Error("No existe el perfil del usuario.");
    }

    return documento.data();
}


export async function cerrarSesion() {

    await signOut(auth);

}
export async function obtenerAlberguesPendientes() {
    const referencia = collection(db, "albergues");

    const consulta = query(
        referencia,
        where("estadoVerificacion", "==", "Pendiente_Verificacion")
    );

    const resultado = await getDocs(consulta);

    const albergues = [];

    resultado.forEach((documento) => {
        albergues.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return albergues;
}

export async function actualizarEstadoAlbergue(
    id,
    estadoVerificacion,
    motivoRechazo
) {
    const referencia = doc(db, "albergues", id);

    await updateDoc(referencia, {
        estadoVerificacion: estadoVerificacion,
        motivoRechazo: motivoRechazo
    });
}