import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc
} from "firebase/firestore";

import { db } from "./firebase";

import { crearNotificacion } from "./notificacionService";

import {
    suspenderCuenta,
    reactivarCuenta
} from "./userService";

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
        logoUrl: datos.logoUrl || "",
        estadoVerificacion: "Pendiente_Verificacion",
        activo: true,
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

export async function obtenerAlberguePorId(id) {

    const referencia = doc(db, "albergues", id);

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        return null;
    }

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
            datos.horariosAtencion,

        logoUrl:
            datos.logoUrl || ""
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

// El administrador necesita ver también los ya verificados y los
// rechazados: si solo viera los pendientes, un refugio verificado por
// error quedaría fuera de su alcance para siempre.
export async function obtenerTodosLosAlbergues() {

    const resultado = await getDocs(
        collection(db, "albergues")
    );

    const albergues = [];

    resultado.forEach((documento) => {

        albergues.push({
            id: documento.id,
            ...documento.data()
        });
    });

    // Primero lo que espera revisión, que es lo que requiere acción.
    const orden = {
        "Pendiente_Verificacion": 0,
        "Verificado": 1,
        "Rechazado": 2
    };

    albergues.sort((a, b) => {

        const peso =
            (orden[a.estadoVerificacion] ?? 3) -
            (orden[b.estadoVerificacion] ?? 3);

        if (peso !== 0) {
            return peso;
        }

        return (a.nombreRefugio || "").localeCompare(
            b.nombreRefugio || ""
        );
    });

    return albergues;
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

    const documento = await getDoc(referencia);

    await updateDoc(
        referencia,
        {
            estadoVerificacion:
                estadoVerificacion,

            motivoRechazo:
                motivoRechazo
        }
    );

    if (documento.exists()) {

        // Quitarle la verificación a un refugio que ya la tenía no es lo
        // mismo que rechazar una solicitud nueva: el aviso tiene que
        // decirle que sus publicaciones dejaron de ser visibles.
        const estabaVerificado =
            documento.data().estadoVerificacion === "Verificado";

        const revocacion =
            estabaVerificado && estadoVerificacion !== "Verificado";

        let titulo = "Tu solicitud fue rechazada";
        let mensaje = "Motivo: " + motivoRechazo;

        if (estadoVerificacion === "Verificado") {

            titulo = "Tu refugio fue verificado";

            mensaje =
                "Ya puedes publicar mascotas y apareces en el listado " +
                "público de refugios.";

        } else if (revocacion) {

            titulo = "Se retiró la verificación de tu refugio";

            mensaje =
                "Tu refugio dejó de aparecer en el listado público y no " +
                "puede publicar mascotas. Motivo: " + motivoRechazo +
                ". Si corriges la información, tu registro vuelve a la " +
                "cola de revisión.";
        }

        await crearNotificacion({
            userId: documento.data().userId,
            titulo: titulo,
            mensaje: mensaje,
            tipo: "Verificacion"
        });
    }
}

// Un refugio aparece en público solo si está verificado Y su responsable
// no está suspendido. El estado de la cuenta vive en la colección "users",
// que el visitante no puede leer, así que se copia aquí como un campo
// "activo" (lo escriben suspenderRefugio y reactivarRefugio). El filtro por
// "activo" se hace en memoria a propósito: un segundo where() obligaría a
// crear un índice compuesto en Firestore, y la cantidad de refugios del
// sistema no lo justifica.
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

        const datos = documento.data();

        // Los refugios registrados antes de que existiera el campo no
        // tienen "activo": se consideran activos.
        if (datos.activo === false) {
            return;
        }

        albergues.push({
            id: documento.id,
            ...datos
        });

    });

    return albergues;
}

// Suspender al responsable y ocultar el refugio son dos caras de la misma
// medida, y por eso se hacen juntas. Antes no era así: se suspendía la
// cuenta, el usuario ya no podía entrar, pero su refugio seguía apareciendo
// en el listado público y sus mascotas en el catálogo, que es justo lo que
// la suspensión pretende evitar. No se borra nada (RNF-08): "activo" vuelve
// a true al reactivar.
export async function suspenderRefugio(albergueId, userId) {

    await suspenderCuenta(userId);

    await updateDoc(
        doc(db, "albergues", albergueId),
        { activo: false }
    );

    await crearNotificacion({
        userId: userId,
        titulo: "Tu cuenta fue suspendida",
        mensaje:
            "Un administrador suspendió tu cuenta. Tu refugio dejó de " +
            "aparecer en el listado público y sus mascotas salieron del " +
            "catálogo. Comunícate con la administración de Red Huella " +
            "para resolverlo.",
        tipo: "Moderacion"
    });
}


export async function reactivarRefugio(albergueId, userId) {

    await reactivarCuenta(userId);

    await updateDoc(
        doc(db, "albergues", albergueId),
        { activo: true }
    );

    await crearNotificacion({
        userId: userId,
        titulo: "Tu cuenta fue reactivada",
        mensaje:
            "Ya puedes iniciar sesión otra vez. Si tu refugio está " +
            "verificado, volvió a aparecer en el listado público junto " +
            "con sus mascotas.",
        tipo: "Moderacion"
    });
}
