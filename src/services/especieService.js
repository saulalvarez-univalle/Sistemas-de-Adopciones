import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";

import { db } from "./firebase";

export async function obtenerEspecies() {

    const referencia = collection(db, "especies");

    const consulta = query(
        referencia,
        orderBy("nombre")
    );

    const resultado = await getDocs(consulta);

    const especies = [];

    resultado.forEach((documento) => {

        especies.push({
            id: documento.id,
            ...documento.data()
        });

    });

    return especies;
}

export async function obtenerEspeciesActivas() {

    const referencia = collection(db, "especies");

    const resultado = await getDocs(referencia);

    const especies = [];

    resultado.forEach((documento) => {

        const datos = documento.data();

        if (datos.activo === true) {

            especies.push({
                id: documento.id,
                ...datos
            });

        }

    });

    especies.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    return especies;
}

export async function crearEspecie(nombre) {

    const referencia = collection(db, "especies");

    const resultado = await getDocs(referencia);

    for (const documento of resultado.docs) {

        const datos = documento.data();

        if (
            datos.nombre &&
            datos.nombre.toLowerCase() === nombre.toLowerCase()
        ) {
            throw new Error(
                "Ya existe una especie con ese nombre."
            );
        }
    }

    const nuevaEspecie = await addDoc(
        referencia,
        {
            nombre: nombre,
            activo: true
        }
    );

    return nuevaEspecie.id;
}

export async function actualizarEspecie(
    id,
    nombre,
    activo
) {

    const referencia = collection(db, "especies");

    const resultado = await getDocs(referencia);

    for (const documento of resultado.docs) {

        const datos = documento.data();

        if (
            documento.id !== id &&
            datos.nombre &&
            datos.nombre.toLowerCase() === nombre.toLowerCase()
        ) {
            throw new Error(
                "Ya existe otra especie con ese nombre."
            );
        }
    }

    const documentoEspecie = doc(
        db,
        "especies",
        id
    );

    await updateDoc(
        documentoEspecie,
        {
            nombre: nombre,
            activo: activo
        }
    );
}