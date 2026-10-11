import {
    collection,
    doc,
    getDocs,
    setDoc
} from "firebase/firestore";

import { db } from "./firebase";

import departamentos from "../../datos-semilla/departamentos.json";
import municipios from "../../datos-semilla/municipios.json";
import especies from "../../datos-semilla/especies.json";

const CATALOGOS = {
    departamentos: departamentos,
    municipios: municipios,
    especies: especies
};

export async function contarCatalogos() {

    const conteo = {};

    for (const nombreColeccion of Object.keys(CATALOGOS)) {

        const resultado = await getDocs(
            collection(db, nombreColeccion)
        );

        conteo[nombreColeccion] = {
            enBaseDeDatos: resultado.size,
            enSemilla: Object.keys(
                CATALOGOS[nombreColeccion]
            ).length
        };
    }

    return conteo;
}

// La carga es idempotente: cada documento se escribe con un identificador
// legible y fijo, de modo que volver a ejecutarla no duplica nada, solo
// reescribe el mismo registro.
export async function cargarCatalogo(nombreColeccion) {

    const registros = CATALOGOS[nombreColeccion];

    if (!registros) {
        throw new Error(
            "El catálogo indicado no existe."
        );
    }

    const identificadores = Object.keys(registros);

    for (const identificador of identificadores) {

        await setDoc(
            doc(db, nombreColeccion, identificador),
            registros[identificador]
        );
    }

    return identificadores.length;
}

export async function cargarTodosLosCatalogos() {

    const resumen = {};

    for (const nombreColeccion of Object.keys(CATALOGOS)) {

        resumen[nombreColeccion] = await cargarCatalogo(
            nombreColeccion
        );
    }

    return resumen;
}
