import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc
} from "firebase/firestore";

import { db } from "./firebase";

export async function registrarAlbergue(datos) {

    const referencia = collection(db, "albergues");

    const resultado = await addDoc(referencia, {
        userId: datos.userId,
        nombreRefugio: datos.nombreRefugio,
        descripcion: datos.descripcion,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        direccion: datos.direccion,
        latitud: datos.latitud,
        longitud: datos.longitud,
        telefonoContacto: datos.telefonoContacto,
        horariosAtencion: datos.horariosAtencion,
        estadoVerificacion: "Pendiente_Verificacion",
        fechaSolicitud: new Date(),
        motivoRechazo: ""
    });

    return resultado.id;
}

export async function obtenerAlberguePorUsuario(userId) {

    const referencia = collection(db, "albergues");

    const consulta = query(
        referencia,
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

export async function actualizarAlbergue(id, datos) {

    const referencia =
        doc(db, "albergues", id);

    const documento =
        await getDoc(referencia);

    if (!documento.exists()) {
        throw new Error(
            "No se encontró el albergue."
        );
    }

    const datosActuales =
        documento.data();

    const cambios = {
        nombreRefugio:
            datos.nombreRefugio,

        descripcion:
            datos.descripcion,

        departamentoId:
            datos.departamentoId,

        municipioId:
            datos.municipioId,

        direccion:
            datos.direccion,

        latitud:
            datos.latitud,

        longitud:
            datos.longitud,

        telefonoContacto:
            datos.telefonoContacto,

        horariosAtencion:
            datos.horariosAtencion
    };

    if (
        datosActuales.estadoVerificacion ===
        "Rechazado"
    ) {

        cambios.estadoVerificacion =
            "Pendiente_Verificacion";

        cambios.motivoRechazo = "";
    }

    await updateDoc(
        referencia,
        cambios
    );
}

export async function obtenerAlberguesPendientes() {
    const referencia = collection(db, "albergues");

    const consulta = query(
        referencia,
        where("estadoVerificacion", "==", "Pendiente_Verificacion")
    );

    const resultado = await getDocs(consulta);

    const albergues = [];

    resultado.forEach((documento) => {
        albergues.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return albergues;
}
export async function actualizarEstadoAlbergue(
    id,
    estadoVerificacion,
    motivoRechazo
) {

    const referencia =
        doc(db, "albergues", id);

    await updateDoc(
        referencia,
        {
            estadoVerificacion:
                estadoVerificacion,

            motivoRechazo:
                motivoRechazo
        }
    );
}

export async function obtenerAlberguesVerificados() {

    const referencia = collection(db, "albergues");

    const consulta = query(
        referencia,
        where(
            "estadoVerificacion",
            "==",
            "Verificado"
        )
    );

    const resultado = await getDocs(consulta);

    const albergues = [];

    resultado.forEach((documento) => {

        albergues.push({
            id: documento.id,
            ...documento.data()
        });

    });

    return albergues;
}