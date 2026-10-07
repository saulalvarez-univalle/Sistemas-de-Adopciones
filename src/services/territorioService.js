import {
    collection,
    getDocs
} from "firebase/firestore";

import { db } from "./firebase";

export async function obtenerDepartamentos() {
    const referencia = collection(db, "departamentos");

    const resultado = await getDocs(referencia);

    const departamentos = [];

    resultado.forEach((documento) => {
        departamentos.push({
            id: documento.id,
            ...documento.data()
        });
    });

    departamentos.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    return departamentos;
}

export async function obtenerMunicipios(departamentoId) {
    const referencia = collection(db, "municipios");

    const resultado = await getDocs(referencia);

    const municipios = [];

    resultado.forEach((documento) => {
        const datos = documento.data();

        if (
            datos.departamentoId === departamentoId &&
            datos.activo === true
        ) {
            municipios.push({
                id: documento.id,
                ...datos
            });
        }
    });

    municipios.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    return municipios;
}