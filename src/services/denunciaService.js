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

export const TIPOS_CONTENIDO = [
    "Mascota",
    "Albergue",
    "Servicio",
    "Alerta"
];

export const MOTIVOS_DENUNCIA = [
    "Información falsa o engañosa",
    "Refugio o establecimiento inexistente",
    "Indicios de maltrato animal",
    "Contenido inapropiado",
    "Posible estafa",
    "Otro"
];

export const ESTADOS_DENUNCIA = [
    "Pendiente",
    "Desestimada",
    "Resuelta"
];

export async function crearDenuncia(datos) {

    if (!TIPOS_CONTENIDO.includes(datos.tipoContenido)) {
        throw new Error("El tipo de contenido no es válido.");
    }

    if (!MOTIVOS_DENUNCIA.includes(datos.motivo)) {
        throw new Error("El motivo indicado no es válido.");
    }

    // Una misma persona no acumula denuncias sobre el mismo contenido:
    // repetirla no la hace más urgente, solo infla la bandeja.
    const existentes = await getDocs(
        query(
            collection(db, "denuncias"),
            where("denuncianteUserId", "==", datos.denuncianteUserId),
            where("contenidoReferenciaId", "==", datos.contenidoReferenciaId)
        )
    );

    let yaDenunciado = false;

    existentes.forEach((documento) => {

        if (documento.data().estadoDenuncia === "Pendiente") {
            yaDenunciado = true;
        }
    });

    if (yaDenunciado) {
        throw new Error(
            "Ya reportaste este contenido y tu denuncia está en revisión."
        );
    }

    const resultado = await addDoc(
        collection(db, "denuncias"),
        {
            denuncianteUserId: datos.denuncianteUserId,
            tipoContenido: datos.tipoContenido,
            contenidoReferenciaId: datos.contenidoReferenciaId,
            contenidoUserId: datos.contenidoUserId,
            contenidoTitulo: datos.contenidoTitulo,
            motivo: datos.motivo,
            observaciones: datos.observaciones,
            estadoDenuncia: "Pendiente",
            resolucion: "",
            fechaDenuncia: serverTimestamp()
        }
    );

    return resultado.id;
}

export async function obtenerDenunciasPendientes() {

    const resultado = await getDocs(
        query(
            collection(db, "denuncias"),
            where("estadoDenuncia", "==", "Pendiente")
        )
    );

    const denuncias = [];

    resultado.forEach((documento) => {

        denuncias.push({
            id: documento.id,
            ...documento.data()
        });
    });

    denuncias.sort((a, b) => {

        const fechaA = a.fechaDenuncia?.seconds || 0;
        const fechaB = b.fechaDenuncia?.seconds || 0;

        return fechaA - fechaB;
    });

    return denuncias;
}

export async function obtenerDenunciasResueltas() {

    const resultado = await getDocs(
        collection(db, "denuncias")
    );

    const denuncias = [];

    resultado.forEach((documento) => {

        const datos = documento.data();

        if (datos.estadoDenuncia !== "Pendiente") {

            denuncias.push({
                id: documento.id,
                ...datos
            });
        }
    });

    return denuncias;
}

export async function resolverDenuncia(id, estado, resolucion) {

    if (estado !== "Desestimada" && estado !== "Resuelta") {
        throw new Error("El estado indicado no es válido.");
    }

    if (resolucion.trim() === "") {
        throw new Error(
            "Registra la resolución para dejar constancia de la decisión."
        );
    }

    const referencia = doc(db, "denuncias", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la denuncia.");
    }

    const denuncia = documento.data();

    await updateDoc(referencia, {
        estadoDenuncia: estado,
        resolucion: resolucion.trim()
    });

    // Quien denuncia merece saber en qué terminó su reporte. Sin esto,
    // denunciar se siente como escribir a un buzón sin fondo.
    await crearNotificacion({
        userId: denuncia.denuncianteUserId,
        titulo:
            estado === "Resuelta"
                ? "Tu denuncia fue atendida"
                : "Tu denuncia fue revisada",
        mensaje:
            "Sobre tu reporte de «" +
            (denuncia.contenidoTitulo || "un contenido") +
            "»: " +
            resolucion.trim(),
        tipo: "Moderacion"
    });
}
