import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function obtenerFavoritos(userId) {

    const referencia = collection(db, "favoritos");

    const consulta = query(
        referencia,
        where("userId", "==", userId)
    );

    const resultado = await getDocs(consulta);

    const favoritos = [];

    resultado.forEach((documento) => {

        favoritos.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return favoritos;
}

export async function obtenerIdsFavoritos(userId) {

    const favoritos = await obtenerFavoritos(userId);

    return favoritos.map(
        (favorito) => favorito.mascotaId
    );
}

export async function agregarFavorito(userId, mascotaId) {

    const favoritos = await obtenerFavoritos(userId);

    for (const favorito of favoritos) {

        if (favorito.mascotaId === mascotaId) {
            return favorito.id;
        }
    }

    const referencia = collection(db, "favoritos");

    const resultado = await addDoc(referencia, {
        userId: userId,
        mascotaId: mascotaId,
        fechaAgregado: serverTimestamp()
    });

    return resultado.id;
}

export async function quitarFavorito(userId, mascotaId) {

    const favoritos = await obtenerFavoritos(userId);

    for (const favorito of favoritos) {

        if (favorito.mascotaId === mascotaId) {

            await deleteDoc(
                doc(db, "favoritos", favorito.id)
            );
        }
    }
}

export async function alternarFavorito(userId, mascotaId, esFavorito) {

    if (esFavorito) {

        await quitarFavorito(userId, mascotaId);

        return false;
    }

    await agregarFavorito(userId, mascotaId);

    return true;
}
