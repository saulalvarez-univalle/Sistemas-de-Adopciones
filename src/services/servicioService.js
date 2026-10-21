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

import { crearNotificacion } from "./notificacionService";

// RNF-10: los establecimientos se modelan en una sola colección con un
// campo categoria. Incorporar una categoría nueva es agregar un valor a
// esta lista; la estructura de datos no cambia.
export const CATEGORIAS_SERVICIO = [
    "Veterinaria",
    "Tienda de mascotas",
    "Peluquería canina y felina"
];

export const ESTADOS_VERIFICACION = [
    "Pendiente_Verificacion",
    "Verificado",
    "Rechazado"
];

export async function registrarServicio(datos) {

    if (!CATEGORIAS_SERVICIO.includes(datos.categoria)) {
        throw new Error("La categoría indicada no es válida.");
    }

    const referencia = collection(db, "servicios");

    const resultado = await addDoc(referencia, {
        userId: datos.userId,
        categoria: datos.categoria,
        nombreComercio: datos.nombreComercio,
        descripcion: datos.descripcion,
        serviciosOfrecidos: datos.serviciosOfrecidos,
        horarioAtencion: datos.horarioAtencion,
        telefono: datos.telefono,
        telefonoEmergencias: datos.telefonoEmergencias,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        direccion: datos.direccion,
        latitud: datos.latitud,
        longitud: datos.longitud,
        fotoUrl: datos.fotoUrl || "",
        estadoVerificacion: "Pendiente_Verificacion",
        motivoRechazo: "",
        fechaSolicitud: serverTimestamp()
    });

    return resultado.id;
}

export async function obtenerServicioPorUsuario(userId) {

    const consulta = query(
        collection(db, "servicios"),
        where("userId", "==", userId)
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
        return null;
    }

    const documento = resultado.docs[0];

    return {
        id: documento.id,
        ...documento.data()
    };
}

export async function obtenerServicioPorId(id) {

    const documento = await getDoc(
        doc(db, "servicios", id)
    );

    if (!documento.exists()) {
        return null;
    }

    return {
        id: documento.id,
        ...documento.data()
    };
}

export async function actualizarServicio(id, datos) {

    if (!CATEGORIAS_SERVICIO.includes(datos.categoria)) {
        throw new Error("La categoría indicada no es válida.");
    }

    const referencia = doc(db, "servicios", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró el establecimiento.");
    }

    const datosActuales = documento.data();

    const cambios = {
        categoria: datos.categoria,
        nombreComercio: datos.nombreComercio,
        descripcion: datos.descripcion,
        serviciosOfrecidos: datos.serviciosOfrecidos,
        horarioAtencion: datos.horarioAtencion,
        telefono: datos.telefono,
        telefonoEmergencias: datos.telefonoEmergencias,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        direccion: datos.direccion,
        latitud: datos.latitud,
        longitud: datos.longitud,
        fotoUrl: datos.fotoUrl || ""
    };

    // Mismo criterio que en albergues: corregir un registro rechazado lo
    // devuelve a la cola de revisión en lugar de dejarlo bloqueado.
    if (datosActuales.estadoVerificacion === "Rechazado") {

        cambios.estadoVerificacion = "Pendiente_Verificacion";

        cambios.motivoRechazo = "";
    }

    await updateDoc(referencia, cambios);
}

export async function obtenerServiciosPendientes() {

    const consulta = query(
        collection(db, "servicios"),
        where("estadoVerificacion", "==", "Pendiente_Verificacion")
    );

    const resultado = await getDocs(consulta);

    const servicios = [];

    resultado.forEach((documento) => {

        servicios.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return servicios;
}

// RN-06: solo los establecimientos validados aparecen en el directorio
// y en el mapa.
export async function obtenerServiciosVerificados() {

    const consulta = query(
        collection(db, "servicios"),
        where("estadoVerificacion", "==", "Verificado")
    );

    const resultado = await getDocs(consulta);

    const servicios = [];

    resultado.forEach((documento) => {

        servicios.push({
            id: documento.id,
            ...documento.data()
        });
    });

    servicios.sort((a, b) =>
        (a.nombreComercio || "").localeCompare(b.nombreComercio || "")
    );

    return servicios;
}

export async function actualizarEstadoServicio(
    id,
    estadoVerificacion,
    motivoRechazo
) {

    if (!ESTADOS_VERIFICACION.includes(estadoVerificacion)) {
        throw new Error("El estado indicado no es válido.");
    }

    // RN-08: el rechazo exige un motivo registrado.
    if (
        estadoVerificacion === "Rechazado" &&
        motivoRechazo.trim() === ""
    ) {
        throw new Error("Debes registrar el motivo del rechazo.");
    }

    const referencia = doc(db, "servicios", id);

    const documento = await getDoc(referencia);

    await updateDoc(
        referencia,
        {
            estadoVerificacion: estadoVerificacion,
            motivoRechazo: motivoRechazo
        }
    );

    if (documento.exists()) {

        await crearNotificacion({
            userId: documento.data().userId,
            titulo:
                estadoVerificacion === "Verificado"
                    ? "Tu establecimiento fue verificado"
                    : "Tu solicitud fue rechazada",
            mensaje:
                estadoVerificacion === "Verificado"
                    ? "Ya apareces en el directorio público y en el mapa de servicios."
                    : "Motivo: " + motivoRechazo,
            tipo: "Verificacion"
        });
    }
}

export function filtrarServicios(servicios, filtros) {

    const resultado = [];

    const texto = (filtros.texto || "")
        .trim()
        .toLowerCase();

    for (const servicio of servicios) {

        if (
            texto &&
            !(servicio.nombreComercio || "")
                .toLowerCase()
                .includes(texto)
        ) {
            continue;
        }

        if (
            filtros.categoria &&
            servicio.categoria !== filtros.categoria
        ) {
            continue;
        }

        if (
            filtros.departamentoId &&
            servicio.departamentoId !== filtros.departamentoId
        ) {
            continue;
        }

        if (
            filtros.municipioId &&
            servicio.municipioId !== filtros.municipioId
        ) {
            continue;
        }

        resultado.push(servicio);
    }

    return resultado;
}
