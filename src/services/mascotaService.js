import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export const ESTADOS_ADOPCION = [
    "Disponible",
    "En proceso",
    "Adoptada",
    "No disponible"
];

export const ESTADOS_PUBLICOS = [
    "Disponible",
    "En proceso"
];

export const CATEGORIAS_EDAD = [
    "Cachorro",
    "Joven",
    "Adulto",
    "Senior"
];

export const TAMANOS = [
    "Pequeño",
    "Mediano",
    "Grande"
];

export const SEXOS = [
    "Macho",
    "Hembra"
];

export function calcularCategoriaEdad(edadAproximada) {

    const edad = Number(edadAproximada);

    if (edad < 1) {
        return "Cachorro";
    }

    if (edad < 3) {
        return "Joven";
    }

    if (edad < 8) {
        return "Adulto";
    }

    return "Senior";
}

export async function registrarMascota(datos) {

    const referencia = collection(db, "mascotas");

    const resultado = await addDoc(referencia, {
        albergueId: datos.albergueId,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        especieId: datos.especieId,
        raza: datos.raza,
        edadAproximada: datos.edadAproximada,
        edadCategoria: calcularCategoriaEdad(
            datos.edadAproximada
        ),
        tamano: datos.tamano,
        sexo: datos.sexo,
        fotosUrls: datos.fotosUrls,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        estadoAdopcion: "Disponible",
        activo: true,
        fechaRegistro: serverTimestamp()
    });

    return resultado.id;
}

export async function obtenerMascota(id) {

    const referencia = doc(db, "mascotas", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        return null;
    }

    return {
        id: documento.id,
        ...documento.data()
    };
}

export async function obtenerMascotasPorAlbergue(albergueId) {

    const referencia = collection(db, "mascotas");

    const consulta = query(
        referencia,
        where("albergueId", "==", albergueId)
    );

    const resultado = await getDocs(consulta);

    const mascotas = [];

    resultado.forEach((documento) => {

        const datos = documento.data();

        if (datos.activo !== false) {

            mascotas.push({
                id: documento.id,
                ...datos
            });
        }
    });

    mascotas.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    return mascotas;
}

export async function obtenerMascotasPublicas() {

    const referencia = collection(db, "mascotas");

    const consulta = query(
        referencia,
        where("estadoAdopcion", "in", ESTADOS_PUBLICOS),
        orderBy("nombre")
    );

    const resultado = await getDocs(consulta);

    const mascotas = [];

    resultado.forEach((documento) => {

        const datos = documento.data();

        if (datos.activo !== false) {

            mascotas.push({
                id: documento.id,
                ...datos
            });
        }
    });

    return mascotas;
}

export async function obtenerMascotasPorIds(ids) {

    const mascotas = [];

    for (const id of ids) {

        const mascota = await obtenerMascota(id);

        if (mascota && mascota.activo !== false) {
            mascotas.push(mascota);
        }
    }

    return mascotas;
}

export function filtrarMascotas(mascotas, filtros) {

    const resultado = [];

    const texto = (filtros.texto || "")
        .trim()
        .toLowerCase();

    for (const mascota of mascotas) {

        if (
            texto &&
            !(mascota.nombre || "")
                .toLowerCase()
                .includes(texto)
        ) {
            continue;
        }

        if (
            filtros.departamentoId &&
            mascota.departamentoId !== filtros.departamentoId
        ) {
            continue;
        }

        if (
            filtros.municipioId &&
            mascota.municipioId !== filtros.municipioId
        ) {
            continue;
        }

        if (
            filtros.especieId &&
            mascota.especieId !== filtros.especieId
        ) {
            continue;
        }

        if (
            filtros.edadCategoria &&
            mascota.edadCategoria !== filtros.edadCategoria
        ) {
            continue;
        }

        if (
            filtros.tamano &&
            mascota.tamano !== filtros.tamano
        ) {
            continue;
        }

        if (
            filtros.sexo &&
            mascota.sexo !== filtros.sexo
        ) {
            continue;
        }

        if (
            filtros.albergueId &&
            mascota.albergueId !== filtros.albergueId
        ) {
            continue;
        }

        resultado.push(mascota);
    }

    return resultado;
}

export async function actualizarMascota(id, datos) {

    const referencia = doc(db, "mascotas", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error("No se encontró la mascota.");
    }

    await updateDoc(referencia, {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        especieId: datos.especieId,
        raza: datos.raza,
        edadAproximada: datos.edadAproximada,
        edadCategoria: calcularCategoriaEdad(
            datos.edadAproximada
        ),
        tamano: datos.tamano,
        sexo: datos.sexo,
        fotosUrls: datos.fotosUrls,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId
    });
}

export async function actualizarEstadoMascota(id, estadoAdopcion) {

    if (!ESTADOS_ADOPCION.includes(estadoAdopcion)) {
        throw new Error("El estado de adopción no es válido.");
    }

    const referencia = doc(db, "mascotas", id);

    await updateDoc(referencia, {
        estadoAdopcion: estadoAdopcion
    });
}

// Baja lógica: la mascota deja de mostrarse pero el documento se conserva,
// porque puede estar referenciado por solicitudes de adopción (RNF-08).
export async function darDeBajaMascota(id) {

    const referencia = doc(db, "mascotas", id);

    await updateDoc(referencia, {
        activo: false,
        estadoAdopcion: "No disponible"
    });
}
