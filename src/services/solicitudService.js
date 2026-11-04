import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

import { actualizarEstadoMascota, obtenerMascota } from "./mascotaService";
import { crearNotificacion } from "./notificacionService";

export const ESTADOS_SOLICITUD = [
    "Pendiente",
    "Aprobada",
    "Rechazada",
    "Cancelada",
    "Concretada"
];

const ESTADOS_ACTIVOS = [
    "Pendiente",
    "Aprobada"
];

export async function existeSolicitudActiva(adoptanteUserId, mascotaId) {

    const referencia = collection(db, "solicitudes_adopcion");

    const consulta = query(
        referencia,
        where("adoptanteUserId", "==", adoptanteUserId),
        where("mascotaId", "==", mascotaId)
    );

    const resultado = await getDocs(consulta);

    let existe = false;

    resultado.forEach((documento) => {

        const datos = documento.data();

        if (ESTADOS_ACTIVOS.includes(datos.estado)) {
            existe = true;
        }
    });

    return existe;
}

export async function emitirSolicitud(datos) {

    // RN-02: un adoptante no puede mantener más de una solicitud activa
    // sobre la misma mascota.
    const yaExiste = await existeSolicitudActiva(
        datos.adoptanteUserId,
        datos.mascotaId
    );

    if (yaExiste) {
        throw new Error(
            "Ya tienes una solicitud activa para esta mascota."
        );
    }

    const referencia = collection(db, "solicitudes_adopcion");

    const resultado = await addDoc(referencia, {
        adoptanteUserId: datos.adoptanteUserId,
        mascotaId: datos.mascotaId,
        albergueId: datos.albergueId,
        datosSolicitante: datos.datosSolicitante,
        estado: "Pendiente",
        observacionesAlbergue: "",
        fechaSolicitud: serverTimestamp()
    });

    return resultado.id;
}

export async function obtenerSolicitudesPorAdoptante(adoptanteUserId) {

    const referencia = collection(db, "solicitudes_adopcion");

    const consulta = query(
        referencia,
        where("adoptanteUserId", "==", adoptanteUserId)
    );

    const resultado = await getDocs(consulta);

    const solicitudes = [];

    resultado.forEach((documento) => {

        solicitudes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return solicitudes;
}

export async function obtenerSolicitudesPorAlbergue(albergueId) {

    const referencia = collection(db, "solicitudes_adopcion");

    const consulta = query(
        referencia,
        where("albergueId", "==", albergueId)
    );

    const resultado = await getDocs(consulta);

    const solicitudes = [];

    resultado.forEach((documento) => {

        solicitudes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return solicitudes;
}

export async function cancelarSolicitud(id) {

    const referencia = doc(db, "solicitudes_adopcion", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la solicitud.");
    }

    if (documento.data().estado !== "Pendiente") {
        throw new Error(
            "Solo se pueden cancelar las solicitudes en estado Pendiente."
        );
    }

    await updateDoc(referencia, {
        estado: "Cancelada"
    });
}

export async function evaluarSolicitud(
    id,
    estado,
    observacionesAlbergue
) {

    if (estado !== "Aprobada" && estado !== "Rechazada") {
        throw new Error("El estado indicado no es válido.");
    }

    // RN-08: el rechazo exige un motivo registrado.
    if (
        estado === "Rechazada" &&
        observacionesAlbergue.trim() === ""
    ) {
        throw new Error(
            "Debes registrar el motivo del rechazo."
        );
    }

    const referencia = doc(db, "solicitudes_adopcion", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la solicitud.");
    }

    const solicitud = documento.data();

    await updateDoc(referencia, {
        estado: estado,
        observacionesAlbergue: observacionesAlbergue
    });

    if (estado === "Aprobada") {

        await actualizarEstadoMascota(
            solicitud.mascotaId,
            "En proceso"
        );
    }

    const mascota = await obtenerMascota(solicitud.mascotaId);

    await crearNotificacion({
        userId: solicitud.adoptanteUserId,
        titulo:
            estado === "Aprobada"
                ? "Tu solicitud fue aprobada"
                : "Tu solicitud fue rechazada",
        mensaje:
            (mascota ? mascota.nombre : "La mascota") +
            ": " +
            (observacionesAlbergue.trim() !== ""
                ? observacionesAlbergue.trim()
                : "El refugio revisó tu solicitud."),
        tipo: "Solicitud"
    });
}

// HU-16: el albergue registra que la adopción se concretó.
//
// Cerrar una adopción toca tres cosas a la vez: la solicitud ganadora, la
// mascota, y las demás solicitudes que quedaron abiertas sobre ese mismo
// animal. Dejar esas últimas en Pendiente seria dejar a sus adoptantes
// esperando una respuesta que nunca llegaria.
export async function concretarAdopcion(id) {

    const referencia = doc(db, "solicitudes_adopcion", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la solicitud.");
    }

    const solicitud = documento.data();

    if (solicitud.estado !== "Aprobada") {
        throw new Error(
            "Solo se puede concretar una adopción a partir de una solicitud aprobada."
        );
    }

    await updateDoc(referencia, {
        estado: "Concretada",
        fechaAdopcion: serverTimestamp()
    });

    // RN-04: la mascota pasa a Adoptada y deja el catálogo público.
    await actualizarEstadoMascota(
        solicitud.mascotaId,
        "Adoptada"
    );

    await cerrarSolicitudesPendientes(
        solicitud.mascotaId,
        id
    );

    const mascota = await obtenerMascota(solicitud.mascotaId);

    await crearNotificacion({
        userId: solicitud.adoptanteUserId,
        titulo: "Adopción concretada",
        mensaje:
            "La adopción de " +
            (mascota ? mascota.nombre : "tu mascota") +
            " quedó registrada. Puedes verla en Mis mascotas adoptadas.",
        tipo: "Adopcion"
    });
}

async function cerrarSolicitudesPendientes(mascotaId, solicitudGanadoraId) {

    const consulta = query(
        collection(db, "solicitudes_adopcion"),
        where("mascotaId", "==", mascotaId)
    );

    const resultado = await getDocs(consulta);

    for (const documento of resultado.docs) {

        if (documento.id === solicitudGanadoraId) {
            continue;
        }

        if (documento.data().estado !== "Pendiente") {
            continue;
        }

        await updateDoc(
            doc(db, "solicitudes_adopcion", documento.id),
            {
                estado: "Rechazada",
                observacionesAlbergue:
                    "La mascota fue adoptada por otro solicitante. " +
                    "Te invitamos a revisar las demás mascotas disponibles."
            }
        );

        await crearNotificacion({
            userId: documento.data().adoptanteUserId,
            titulo: "Tu solicitud se cerró",
            mensaje:
                "La mascota que solicitaste fue adoptada por otra persona. " +
                "Hay más animales esperando un hogar en el catálogo.",
            tipo: "Solicitud"
        });
    }
}

export async function obtenerAdopcionesConcretadas(adoptanteUserId) {

    const solicitudes = await obtenerSolicitudesPorAdoptante(
        adoptanteUserId
    );

    const concretadas = [];

    for (const solicitud of solicitudes) {

        if (solicitud.estado === "Concretada") {
            concretadas.push(solicitud);
        }
    }

    return concretadas;
}

// El panel de administración puede revisar todas las solicitudes; la ruta
// que lo usa está protegida por AdminRoute y las reglas de Firestore.
export async function obtenerSolicitudesAdmin() {
    const resultado = await getDocs(collection(db, "solicitudes_adopcion"));
    return resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
    }));
}
