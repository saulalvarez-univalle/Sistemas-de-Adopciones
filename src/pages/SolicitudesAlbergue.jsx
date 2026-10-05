import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenerAlberguePorUsuario } from "../services/albergueService";

import {
    obtenerSolicitudesPorAlbergue,
    evaluarSolicitud
} from "../services/solicitudService";

import { obtenerMascota } from "../services/mascotaService";

import "../styles/solicitudes.css";

function SolicitudesAlbergue() {

    const { usuarioFirebase } = useAuth();

    const [albergue, setAlbergue] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);

    const [observaciones, setObservaciones] = useState({});
    const [expandida, setExpandida] = useState("");

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargarSolicitudes = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            const datosAlbergue =
                await obtenerAlberguePorUsuario(
                    usuarioFirebase.uid
                );

            setAlbergue(datosAlbergue);

            if (!datosAlbergue) {
                return;
            }

            const lista = await obtenerSolicitudesPorAlbergue(
                datosAlbergue.id
            );

            const conMascota = [];

            for (const solicitud of lista) {

                const mascota = await obtenerMascota(
                    solicitud.mascotaId
                );

                conMascota.push({
                    ...solicitud,
                    mascota: mascota
                });
            }

            setSolicitudes(conMascota);

        } catch (error) {

            console.error(
                "Error al cargar las solicitudes:",
                error
            );

            setError("No se pudieron cargar las solicitudes.");

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargarSolicitudes();

    }, [cargarSolicitudes]);


    function cambiarObservacion(id, valor) {

        setObservaciones({
            ...observaciones,
            [id]: valor
        });

        setError("");
    }


    function formatearFecha(fecha) {

        if (!fecha || !fecha.seconds) {
            return "Sin fecha";
        }

        const momento = new Date(fecha.seconds * 1000);

        return momento.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }


    async function evaluar(solicitud, estado) {

        setError("");
        setMensaje("");

        const nota = observaciones[solicitud.id] || "";

        try {

            await evaluarSolicitud(
                solicitud.id,
                estado,
                nota
            );

            setMensaje(
                estado === "Aprobada"
                    ? "La solicitud fue aprobada. La mascota pasó a En proceso."
                    : "La solicitud fue rechazada con el motivo registrado."
            );

            await cargarSolicitudes();

        } catch (error) {

            console.error(
                "Error al evaluar la solicitud:",
                error
            );

            setError(
                error.message ||
                "No se pudo registrar la evaluación."
            );
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando solicitudes...
                </p>

            </main>
        );
    }


    if (!albergue) {

        return (
            <main className="solicitud-page">

                <div className="solicitud-container">

                    <div className="solicitud-empty">

                        <span className="solicitud-empty-number">
                            !
                        </span>

                        <strong>
                            Todavía no registraste tu albergue
                        </strong>

                        <p>
                            Necesitas un refugio registrado y verificado
                            para recibir solicitudes de adopción.
                        </p>

                        <Link
                            to="/albergue"
                            className="solicitud-volver"
                        >
                            Registrar mi albergue
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    const pendientes = solicitudes.filter(
        (solicitud) => solicitud.estado === "Pendiente"
    );

    const historial = solicitudes.filter(
        (solicitud) => solicitud.estado !== "Pendiente"
    );


    return (
        <main className="solicitud-page">

            <div className="solicitud-container">

                <header className="solicitud-header">

                    <span className="solicitud-label">
                        RED HUELLA / EVALUACIÓN DE SOLICITUDES
                    </span>

                    <h1>
                        Solicitudes recibidas
                    </h1>

                    <p>
                        Revisa la información de cada solicitante antes
                        de aprobar o rechazar una adopción. El rechazo
                        exige registrar un motivo.
                    </p>

                </header>


                {mensaje !== "" && (
                    <div className="solicitud-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && (
                    <div className="solicitud-error">
                        <span>
                            {error}
                        </span>
                    </div>
                )}


                <div className="solicitud-counter">

                    <div>
                        <strong>
                            {pendientes.length}
                        </strong>

                        <span>
                            pendientes de revisión
                        </span>
                    </div>

                    <div>
                        <strong>
                            {historial.length}
                        </strong>

                        <span>
                            ya evaluadas
                        </span>
                    </div>

                </div>


                {pendientes.length === 0 && (

                    <div className="solicitud-empty">

                        <span className="solicitud-empty-number">
                            00
                        </span>

                        <strong>
                            No hay solicitudes pendientes
                        </strong>

                        <p>
                            Cuando alguien se interese por una de tus
                            mascotas, su solicitud aparecerá aquí.
                        </p>

                    </div>
                )}


                {pendientes.length > 0 && (

                    <div className="solicitud-list">

                        {pendientes.map((solicitud) => (

                            <article
                                key={solicitud.id}
                                className="solicitud-review"
                            >

                                <div className="solicitud-review-header">

                                    <div>

                                        <h3>
                                            {solicitud.datosSolicitante
                                                ?.nombreCompleto ||
                                                "Solicitante"}
                                        </h3>

                                        <p>
                                            Solicita a{" "}
                                            <strong>
                                                {solicitud.mascota
                                                    ? solicitud.mascota.nombre
                                                    : "una mascota"}
                                            </strong>
                                            {" "}· {formatearFecha(
                                                solicitud.fechaSolicitud
                                            )}
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="solicitud-toggle"
                                        onClick={() =>
                                            setExpandida(
                                                expandida === solicitud.id
                                                    ? ""
                                                    : solicitud.id
                                            )
                                        }
                                    >
                                        {expandida === solicitud.id
                                            ? "Ocultar datos"
                                            : "Ver datos del solicitante"}
                                    </button>

                                </div>


                                {expandida === solicitud.id && (

                                    <div className="solicitud-datos">

                                        <div>
                                            <span>Teléfono</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.telefono}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Correo</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.email}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Vivienda</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.tipoVivienda}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Espacio exterior</span>
                                            <strong>
                                                {solicitud.datosSolicitante
                                                    ?.tieneEspacioExterior}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Otras mascotas</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.otrasMascotas}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Personas en el hogar</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.personasEnCasa}
                                            </strong>
                                        </div>

                                        <div className="solicitud-datos-full">
                                            <span>Experiencia</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.experiencia}
                                            </strong>
                                        </div>

                                        <div className="solicitud-datos-full">
                                            <span>Motivación</span>
                                            <strong>
                                                {solicitud.datosSolicitante?.motivacion}
                                            </strong>
                                        </div>

                                    </div>
                                )}


                                <div className="solicitud-review-footer">

                                    <label
                                        htmlFor={"nota-" + solicitud.id}
                                    >
                                        Observaciones
                                        <span> (obligatorio si rechazas)</span>
                                    </label>

                                    <textarea
                                        id={"nota-" + solicitud.id}
                                        rows="3"
                                        value={observaciones[solicitud.id] || ""}
                                        onChange={(evento) =>
                                            cambiarObservacion(
                                                solicitud.id,
                                                evento.target.value
                                            )
                                        }
                                        maxLength="400"
                                        placeholder="Explica tu decisión al solicitante."
                                    />

                                    <div className="solicitud-review-actions">

                                        <button
                                            type="button"
                                            className="solicitud-aprobar"
                                            onClick={() =>
                                                evaluar(solicitud, "Aprobada")
                                            }
                                        >
                                            Aprobar solicitud
                                        </button>

                                        <button
                                            type="button"
                                            className="solicitud-rechazar"
                                            onClick={() =>
                                                evaluar(solicitud, "Rechazada")
                                            }
                                        >
                                            Rechazar
                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>
                )}


                {historial.length > 0 && (

                    <section className="solicitud-historial">

                        <h2>
                            Solicitudes ya evaluadas
                        </h2>

                        <div className="solicitud-list">

                            {historial.map((solicitud) => (

                                <article
                                    key={solicitud.id}
                                    className="solicitud-card"
                                >

                                    <div className="solicitud-card-body">

                                        <div className="solicitud-card-header">

                                            <h3>
                                                {solicitud.datosSolicitante
                                                    ?.nombreCompleto ||
                                                    "Solicitante"}
                                            </h3>

                                            <span
                                                className={
                                                    "solicitud-estado solicitud-estado-" +
                                                    solicitud.estado.toLowerCase()
                                                }
                                            >
                                                {solicitud.estado}
                                            </span>

                                        </div>

                                        <p className="solicitud-card-fecha">
                                            {solicitud.mascota
                                                ? solicitud.mascota.nombre
                                                : "Mascota"}
                                            {" "}· {formatearFecha(
                                                solicitud.fechaSolicitud
                                            )}
                                        </p>

                                        {solicitud.observacionesAlbergue !== "" && (

                                            <div className="solicitud-observacion">

                                                <strong>
                                                    Observación registrada
                                                </strong>

                                                <p>
                                                    {solicitud.observacionesAlbergue}
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                </article>

                            ))}

                        </div>

                    </section>
                )}

            </div>

        </main>
    );
}

export default SolicitudesAlbergue;
