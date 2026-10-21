import {
    collection,
    getDocs
} from "firebase/firestore";

import { db } from "./firebase";

// HU-26 y HU-27.
//
// Firestore no sabe contar: no existe un "SELECT COUNT(*)" como en SQL.
// La única forma de obtener un indicador es traer los documentos y
// contarlos aquí. Con el volumen esperado de la plataforma (decenas de
// albergues, cientos de mascotas) esto es perfectamente viable; si el
// sistema creciera, lo correcto sería mantener contadores agregados en
// un documento aparte que se actualice con cada alta. Queda anotado.

export const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

async function leerColeccion(nombre) {

    const resultado = await getDocs(
        collection(db, nombre)
    );

    const documentos = [];

    resultado.forEach((documento) => {

        documentos.push({
            id: documento.id,
            ...documento.data()
        });
    });

    return documentos;
}

// Cuenta cuántos documentos hay de cada valor de un campo.
// Devuelve un objeto { valor: cantidad }.
function agruparPor(documentos, campo) {

    const conteo = {};

    for (const documento of documentos) {

        const valor = documento[campo] || "Sin dato";

        conteo[valor] = (conteo[valor] || 0) + 1;
    }

    return conteo;
}

function contarSi(documentos, campo, valor) {

    let total = 0;

    for (const documento of documentos) {

        if (documento[campo] === valor) {
            total = total + 1;
        }
    }

    return total;
}

// Una sola lectura de la base para todo el módulo: el panel y la
// pantalla de reportes trabajan sobre el mismo objeto en memoria en vez
// de volver a consultar Firestore cada vez.
export async function obtenerDatosDelSistema() {

    const [
        usuarios,
        albergues,
        mascotas,
        solicitudes,
        servicios,
        alertas,
        denuncias
    ] = await Promise.all([
        leerColeccion("users"),
        leerColeccion("albergues"),
        leerColeccion("mascotas"),
        leerColeccion("solicitudes_adopcion"),
        leerColeccion("servicios"),
        leerColeccion("alertas_perdidas"),
        leerColeccion("denuncias")
    ]);

    return {
        usuarios: usuarios,
        albergues: albergues,
        mascotas: mascotas,
        solicitudes: solicitudes,
        servicios: servicios,
        alertas: alertas,
        denuncias: denuncias
    };
}

// HU-26: los números que se muestran en el panel administrativo.
export function calcularIndicadores(datos) {

    const mascotasActivas = datos.mascotas.filter(
        (mascota) => mascota.activo !== false
    );

    const concretadas = contarSi(
        datos.solicitudes,
        "estado",
        "Concretada"
    );

    const evaluadas = datos.solicitudes.filter(
        (solicitud) =>
            solicitud.estado === "Aprobada" ||
            solicitud.estado === "Rechazada" ||
            solicitud.estado === "Concretada"
    );

    const aprobadas = evaluadas.filter(
        (solicitud) => solicitud.estado !== "Rechazada"
    );

    // La tasa solo tiene sentido sobre las solicitudes ya evaluadas:
    // incluir las pendientes la haría parecer más baja de lo que es.
    let tasaAprobacion = 0;

    if (evaluadas.length > 0) {

        tasaAprobacion = Math.round(
            (aprobadas.length / evaluadas.length) * 100
        );
    }

    return {
        usuariosTotal: datos.usuarios.length,
        usuariosSuspendidos: contarSi(
            datos.usuarios,
            "estadoCuenta",
            "Suspendido"
        ),
        usuariosPorRol: agruparPor(datos.usuarios, "rol"),

        alberguesTotal: datos.albergues.length,
        alberguesVerificados: contarSi(
            datos.albergues,
            "estadoVerificacion",
            "Verificado"
        ),
        alberguesPendientes: contarSi(
            datos.albergues,
            "estadoVerificacion",
            "Pendiente_Verificacion"
        ),

        mascotasTotal: mascotasActivas.length,
        mascotasPorEstado: agruparPor(
            mascotasActivas,
            "estadoAdopcion"
        ),
        mascotasPorEspecie: agruparPor(
            mascotasActivas,
            "especieId"
        ),
        mascotasPorTamano: agruparPor(
            mascotasActivas,
            "tamano"
        ),

        solicitudesTotal: datos.solicitudes.length,
        solicitudesPorEstado: agruparPor(
            datos.solicitudes,
            "estado"
        ),
        adopcionesConcretadas: concretadas,
        tasaAprobacion: tasaAprobacion,

        serviciosTotal: datos.servicios.length,
        serviciosVerificados: contarSi(
            datos.servicios,
            "estadoVerificacion",
            "Verificado"
        ),
        serviciosPendientes: contarSi(
            datos.servicios,
            "estadoVerificacion",
            "Pendiente_Verificacion"
        ),
        serviciosPorCategoria: agruparPor(
            datos.servicios,
            "categoria"
        ),

        alertasActivas: contarSi(
            datos.alertas,
            "estadoAlerta",
            "Activa"
        ),
        alertasResueltas: contarSi(
            datos.alertas,
            "estadoAlerta",
            "Resuelta"
        ),

        denunciasPendientes: contarSi(
            datos.denuncias,
            "estadoDenuncia",
            "Pendiente"
        )
    };
}

// RF-40. Convierte una fecha escrita como "2026-03-14" en el instante
// que corresponde. El inicio se toma a las 00:00 y el fin a las 23:59:59,
// para que el día elegido como "hasta" quede incluido completo: si se
// tomara a las 00:00, una adopción registrada esa misma tarde quedaría
// fuera del reporte sin que nadie entienda por qué.
function limiteDelDia(texto, finDelDia) {

    if (!texto) {
        return null;
    }

    const partes = texto.split("-");

    if (partes.length !== 3) {
        return null;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    return finDelDia
        ? new Date(anio, mes, dia, 23, 59, 59, 999)
        : new Date(anio, mes, dia, 0, 0, 0, 0);
}

export function dentroDelRango(fecha, desde, hasta) {

    if (!fecha || !fecha.seconds) {
        return false;
    }

    const momento = new Date(fecha.seconds * 1000);

    const inicio = limiteDelDia(desde, false);
    const fin = limiteDelDia(hasta, true);

    if (inicio && momento < inicio) {
        return false;
    }

    if (fin && momento > fin) {
        return false;
    }

    return true;
}

// HU-27 y RF-40: adopciones concretadas agrupadas dentro de un rango de
// fechas. Si el rango abarca doce meses o menos se agrupa por mes; si
// abarca más, se agrupa por año, porque un gráfico de cuarenta barras no
// se lee. Devuelve siempre todos los tramos del rango, aunque estén en
// cero: un gráfico con huecos se lee peor que uno con ceros explícitos.
export function adopcionesPorPeriodo(solicitudes, desde, hasta) {

    const concretadas = solicitudes.filter(
        (solicitud) =>
            solicitud.estado === "Concretada" &&
            dentroDelRango(solicitud.fechaAdopcion, desde, hasta)
    );

    const inicio = limiteDelDia(desde, false);
    const fin = limiteDelDia(hasta, true);

    // Sin rango explícito se usa el año en curso.
    const primero = inicio || new Date(new Date().getFullYear(), 0, 1);
    const ultimo = fin || new Date();

    const mesesDeDiferencia =
        (ultimo.getFullYear() - primero.getFullYear()) * 12 +
        (ultimo.getMonth() - primero.getMonth());

    const porAnio = mesesDeDiferencia > 11;

    const serie = [];
    const indicePorClave = {};

    if (porAnio) {

        for (
            let anio = primero.getFullYear();
            anio <= ultimo.getFullYear();
            anio = anio + 1
        ) {
            indicePorClave[anio] = serie.length;

            serie.push({
                etiqueta: String(anio),
                corta: String(anio).slice(2),
                cantidad: 0
            });
        }

    } else {

        const cursor = new Date(
            primero.getFullYear(),
            primero.getMonth(),
            1
        );

        while (
            cursor.getFullYear() < ultimo.getFullYear() ||
            (cursor.getFullYear() === ultimo.getFullYear() &&
                cursor.getMonth() <= ultimo.getMonth())
        ) {
            const clave =
                cursor.getFullYear() + "-" + cursor.getMonth();

            indicePorClave[clave] = serie.length;

            serie.push({
                etiqueta:
                    MESES[cursor.getMonth()] + " " + cursor.getFullYear(),
                corta: MESES[cursor.getMonth()].substring(0, 3),
                cantidad: 0
            });

            cursor.setMonth(cursor.getMonth() + 1);
        }
    }

    for (const solicitud of concretadas) {

        const fecha = new Date(
            solicitud.fechaAdopcion.seconds * 1000
        );

        const clave = porAnio
            ? fecha.getFullYear()
            : fecha.getFullYear() + "-" + fecha.getMonth();

        const indice = indicePorClave[clave];

        if (indice !== undefined) {
            serie[indice].cantidad = serie[indice].cantidad + 1;
        }
    }

    return {
        serie: serie,
        total: concretadas.length,
        agrupadoPor: porAnio ? "año" : "mes"
    };
}

// HU-27: cobertura territorial. Cuántos albergues verificados y cuántas
// mascotas publicadas hay en cada departamento.
export function coberturaPorDepartamento(
    departamentos,
    albergues,
    mascotas
) {
    const filas = [];

    for (const departamento of departamentos) {

        const alberguesDelDepartamento = albergues.filter(
            (albergue) =>
                albergue.departamentoId === departamento.id &&
                albergue.estadoVerificacion === "Verificado"
        );

        const identificadores = alberguesDelDepartamento.map(
            (albergue) => albergue.id
        );

        let mascotasDelDepartamento = 0;

        for (const mascota of mascotas) {

            if (
                mascota.activo !== false &&
                identificadores.includes(mascota.albergueId)
            ) {
                mascotasDelDepartamento = mascotasDelDepartamento + 1;
            }
        }

        filas.push({
            departamento: departamento.nombre,
            albergues: alberguesDelDepartamento.length,
            mascotas: mascotasDelDepartamento
        });
    }

    filas.sort((a, b) => b.mascotas - a.mascotas);

    return filas;
}

// Convierte una tabla en texto CSV. Se usa punto y coma como separador
// porque Excel en configuración regional de Bolivia abre así las
// columnas sin pedir nada al usuario.
export function convertirACsv(encabezados, filas) {

    const lineas = [encabezados.join(";")];

    for (const fila of filas) {

        const celdas = [];

        for (const celda of fila) {

            const texto = String(celda === undefined ? "" : celda);

            // Si el dato trae el separador o comillas, se encierra entre
            // comillas y se duplican las comillas internas.
            if (
                texto.includes(";") ||
                texto.includes("\"") ||
                texto.includes("\n")
            ) {
                celdas.push(
                    "\"" + texto.replace(/"/g, "\"\"") + "\""
                );

            } else {
                celdas.push(texto);
            }
        }

        lineas.push(celdas.join(";"));
    }

    return lineas.join("\n");
}

// Dispara la descarga del CSV en el navegador. El BOM inicial es lo que
// hace que Excel respete los acentos.
export function descargarCsv(nombreArchivo, contenido) {

    const archivo = new Blob(
        ["﻿" + contenido],
        { type: "text/csv;charset=utf-8;" }
    );

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);

    URL.revokeObjectURL(enlace.href);
}
