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