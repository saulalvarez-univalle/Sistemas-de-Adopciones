import { useEffect, useState, useCallback } from "react";

import {
    obtenerDatosDelSistema,
    calcularIndicadores,
    adopcionesPorMes,
    coberturaPorDepartamento,
    convertirACsv,
    descargarCsv
} from "../../services/reporteService";

import { obtenerEspecies } from "../../services/especieService";
import { obtenerDepartamentos } from "../../services/territorioService";

import "../../styles/reportes.css";

function Reportes() {

    const anioActual = new Date().getFullYear();

    const [datos, setDatos] = useState(null);
    const [indicadores, setIndicadores] = useState(null);

    const [especies, setEspecies] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);

    const [anio, setAnio] = useState(anioActual);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargar = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const sistema = await obtenerDatosDelSistema();

            setDatos(sistema);
            setIndicadores(calcularIndicadores(sistema));

            setEspecies(await obtenerEspecies());
            setDepartamentos(await obtenerDepartamentos());

        } catch (error) {

            console.error(
                "Error al generar los reportes:",
                error
            );

            setError(
                "No se pudieron generar los reportes. " +
                "Verifica tu conexión e inténtalo de nuevo."
            );

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargar();

    }, [cargar]);


    function nombreEspecie(especieId) {

        for (const especie of especies) {

            if (especie.id === especieId) {
                return especie.nombre;
            }
        }

        return "Sin especie";
    }


    // Dibuja una barra horizontal proporcional al mayor valor del grupo.
    // No se usa ninguna librería de gráficos: con CSS alcanza y el
    // proyecto no suma una dependencia más por esto.
    function barras(conteo, traducirClave) {

        const claves = Object.keys(conteo);

        if (claves.length === 0) {

            return (
                <p className="reportes-vacio">
                    Todavía no hay datos registrados.
                </p>
            );
        }

        let mayor = 0;

        for (const clave of claves) {

            if (conteo[clave] > mayor) {
                mayor = conteo[clave];
            }
        }

        claves.sort((a, b) => conteo[b] - conteo[a]);

        return (
            <div className="reportes-barras">

                {claves.map((clave) => (

                    <div
                        key={clave}
                        className="reportes-barra-fila"
                    >

                        <span className="reportes-barra-etiqueta">
                            {traducirClave
                                ? traducirClave(clave)
                                : clave}
                        </span>

                        <div className="reportes-barra-pista">

                            <div
                                className="reportes-barra-valor"
                                style={{
                                    width:
                                        (conteo[clave] / mayor) * 100 + "%"
                                }}
                            ></div>

                        </div>

                        <strong className="reportes-barra-numero">
                            {conteo[clave]}
                        </strong>

                    </div>
                ))}

            </div>
        );
    }


    function exportarMascotas() {

        const filas = [];

        for (const mascota of datos.mascotas) {

            if (mascota.activo === false) {
                continue;
            }

            filas.push([
                mascota.nombre,
                nombreEspecie(mascota.especieId),
                mascota.sexo,
                mascota.tamano,
                mascota.edadAproximada,
                mascota.edadCategoria,
                mascota.estadoAdopcion
            ]);
        }

        descargarCsv(
            "red-huella-mascotas.csv",
            convertirACsv(
                [
                    "Nombre",
                    "Especie",
                    "Sexo",
                    "Tamaño",
                    "Edad",
                    "Categoría",
                    "Estado"
                ],
                filas
            )
        );
    }


    function nombreMascota(mascotaId) {

        for (const mascota of datos.mascotas) {

            if (mascota.id === mascotaId) {
                return mascota.nombre;
            }
        }

        return "Registro no encontrado";
    }


    function nombreRefugio(albergueId) {

        for (const albergue of datos.albergues) {

            if (albergue.id === albergueId) {
                return albergue.nombreRefugio;
            }
        }

        return "Refugio no encontrado";
    }


    function exportarAdopciones() {

        const filas = [];

        for (const solicitud of datos.solicitudes) {

            if (solicitud.estado !== "Concretada") {
                continue;
            }

            const fecha = solicitud.fechaAdopcion?.seconds
                ? new Date(
                    solicitud.fechaAdopcion.seconds * 1000
                ).toLocaleDateString("es-BO")
                : "Sin fecha";

            filas.push([
                fecha,
                nombreMascota(solicitud.mascotaId),
                nombreRefugio(solicitud.albergueId),
                solicitud.datosSolicitante?.nombreCompleto || "",
                solicitud.datosSolicitante?.telefono || ""
            ]);
        }

        descargarCsv(
            "red-huella-adopciones.csv",
            convertirACsv(
                [
                    "Fecha",
                    "Mascota",
                    "Refugio",
                    "Adoptante",
                    "Teléfono"
                ],
                filas
            )
        );
    }


    function exportarCobertura() {

        const filas = coberturaPorDepartamento(
            departamentos,
            datos.albergues,
            datos.mascotas
        ).map((fila) => [
            fila.departamento,
            fila.albergues,
            fila.mascotas
        ]);

        descargarCsv(
            "red-huella-cobertura.csv",
            convertirACsv(
                [
                    "Departamento",
                    "Albergues verificados",
                    "Mascotas publicadas"
                ],
                filas
            )
        );
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Generando los reportes...
                </p>

            </main>
        );
    }


    if (error !== "" || datos === null) {

        return (
            <main className="reportes-page">

                <div className="reportes-container">

                    <div className="reportes-error">
                        {error || "No hay datos disponibles."}
                    </div>

                </div>

            </main>
        );
    }


    const serieAdopciones = adopcionesPorMes(
        datos.solicitudes,
        anio
    );

    const cobertura = coberturaPorDepartamento(
        departamentos,
        datos.albergues,
        datos.mascotas
    );

    let mayorMes = 0;

    for (const punto of serieAdopciones) {

        if (punto.cantidad > mayorMes) {
            mayorMes = punto.cantidad;
        }
    }

    const totalAnio = serieAdopciones.reduce(
        (acumulado, punto) => acumulado + punto.cantidad,
        0
    );

    const anios = [];

    for (let valor = anioActual; valor >= anioActual - 3; valor = valor - 1) {
        anios.push(valor);
    }


    return (
        <main className="reportes-page">

            <div className="reportes-container">

                <header className="reportes-header">

                    <div>

                        <span className="reportes-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Reportes del sistema
                        </h1>

                        <p>
                            Indicadores de gestión de la plataforma.
                            Cada tabla puede descargarse en CSV para
                            adjuntarla a un informe.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="reportes-actualizar"
                        onClick={cargar}
                    >
                        Actualizar datos
                    </button>

                </header>


                {/* ===== Resumen ===== */}

                <section className="reportes-resumen">

                    <article className="reportes-kpi">

                        <span>
                            ADOPCIONES CONCRETADAS
                        </span>

                        <strong>
                            {indicadores.adopcionesConcretadas}
                        </strong>

                        <p>
                            Mascotas que ya están en un hogar.
                        </p>

                    </article>

                    <article className="reportes-kpi">

                        <span>
                            TASA DE APROBACIÓN
                        </span>

                        <strong>
                            {indicadores.tasaAprobacion}%
                        </strong>

                        <p>
                            Sobre las solicitudes ya evaluadas.
                        </p>

                    </article>

                    <article className="reportes-kpi">

                        <span>
                            MASCOTAS PUBLICADAS
                        </span>

                        <strong>
                            {indicadores.mascotasTotal}
                        </strong>

                        <p>
                            Registros activos en el catálogo.
                        </p>

                    </article>

                    <article className="reportes-kpi">

                        <span>
                            REFUGIOS VERIFICADOS
                        </span>

                        <strong>
                            {indicadores.alberguesVerificados}
                        </strong>

                        <p>
                            De {indicadores.alberguesTotal} registrados.
                        </p>

                    </article>

                </section>


                {/* ===== Adopciones por mes ===== */}

                <section className="reportes-bloque">

                    <div className="reportes-bloque-header">

                        <div>

                            <h2>
                                Adopciones concretadas por mes
                            </h2>

                            <p>
                                {totalAnio} adopciones registradas
                                en {anio}.
                            </p>

                        </div>

                        <div className="reportes-bloque-acciones">

                            <select
                                value={anio}
                                onChange={(evento) =>
                                    setAnio(Number(evento.target.value))
                                }
                            >
                                {anios.map((valor) => (

                                    <option
                                        key={valor}
                                        value={valor}
                                    >
                                        {valor}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={exportarAdopciones}
                            >
                                Descargar CSV
                            </button>

                        </div>

                    </div>

                    <div className="reportes-columnas">

                        {serieAdopciones.map((punto) => (

                            <div
                                key={punto.mes}
                                className="reportes-columna"
                            >

                                <span className="reportes-columna-numero">
                                    {punto.cantidad}
                                </span>

                                <div
                                    className="reportes-columna-barra"
                                    style={{
                                        height:
                                            mayorMes === 0
                                                ? "2px"
                                                : (punto.cantidad / mayorMes) *
                                                  140 + 2 + "px"
                                    }}
                                ></div>

                                <span className="reportes-columna-mes">
                                    {punto.mes.substring(0, 3)}
                                </span>

                            </div>
                        ))}

                    </div>

                </section>


                {/* ===== Catálogo ===== */}

                <section className="reportes-grid">

                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Mascotas por estado
                                </h2>
                            </div>

                            <div className="reportes-bloque-acciones">

                                <button
                                    type="button"
                                    onClick={exportarMascotas}
                                >
                                    Descargar CSV
                                </button>

                            </div>

                        </div>

                        {barras(indicadores.mascotasPorEstado)}

                    </article>


                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Mascotas por especie
                                </h2>
                            </div>

                        </div>

                        {barras(
                            indicadores.mascotasPorEspecie,
                            nombreEspecie
                        )}

                    </article>


                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Solicitudes por estado
                                </h2>
                            </div>

                        </div>

                        {barras(indicadores.solicitudesPorEstado)}

                    </article>


                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Usuarios por rol
                                </h2>
                            </div>

                        </div>

                        {barras(indicadores.usuariosPorRol)}

                    </article>

                </section>


                {/* ===== Cobertura territorial ===== */}

                <section className="reportes-bloque">

                    <div className="reportes-bloque-header">

                        <div>

                            <h2>
                                Cobertura territorial
                            </h2>

                            <p>
                                Presencia de la plataforma en los nueve
                                departamentos del país.
                            </p>

                        </div>

                        <div className="reportes-bloque-acciones">

                            <button
                                type="button"
                                onClick={exportarCobertura}
                            >
                                Descargar CSV
                            </button>

                        </div>

                    </div>

                    <table className="reportes-tabla">

                        <thead>

                            <tr>
                                <th>
                                    Departamento
                                </th>

                                <th>
                                    Refugios verificados
                                </th>

                                <th>
                                    Mascotas publicadas
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {cobertura.map((fila) => (

                                <tr key={fila.departamento}>

                                    <td>
                                        {fila.departamento}
                                    </td>

                                    <td>
                                        {fila.albergues}
                                    </td>

                                    <td>
                                        {fila.mascotas}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                    {cobertura.length === 0 && (
                        <p className="reportes-vacio">
                            Carga primero los catálogos base desde el
                            panel administrativo.
                        </p>
                    )}

                </section>


                {/* ===== Directorio y comunidad ===== */}

                <section className="reportes-grid">

                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Establecimientos por categoría
                                </h2>

                                <p>
                                    {indicadores.serviciosVerificados} verificados
                                    de {indicadores.serviciosTotal} registrados.
                                </p>
                            </div>

                        </div>

                        {barras(indicadores.serviciosPorCategoria)}

                    </article>


                    <article className="reportes-bloque">

                        <div className="reportes-bloque-header">

                            <div>
                                <h2>
                                    Mascotas perdidas
                                </h2>
                            </div>

                        </div>

                        {barras({
                            Activas: indicadores.alertasActivas,
                            Resueltas: indicadores.alertasResueltas
                        })}

                    </article>

                </section>


                <p className="reportes-pie">
                    Reporte generado el{" "}
                    {new Date().toLocaleDateString("es-BO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    })}
                    {" · "}
                    Los meses del gráfico corresponden a la fecha en que
                    cada adopción se registró como concretada.
                </p>

            </div>

        </main>
    );
}

export default Reportes;
