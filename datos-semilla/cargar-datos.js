/**
 * Carga inicial de los catálogos del sistema en Cloud Firestore.
 *
 * Crea las colecciones departamentos, municipios y especies con
 * identificadores legibles (por ejemplo "cochabamba" o "tiquipaya"),
 * que son los mismos que guardan los documentos de users, albergues
 * y mascotas en sus campos departamentoId y municipioId.
 *
 * El script es idempotente: volver a ejecutarlo no duplica nada,
 * reescribe cada documento con el mismo identificador.
 *
 * Uso:
 *   1. Inicia sesión en la aplicación con una cuenta de rol Admin.
 *   2. Abre la consola del navegador (Cmd + Option + J).
 *   3. Ejecuta:  await cargarDatosIniciales()
 *
 * Para habilitarlo, importa este archivo temporalmente en main.jsx:
 *   import "../datos-semilla/cargar-datos.js";
 */

import { doc, setDoc } from "firebase/firestore";

import { db } from "../src/services/firebase";

import departamentos from "./departamentos.json";
import municipios from "./municipios.json";
import especies from "./especies.json";

async function cargarColeccion(nombreColeccion, registros) {

    const identificadores = Object.keys(registros);

    for (const identificador of identificadores) {

        await setDoc(
            doc(db, nombreColeccion, identificador),
            registros[identificador]
        );
    }

    console.log(
        nombreColeccion + ": " + identificadores.length + " documentos cargados."
    );
}

export async function cargarDatosIniciales() {

    console.log("Cargando catálogos iniciales...");

    await cargarColeccion("departamentos", departamentos);
    await cargarColeccion("municipios", municipios);
    await cargarColeccion("especies", especies);

    console.log("Carga finalizada.");
}

if (typeof window !== "undefined") {
    window.cargarDatosIniciales = cargarDatosIniciales;
}
