import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    obtenerSolicitudesPorAdoptante,
    cancelarSolicitud
} from "../services/solicitudService";

import { obtenerMascota } from "../services/mascotaService";

import "../styles/solicitudes.css";

function MisSolicitudes() {

    const location = useLocation();

    const { usuarioFirebase } = useAuth();

    const [solicitudes, setSolicitudes] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState(
        location.state?.mensaje || ""
    );


    const cargarSolicitudes = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            const lista = await obtenerSolicitudesPorAdoptante(
                usuarioFirebase.uid
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

            setError("No se pudieron cargar tus solicitudes.");

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargarSolicitudes();

    }, [cargarSolicitudes]);


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


    async function manejarCancelar(solicitud) {

        setError("");
        setMensaje("");

        try {

            await cancelarSolicitud(solicitud.id);

            setMensaje("La solicitud fue cancelada.");

            await cargarSolicitudes();

        } catch (error) {

            console.error(
                "Error al cancelar la solicitud:",
                error
            );

            setError(
                error.message ||
                "No se pudo cancelar la solicitud."
            );
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando tus solicitudes...
                </p>

            </main>
        );
    }


    return (
        <main className="solicitud-page">

            <div className="solicitud-container">

                <header className="solicitud-header">

                    <span className="solicitud-label">
                        RED HUELLA / MIS SOLICITUDES
                    </span>

                    <h1>
                        Mis solicitudes de adopción
                    </h1>

                    <p>
                        Aquí puedes seguir el estado de cada solicitud
                        que enviaste y leer la respuesta del refugio.
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


                {solicitudes.length === 0 && (

                    <div className="solicitud-empty">

                        <span className="solicitud-empty-number">
                            00
                        </span>

                        <strong>
                            Todavía no enviaste ninguna solicitud
                        </strong>

                        <p>
                            Cuando encuentres una mascota que te
                            interese, puedes enviar tu solicitud
                            desde su ficha.
                        </p>

                        <Link
                            to="/mascotas"
                            className="solicitud-volver"
                        >
                            Ir al catálogo
                        </Link>

                    </div>
                )}


                {solicitudes.length > 0 && (

                    <div className="solicitud-list">

                        {solicitudes.map((solicitud) => (

                            <article
                                key={solicitud.id}
                                className="solicitud-card"
                            >

                                <div className="solicitud-card-image">

                                    <img
                                        src={
                                            solicitud.mascota &&
                                            solicitud.mascota.fotosUrls &&
                                            solicitud.mascota.fotosUrls.length > 0
                                                ? solicitud.mascota.fotosUrls[0]
                                                : "/imagenes/hero-mascota.png"
                                        }
                                        alt={
                                            solicitud.mascota
                                                ? solicitud.mascota.nombre
                                                : "Mascota"
                                        }
                                    />

                                </div>

                                <div className="solicitud-card-body">

                                    <div className="solicitud-card-header">

                                        <h3>
                                            {solicitud.mascota
                                                ? solicitud.mascota.nombre
                                                : "Mascota no disponible"}
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
                                        Enviada el {formatearFecha(
                                            solicitud.fechaSolicitud
                                        )}
                                    </p>

                                    {solicitud.observacionesAlbergue !== "" && (

                                        <div className="solicitud-observacion">

                                            <strong>
                                                Respuesta del refugio
                                            </strong>

                                            <p>
                                                {solicitud.observacionesAlbergue}
                                            </p>

                                        </div>
                                    )}

                                    <div className="solicitud-card-actions">

                                        {solicitud.mascota && (
                                            <Link
                                                to={"/mascotas/" + solicitud.mascotaId}
                                            >
                                                Ver ficha de la mascota →
                                            </Link>
                                        )}

                                        {solicitud.estado === "Pendiente" && (
                                            <button
                                                type="button"
                                                className="solicitud-cancelar"
                                                onClick={() =>
                                                    manejarCancelar(solicitud)
                                                }
                                            >
                                                Cancelar solicitud
                                            </button>
                                        )}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}

export default MisSolicitudes;
