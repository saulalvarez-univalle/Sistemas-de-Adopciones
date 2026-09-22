import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
    obtenerAlberguesPendientes,
    actualizarEstadoAlbergue
} from "../services/albergueService";

function GestionAlbergues() {

    const { perfil } = useAuth();

    const [albergues, setAlbergues] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [motivos, setMotivos] = useState({});
    const [errores, setErrores] = useState({});
    const [mensajes, setMensajes] = useState({});

    async function cargarAlbergues() {

        try {

            const resultado =
                await obtenerAlberguesPendientes();

            setAlbergues(resultado);

        } catch (error) {

            console.error(
                "ERROR AL CARGAR ALBERGUES:",
                error
            );

        } finally {

            setCargando(false);
        }
    }

    useEffect(() => {

        cargarAlbergues();

    }, []);

    function cambiarMotivo(id, valor) {

        setMotivos({
            ...motivos,
            [id]: valor
        });

        setErrores({
            ...errores,
            [id]: ""
        });
    }

    async function aprobar(id) {

        setErrores({
            ...errores,
            [id]: ""
        });

        setMensajes({
            ...mensajes,
            [id]: ""
        });

        try {

            await actualizarEstadoAlbergue(
                id,
                "Aprobado",
                ""
            );

            setMensajes({
                ...mensajes,
                [id]: "Albergue aprobado correctamente."
            });

            setAlbergues(
                albergues.filter(
                    (albergue) => albergue.id !== id
                )
            );

        } catch (error) {

            console.error(
                "ERROR AL APROBAR ALBERGUE:",
                error
            );

            setMensajes({
                ...mensajes,
                [id]:
                    "No se pudo aprobar el albergue."
            });
        }
    }

    async function rechazar(id) {

        const motivo = motivos[id]
            ? motivos[id].trim()
            : "";

        if (motivo === "") {

            setErrores({
                ...errores,
                [id]:
                    "Debes indicar el motivo del rechazo."
            });

            return;
        }

        if (motivo.length < 10) {

            setErrores({
                ...errores,
                [id]:
                    "El motivo debe tener al menos 10 caracteres."
            });

            return;
        }

        if (motivo.length > 300) {

            setErrores({
                ...errores,
                [id]:
                    "El motivo no puede superar los 300 caracteres."
            });

            return;
        }

        setErrores({
            ...errores,
            [id]: ""
        });

        setMensajes({
            ...mensajes,
            [id]: ""
        });

        try {

            await actualizarEstadoAlbergue(
                id,
                "Rechazado",
                motivo
            );

            setMensajes({
                ...mensajes,
                [id]: "Albergue rechazado correctamente."
            });

            setAlbergues(
                albergues.filter(
                    (albergue) => albergue.id !== id
                )
            );

        } catch (error) {

            console.error(
                "ERROR AL RECHAZAR ALBERGUE:",
                error
            );

            setMensajes({
                ...mensajes,
                [id]:
                    "No se pudo rechazar el albergue."
            });
        }
    }

    if (cargando) {

        return (
            <p>
                Cargando solicitudes de albergues...
            </p>
        );
    }

    if (
        perfil &&
        perfil.rol !== "Admin" &&
        perfil.rol !== "Superusuario"
    ) {

        return (
            <div>

                <h1>
                    Acceso no permitido
                </h1>

                <p>
                    Solo un administrador puede verificar
                    los albergues.
                </p>

            </div>
        );
    }

    return (
        <div>

            <h1>
                Gestión de albergues
            </h1>

            <p>
                Revisa las solicitudes de registro de
                albergues y refugios.
            </p>

            {albergues.length === 0 ? (

                <p>
                    No hay solicitudes pendientes de verificación.
                </p>

            ) : (

                albergues.map((albergue) => (

                    <div
                        key={albergue.id}
                    >

                        <h2>
                            {albergue.nombreRefugio}
                        </h2>

                        <p>
                            <strong>
                                Descripción:
                            </strong>{" "}
                            {albergue.descripcion}
                        </p>

                        <p>
                            <strong>
                                Dirección:
                            </strong>{" "}
                            {albergue.direccion}
                        </p>

                        <p>
                            <strong>
                                Teléfono:
                            </strong>{" "}
                            {albergue.telefonoContacto}
                        </p>

                        <p>
                            <strong>
                                Horarios:
                            </strong>{" "}
                            {albergue.horariosAtencion}
                        </p>

                        <p>
                            <strong>
                                Latitud:
                            </strong>{" "}
                            {albergue.latitud}
                        </p>

                        <p>
                            <strong>
                                Longitud:
                            </strong>{" "}
                            {albergue.longitud}
                        </p>

                        <p>
                            <strong>
                                Estado:
                            </strong>{" "}
                            {albergue.estadoVerificacion}
                        </p>

                        <div>

                            <button
                                type="button"
                                onClick={() =>
                                    aprobar(albergue.id)
                                }
                            >
                                Aprobar
                            </button>

                        </div>

                        <div>

                            <label>
                                Motivo del rechazo
                            </label>

                            <textarea
                                value={
                                    motivos[albergue.id] || ""
                                }
                                onChange={(evento) =>
                                    cambiarMotivo(
                                        albergue.id,
                                        evento.target.value
                                    )
                                }
                            />

                            {errores[albergue.id] && (
                                <p>
                                    {errores[albergue.id]}
                                </p>
                            )}

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                rechazar(albergue.id)
                            }
                        >
                            Rechazar
                        </button>

                        {mensajes[albergue.id] && (
                            <p>
                                {mensajes[albergue.id]}
                            </p>
                        )}

                        <hr />

                    </div>

                ))
            )}

        </div>
    );
}

export default GestionAlbergues;