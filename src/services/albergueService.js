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

    const referencia = doc(db, "albergues", id);

    await updateDoc(referencia, {
        nombreRefugio: datos.nombreRefugio,
        descripcion: datos.descripcion,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        direccion: datos.direccion,
        latitud: datos.latitud,
        longitud: datos.longitud,
        telefonoContacto: datos.telefonoContacto,
        horariosAtencion: datos.horariosAtencion
    });
}