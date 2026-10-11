import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export const TIPOS_NOTIFICACION = [
    "Solicitud",
    "Adopcion",
    "Verificacion",
    "Moderacion"
];

// Las notificaciones se crean desde el cliente que realiza la acción:
// cuando un albergue aprueba una solicitud, su propio navegador escribe
// la notificación dirigida al adoptante. Lo correcto en producción sería
// generarlas con una Cloud Function, para que nadie pueda fabricar
// notificaciones a nombre del sistema. Queda documentado como deuda
// técnica: el plan Spark de Firebase no incluye Cloud Functions.
export async function crearNotificacion(datos) {

    const referencia = collection(db, "notificaciones");

    const resultado = await addDoc(referencia, {
        userId: datos.userId,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        tipo: datos.tipo,
        leido: false,
        fechaCreacion: serverTimestamp()
    });

    return resultado.id;
}

export async function obtenerNotificaciones(userId) {

    const consulta = query(
        collection(db, "notificaciones"),
        where("userId", "==", userId)
    );

    const resultado = await getDocs(consulta);

    const notificaciones = [];

    resultado.forEach((documento) => {

        notificaciones.push({
            id: documento.id,
            ...documento.data()
        });
    });

    notificaciones.sort((a, b) => {

        const fechaA = a.fechaCreacion?.seconds || 0;
        const fechaB = b.fechaCreacion?.seconds || 0;

        return fechaB - fechaA;
    });

    return notificaciones;
}

export async function contarNoLeidas(userId) {

    const notificaciones = await obtenerNotificaciones(userId);

    let total = 0;

    for (const notificacion of notificaciones) {

        if (notificacion.leido !== true) {
            total = total + 1;
        }
    }

    return total;
}

export async function marcarComoLeida(id) {

    await updateDoc(
        doc(db, "notificaciones", id),
        { leido: true }
    );
}

export async function marcarTodasComoLeidas(userId) {

    const notificaciones = await obtenerNotificaciones(userId);

    for (const notificacion of notificaciones) {

        if (notificacion.leido !== true) {

            await marcarComoLeida(notificacion.id);
        }
    }
}
