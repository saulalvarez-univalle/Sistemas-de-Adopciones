import { useEffect, useState, useCallback } from "react";

import {
    obtenerDenunciasPendientes,
    obtenerDenunciasResueltas,
    resolverDenuncia
} from "../../services/denunciaService";

import {
    obtenerPerfil,
    suspenderCuenta,
    reactivarCuenta
} from "../../services/userService";

import "../../styles/notificaciones.css";

function Moderacion() {

    const [pendientes, setPendientes] = useState([]);
    const [resueltas, setResueltas] = useState([]);

    const [autores, setAutores] = useState({});

    const [resoluciones, setResoluciones] = useState({});

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargar = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const listaPendientes = await obtenerDenunciasPendientes();

            setPendientes(listaPendientes);
            setResueltas(await obtenerDenunciasResueltas());

            const mapa = {};

            for (const denuncia of listaPendientes) {

                if (
                    denuncia.contenidoUserId &&
                    !mapa[denuncia.contenidoUserId]
                ) {

                    try {

                        mapa[denuncia.contenidoUserId] =
                            await obtenerPerfil(denuncia.contenidoUserId);

                    } catch (error) {

                        console.error(
                            "No se pudo leer el perfil del autor:",
                            error
                        );
                    }
                }
            }

            setAutores(mapa);

        } catch (error) {

            console.error(
                "Error al cargar la moderación:",
                error
            );

            setError("No se pudieron cargar las denuncias.");

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargar();

    }, [cargar]);


    function cambiarResolucion(id, valor) {

        setResoluciones({
            ...resoluciones,
            [id]: valor
        });

        setError("");
    }


    function formatearFecha(fecha) {

        if (!fecha || !fecha.seconds) {
            return "Sin fecha";
        }

        return new Date(fecha.seconds * 1000).toLocaleDateString(
            "es-BO",
            { day: "2-digit", month: "long", year: "numeric" }
        );
    }


    async function decidir(denuncia, estado) {

        setError("");
        setMensaje("");

        try {

            await resolverDenuncia(
                denuncia.id,
                estado,
                resoluciones[denuncia.id] || ""
            );

            setMensaje(
                estado === "Resuelta"
                    ? "Denuncia marcada como atendida. Se notificó a quien la reportó."
                    : "Denuncia desestimada. Se notificó a quien la reportó."
            );

            await cargar();

        } catch (error) {

            console.error(
                "Error al resolver la denuncia:",
                error
            );

            setError(
                error.message ||
                "No se pudo registrar la decisión."
            );
        }
    }


    async function cambiarEstadoCuenta(denuncia, suspender) {

        setError("");
        setMensaje("");

        if (!denuncia.contenidoUserId) {

            setError(
                "Esta denuncia no tiene registrado el autor del contenido."
            );

            return;
        }

        try {

            if (suspender) {

                await suspenderCuenta(denuncia.contenidoUserId);

                setMensaje(
                    "Cuenta suspendida. El usuario ya no puede iniciar sesión."
                );

            } else {

                await reactivarCuenta(denuncia.contenidoUserId);

                setMensaje("Cuenta reactivada.");
            }

            await cargar();

        } catch (error) {

            console.error(
                "Error al cambiar el estado de la cuenta:",
                error
            );

            setError("No se pudo cambiar el estado de la cuenta.");
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando la bandeja de moderación...
                </p>

            </main>
        );
    }


    return (
        <main className="notif-page">

            <div className="notif-container notif-container-ancho">

                <header className="notif-header">

                    <div>

                        <span className="notif-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Moderación de contenido
                        </h1>

                        <p>
                            Revisa los reportes de la comunidad. Cada decisión
                            exige registrar su fundamento, y quien reportó
                            recibe la respuesta.
                        </p>

                    </div>

                    <div className="notif-counter">

                        <strong>
                            {pendientes.length}
                        </strong>

                        <span>
                            pendientes
                        </span>

                    </div>

                </header>


                {mensaje !== "" && (
                    <div className="notif-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && (
                    <div className="notif-error">
                        {error}
                    </div>
                )}


                {pendientes.length === 0 && (

                    <div className="notif-empty">

                        <span className="notif-empty-number">
                            00
                        </span>

                        <strong>
                            No hay reportes pendientes
                        </strong>

                        <p>
                            Cuando alguien reporte una publicación, aparecerá
                            aquí para su revisión.
                        </p>

                    </div>
                )}


                {pendientes.map((denuncia) => (

                    <article
                        key={denuncia.id}
                        className="moderacion-card"
                    >

                        <div className="moderacion-header">

                            <div>

                                <span className="moderacion-tipo">
                                    {denuncia.tipoContenido}
                                </span>

                                <h2>
                                    {denuncia.contenidoTitulo ||
                                        "Contenido reportado"}
                                </h2>

                            </div>

                            <span className="moderacion-fecha">
                                {formatearFecha(denuncia.fechaDenuncia)}
                            </span>

                        </div>

                        <div className="moderacion-motivo">

                            <strong>
                                {denuncia.motivo}
                            </strong>

                            <p>
                                {denuncia.observaciones}
                            </p>

                        </div>

                        {denuncia.contenidoUserId &&
                            autores[denuncia.contenidoUserId] && (

                            <div className="moderacion-autor">

                                <div>
                                    <span>Autor del contenido</span>
                                    <strong>
                                        {autores[denuncia.contenidoUserId]
                                            .nombreCompleto}
                                        {" · "}
                                        {autores[denuncia.contenidoUserId].rol}
                                    </strong>
                                </div>

                                <div>
                                    <span>Estado de la cuenta</span>
                                    <strong
                                        className={
                                            autores[denuncia.contenidoUserId]
                                                .estadoCuenta === "Activo"
                                                ? "moderacion-activo"
                                                : "moderacion-suspendido"
                                        }
                                    >
                                        {autores[denuncia.contenidoUserId]
                                            .estadoCuenta}
                                    </strong>
                                </div>

                                {autores[denuncia.contenidoUserId]
                                    .estadoCuenta === "Activo" ? (

                                    <button
                                        type="button"
                                        className="moderacion-suspender"
                                        onClick={() =>
                                            cambiarEstadoCuenta(denuncia, true)
                                        }
                                    >
                                        Suspender cuenta
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className="moderacion-reactivar"
                                        onClick={() =>
                                            cambiarEstadoCuenta(denuncia, false)
                                        }
                                    >
                                        Reactivar cuenta
                                    </button>
                                )}

                            </div>
                        )}

                        <div className="moderacion-footer">

                            <label htmlFor={"resolucion-" + denuncia.id}>
                                Resolución
                                <span> (obligatoria, se envía a quien reportó)</span>
                            </label>

                            <textarea
                                id={"resolucion-" + denuncia.id}
                                rows="3"
                                value={resoluciones[denuncia.id] || ""}
                                onChange={(evento) =>
                                    cambiarResolucion(
                                        denuncia.id,
                                        evento.target.value
                                    )
                                }
                                maxLength="400"
                                placeholder="Explica qué se verificó y qué medida se tomó."
                            />

                            <div className="moderacion-actions">

                                <button
                                    type="button"
                                    className="moderacion-resolver"
                                    onClick={() =>
                                        decidir(denuncia, "Resuelta")
                                    }
                                >
                                    Marcar como atendida
                                </button>

                                <button
                                    type="button"
                                    className="moderacion-desestimar"
                                    onClick={() =>
                                        decidir(denuncia, "Desestimada")
                                    }
                                >
                                    Desestimar
                                </button>

                            </div>

                        </div>

                    </article>

                ))}


                {resueltas.length > 0 && (

                    <section className="moderacion-historial">

                        <h2>
                            Reportes ya revisados
                        </h2>

                        {resueltas.map((denuncia) => (

                            <article
                                key={denuncia.id}
                                className="moderacion-card moderacion-card-cerrada"
                            >

                                <div className="moderacion-header">

                                    <div>

                                        <span className="moderacion-tipo">
                                            {denuncia.tipoContenido}
                                        </span>

                                        <h2>
                                            {denuncia.contenidoTitulo ||
                                                "Contenido reportado"}
                                        </h2>

                                    </div>

                                    <span
                                        className={
                                            denuncia.estadoDenuncia === "Resuelta"
                                                ? "moderacion-estado moderacion-estado-resuelta"
                                                : "moderacion-estado moderacion-estado-desestimada"
                                        }
                                    >
                                        {denuncia.estadoDenuncia}
                                    </span>

                                </div>

                                <div className="moderacion-motivo">

                                    <strong>
                                        {denuncia.motivo}
                                    </strong>

                                    <p>
                                        {denuncia.resolucion}
                                    </p>

                                </div>

                            </article>

                        ))}

                    </section>
                )}

            </div>

        </main>
    );
}

export default Moderacion;
