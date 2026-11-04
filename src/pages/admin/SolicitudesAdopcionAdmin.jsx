import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    evaluarSolicitud,
    obtenerSolicitudesAdmin
} from "../../services/solicitudService";
import { obtenerMascota } from "../../services/mascotaService";

import "../../styles/admin-solicitudes.css";

function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    const date = typeof fecha.toDate === "function"
        ? fecha.toDate()
        : fecha instanceof Date
            ? fecha
            : fecha.seconds
                ? new Date(fecha.seconds * 1000)
                : null;
    if (!date || Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function SolicitudesAdopcionAdmin() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [observaciones, setObservaciones] = useState({});
    const [expandida, setExpandida] = useState("");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarSolicitudes = useCallback(async () => {
        setCargando(true);
        setError("");
        try {
            const lista = await obtenerSolicitudesAdmin();
            const completas = await Promise.all(lista.map(async (solicitud) => {
                let mascota = null;
                try {
                    mascota = await obtenerMascota(solicitud.mascotaId);
                } catch (errorCarga) {
                    console.error("No se pudo cargar la mascota de una solicitud:", errorCarga);
                }
                return { ...solicitud, mascota };
            }));
            completas.sort((a, b) => {
                const fechaA = a.fechaSolicitud?.seconds || 0;
                const fechaB = b.fechaSolicitud?.seconds || 0;
                return fechaB - fechaA;
            });
            setSolicitudes(completas);
        } catch (errorCarga) {
            console.error("Error al cargar solicitudes de adopción:", errorCarga);
            setError("No se pudieron cargar las solicitudes. Revisa tu conexión y los permisos de Firebase.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    const pendientes = useMemo(
        () => solicitudes.filter((solicitud) => solicitud.estado === "Pendiente"),
        [solicitudes]
    );
    const revisadas = useMemo(
        () => solicitudes.filter((solicitud) => solicitud.estado !== "Pendiente"),
        [solicitudes]
    );

    function cambiarObservacion(id, valor) {
        setObservaciones((actuales) => ({ ...actuales, [id]: valor }));
        setError("");
    }

    async function evaluar(solicitud, estado) {
        setError("");
        setMensaje("");
        const nota = (observaciones[solicitud.id] || "").trim();
        if (estado === "Rechazada" && !nota) {
            setError("Para rechazar una solicitud, escribe el motivo.");
            return;
        }
        setProcesando(solicitud.id);
        try {
            await evaluarSolicitud(solicitud.id, estado, nota);
            setMensaje(estado === "Aprobada"
                ? "Solicitud aprobada. La mascota pasó a estado En proceso y el adoptante podrá ver tu respuesta."
                : "Solicitud rechazada. El adoptante podrá consultar el motivo.");
            await cargarSolicitudes();
        } catch (errorEvaluacion) {
            console.error("Error al evaluar solicitud:", errorEvaluacion);
            setError(errorEvaluacion.message || "No se pudo guardar la evaluación.");
        } finally {
            setProcesando("");
        }
    }

    return (
        <main className="admin-solicitudes-page">
            <section className="admin-solicitudes-container">
                <Link to="/admin" className="admin-solicitudes-back">← Volver al panel</Link>
                <header className="admin-solicitudes-header">
                    <span>RED HUELLA / ADMINISTRACIÓN</span>
                    <h1>Solicitudes de adopción</h1>
                    <p>Revisa los datos de cada adoptante, aprueba la solicitud o registra un motivo de rechazo.</p>
                </header>

                {mensaje && <div className="admin-solicitudes-alert admin-solicitudes-success">{mensaje}</div>}
                {error && <div className="admin-solicitudes-alert admin-solicitudes-error">{error}</div>}

                <section className="admin-solicitudes-summary">
                    <article><strong>{pendientes.length}</strong><span>Pendientes de revisión</span></article>
                    <article><strong>{solicitudes.filter((item) => item.estado === "Aprobada").length}</strong><span>Aprobadas</span></article>
                    <article><strong>{revisadas.length}</strong><span>Con respuesta</span></article>
                </section>

                <div className="admin-solicitudes-section-title">
                    <div>
                        <span>REQUIEREN TU ATENCIÓN</span>
                        <h2>Por revisar</h2>
                    </div>
                    <button type="button" onClick={cargarSolicitudes} disabled={cargando}>
                        {cargando ? "Actualizando…" : "Actualizar"}
                    </button>
                </div>

                {cargando && <div className="admin-solicitudes-empty">Cargando solicitudes…</div>}
                {!cargando && pendientes.length === 0 && (
                    <div className="admin-solicitudes-empty">No tienes solicitudes pendientes de revisión.</div>
                )}

                <div className="admin-solicitudes-list">
                    {pendientes.map((solicitud) => {
                        const datos = solicitud.datosSolicitante || {};
                        const nombreMascota = solicitud.mascota?.nombre || "Mascota";
                        return (
                            <article className="admin-solicitud-card" key={solicitud.id}>
                                <div className="admin-solicitud-card-top">
                                    <div>
                                        <span className="admin-solicitud-kicker">SOLICITUD PENDIENTE · {formatearFecha(solicitud.fechaSolicitud)}</span>
                                        <h3>{datos.nombreCompleto || "Solicitante"}</h3>
                                        <p>Quiere adoptar a <strong>{nombreMascota}</strong></p>
                                    </div>
                                    <span className="admin-solicitud-status">Pendiente</span>
                                </div>

                                <button
                                    type="button"
                                    className="admin-solicitud-details-toggle"
                                    onClick={() => setExpandida(expandida === solicitud.id ? "" : solicitud.id)}
                                >
                                    {expandida === solicitud.id ? "Ocultar respuestas" : "Ver datos del adoptante"}
                                </button>

                                {expandida === solicitud.id && (
                                    <div className="admin-solicitud-details">
                                        <div><span>Correo</span><strong>{datos.email || "No registrado"}</strong></div>
                                        <div><span>Celular</span><strong>{datos.telefono || "No registrado"}</strong></div>
                                        <div><span>Vivienda</span><strong>{datos.tipoVivienda || "Sin respuesta"}</strong></div>
                                        <div><span>Espacio exterior</span><strong>{datos.tieneEspacioExterior || "Sin respuesta"}</strong></div>
                                        <div><span>Otras mascotas</span><strong>{datos.otrasMascotas || "Sin respuesta"}</strong></div>
                                        <div><span>Personas en casa</span><strong>{datos.personasEnCasa ?? "Sin respuesta"}</strong></div>
                                        <div><span>Experiencia</span><strong>{datos.experiencia || "Sin respuesta"}</strong></div>
                                        <div className="admin-solicitud-motivation"><span>Motivación</span><p>{datos.motivacion || "Sin respuesta"}</p></div>
                                    </div>
                                )}

                                <label className="admin-solicitud-note-label" htmlFor={`nota-${solicitud.id}`}>
                                    Observación para el adoptante (obligatoria si rechazas)
                                </label>
                                <textarea
                                    id={`nota-${solicitud.id}`}
                                    value={observaciones[solicitud.id] || ""}
                                    onChange={(event) => cambiarObservacion(solicitud.id, event.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Escribe una respuesta o el motivo del rechazo…"
                                />
                                <div className="admin-solicitud-actions">
                                    <button
                                        type="button"
                                        className="admin-solicitud-approve"
                                        disabled={procesando === solicitud.id}
                                        onClick={() => evaluar(solicitud, "Aprobada")}
                                    >
                                        {procesando === solicitud.id ? "Guardando…" : "Aceptar solicitud"}
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-solicitud-reject"
                                        disabled={procesando === solicitud.id}
                                        onClick={() => evaluar(solicitud, "Rechazada")}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {revisadas.length > 0 && (
                    <>
                        <div className="admin-solicitudes-section-title admin-solicitudes-history-title">
                            <div><span>HISTORIAL</span><h2>Solicitudes revisadas</h2></div>
                        </div>
                        <div className="admin-solicitudes-list">
                            {revisadas.map((solicitud) => (
                                <article className="admin-solicitud-history-card" key={solicitud.id}>
                                    <div>
                                        <strong>{solicitud.datosSolicitante?.nombreCompleto || "Solicitante"}</strong>
                                        <span> · {solicitud.mascota?.nombre || "Mascota"}</span>
                                        <small>{formatearFecha(solicitud.fechaSolicitud)}</small>
                                    </div>
                                    <span className={`admin-solicitud-status admin-solicitud-status-${(solicitud.estado || "").toLowerCase()}`}>
                                        {solicitud.estado}
                                    </span>
                                    {solicitud.observacionesAlbergue && <p>{solicitud.observacionesAlbergue}</p>}
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

export default SolicitudesAdopcionAdmin;
