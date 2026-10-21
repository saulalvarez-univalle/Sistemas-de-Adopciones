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
//
// Hay un caso que eso no cubre. Las especies también se pueden crear a
// mano desde el panel de administración, y ahí Firestore les asigna un
// identificador aleatorio. Si alguien creó "Perro" por esa vía y después
// se ejecuta la semilla, quedarían dos documentos con el mismo nombre y
// distinto identificador: el catálogo mostraría "Perro" dos veces y las
// mascotas quedarían repartidas entre los dos. Por eso, antes de escribir,
// se descarta todo registro cuyo nombre ya exista bajo otro identificador.
async function nombresYaUsados(nombreColeccion) {

    const resultado = await getDocs(
        collection(db, nombreColeccion)
    );

    const usados = {};

    resultado.forEach((documento) => {

        const nombre = documento.data().nombre;

        if (nombre) {
            usados[nombre.trim().toLowerCase()] = documento.id;
        }
    });

    return usados;
}

export async function cargarCatalogo(nombreColeccion) {

    const registros = CATALOGOS[nombreColeccion];

    if (!registros) {
        throw new Error(
            "El catálogo indicado no existe."
        );
    }

    const usados = await nombresYaUsados(nombreColeccion);

    let escritos = 0;
    let omitidos = 0;

    for (const identificador of Object.keys(registros)) {

        const nombre = (registros[identificador].nombre || "")
            .trim()
            .toLowerCase();

        const duenoDelNombre = usados[nombre];

        if (duenoDelNombre && duenoDelNombre !== identificador) {

            omitidos = omitidos + 1;

            continue;
        }

        await setDoc(
            doc(db, nombreColeccion, identificador),
            registros[identificador]
        );

        escritos = escritos + 1;
    }

    return { escritos: escritos, omitidos: omitidos };
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
