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

import { actualizarEstadoMascota } from "./mascotaService";

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
}
