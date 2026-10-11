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

// HU-18 y HU-19 son el mismo flujo con distinta intención: alguien perdió
// a su mascota, o alguien encontró una que no es suya. Por eso comparten
// colección y se distinguen por el campo tipoAlerta.
export const TIPOS_ALERTA = [
    "Perdida",
    "Encontrada"
];

export const ESTADOS_ALERTA = [
    "Activa",
    "Resuelta"
];

export async function publicarAlerta(datos) {

    if (!TIPOS_ALERTA.includes(datos.tipoAlerta)) {
        throw new Error("El tipo de alerta no es válido.");
    }

    const referencia = collection(db, "alertas_perdidas");

    const resultado = await addDoc(referencia, {
        userId: datos.userId,
        tipoAlerta: datos.tipoAlerta,
        nombreMascota: datos.nombreMascota,
        especieId: datos.especieId,
        descripcion: datos.descripcion,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        zonaExtravio: datos.zonaExtravio,
        fechaSuceso: datos.fechaSuceso,
        telefonoContacto: datos.telefonoContacto,
        fotoUrl: datos.fotoUrl,
        estadoAlerta: "Activa",
        fechaPublicacion: serverTimestamp()
    });

    return resultado.id;
}

export async function obtenerAlertasActivas() {

    const consulta = query(
        collection(db, "alertas_perdidas"),
        where("estadoAlerta", "==", "Activa")
    );

    const resultado = await getDocs(consulta);

    const alertas = [];

    resultado.forEach((documento) => {

        alertas.push({
            id: documento.id,
            ...documento.data()
        });
    });

    // Las más recientes primero. El orden se resuelve en memoria para no
    // depender de un índice compuesto, igual que en el catálogo.
    alertas.sort((a, b) => {

        const fechaA = a.fechaPublicacion?.seconds || 0;
        const fechaB = b.fechaPublicacion?.seconds || 0;

        return fechaB - fechaA;
    });

    return alertas;
}

export async function obtenerAlertasPorUsuario(userId) {

    const consulta = query(
        collection(db, "alertas_perdidas"),
        where("userId", "==", userId)
    );

    const resultado = await getDocs(consulta);

    const alertas = [];

    resultado.forEach((documento) => {

        alertas.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return alertas;
}

// El reencuentro es el final feliz de esta historia: quien publicó la
// alerta la cierra, y deja de ocupar espacio en el muro de los demás.
export async function marcarComoResuelta(id) {

    const referencia = doc(db, "alertas_perdidas", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la alerta.");
    }

    await updateDoc(referencia, {
        estadoAlerta: "Resuelta"
    });
}

export function filtrarAlertas(alertas, filtros) {

    const resultado = [];

    const texto = (filtros.texto || "")
        .trim()
        .toLowerCase();

    for (const alerta of alertas) {

        if (
            texto &&
            !(alerta.nombreMascota || "")
                .toLowerCase()
                .includes(texto) &&
            !(alerta.zonaExtravio || "")
                .toLowerCase()
                .includes(texto)
        ) {
            continue;
        }

        if (
            filtros.tipoAlerta &&
            alerta.tipoAlerta !== filtros.tipoAlerta
        ) {
            continue;
        }

        if (
            filtros.especieId &&
            alerta.especieId !== filtros.especieId
        ) {
            continue;
        }

        if (
            filtros.departamentoId &&
            alerta.departamentoId !== filtros.departamentoId
        ) {
            continue;
        }

        if (
            filtros.municipioId &&
            alerta.municipioId !== filtros.municipioId
        ) {
            continue;
        }

        resultado.push(alerta);
    }

    return resultado;
}
