import { useEffect, useState, useCallback } from "react";

import { useAuth } from "../../context/AuthContext";

import {
    obtenerServiciosPendientes,
    actualizarEstadoServicio
} from "../../services/servicioService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../../services/territorioService";

import "../../styles/servicios.css";

function GestionServicios() {

    const { perfil } = useAuth();

    const [servicios, setServicios] = useState([]);

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [motivos, setMotivos] = useState({});

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const pendientes = await obtenerServiciosPendientes();

            const listaDepartamentos = await obtenerDepartamentos();

            setServicios(pendientes);
            setDepartamentos(listaDepartamentos);

            let todos = [];

            for (const departamento of listaDepartamentos) {

                todos = todos.concat(
                    await obtenerMunicipios(departamento.id)
                );
            }

            setMunicipios(todos);

        } catch (error) {

            console.error(
                "Error al cargar los establecimientos:",
                error
            );

            setError("No se pudieron cargar los establecimientos.");

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargarDatos();

    }, [cargarDatos]);


    function nombreTerritorio(lista, id) {

        for (const item of lista) {

            if (item.id === id) {
                return item.nombre;
            }
        }

        return id;
    }


    function cambiarMotivo(id, valor) {

        setMotivos({
            ...motivos,
            [id]: valor
        });

        setError("");
    }


    async function decidir(servicio, estado) {

        setError("");
        setMensaje("");

        try {

            await actualizarEstadoServicio(
                servicio.id,
                estado,
                motivos[servicio.id] || ""
            );

            setMensaje(
                estado === "Verificado"
                    ? servicio.nombreComercio + " fue verificado y ya aparece en el directorio."
                    : "La solicitud fue rechazada con el motivo registrado."
            );

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al decidir sobre el establecimiento:",
                error
            );

            setError(
                error.message ||
                "No se pudo registrar la decisión."
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


    return (
        <main className="servicio-page">

            <div className="servicio-container">

                <header className="servicio-header">

                    <div>

                        <span className="servicio-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Verificación de establecimientos
                        </h1>

                        <p>
                            Revisa los datos de cada veterinaria, tienda o
                            peluquería antes de publicarla en el directorio
                            y en el mapa.
                        </p>

                    </div>

                    <div className="servicio-counter">

                        <strong>
                            {servicios.length}
                        </strong>

                        <span>
                            pendientes
                        </span>

                    </div>

                </header>


                {mensaje !== "" && (
                    <div className="servicio-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && (
                    <div className="servicio-error">
                        {error}
                    </div>
                )}


                {servicios.length === 0 && (

                    <div className="servicio-empty">

                        <span className="servicio-empty-number">
                            00
                        </span>

                        <strong>
                            Todo está al día
                        </strong>

                        <p>
                            No hay establecimientos esperando verificación.
                        </p>

                    </div>
                )}


                {servicios.map((servicio) => (

                    <article
                        key={servicio.id}
                        className="servicio-review"
                    >

                        <div className="servicio-review-header">

                            <div>

                                <span className="servicio-categoria">
                                    {servicio.categoria}
                                </span>

                                <h2>
                                    {servicio.nombreComercio}
                                </h2>

                            </div>

                            <span className="servicio-estado-chip">
                                Pendiente
                            </span>

                        </div>

                        <p className="servicio-review-descripcion">
                            {servicio.descripcion}
                        </p>

                        <div className="servicio-datos">

                            <div>
                                <span>Servicios</span>
                                <strong>
                                    {(servicio.serviciosOfrecidos || []).join(" · ")}
                                </strong>
                            </div>

                            <div>
                                <span>Teléfono</span>
                                <strong>
                                    {servicio.telefono}
                                    {servicio.telefonoEmergencias
                                        ? " · emergencias " + servicio.telefonoEmergencias
                                        : ""}
                                </strong>
                            </div>

                            <div>
                                <span>Horarios</span>
                                <strong>
                                    {servicio.horarioAtencion}
                                </strong>
                            </div>

                            <div>
                                <span>Ubicación</span>
                                <strong>
                                    {nombreTerritorio(municipios, servicio.municipioId)},
                                    {" "}
                                    {nombreTerritorio(departamentos, servicio.departamentoId)}
                                </strong>
                            </div>

                            <div className="servicio-datos-full">
                                <span>Dirección</span>
                                <strong>
                                    {servicio.direccion}
                                </strong>
                            </div>

                        </div>

                        {servicio.latitud && servicio.longitud && (

                            <a
                                className="servicio-mapa-link"
                                href={
                                    "https://www.google.com/maps?q=" +
                                    servicio.latitud +
                                    "," +
                                    servicio.longitud
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                Abrir ubicación en Google Maps ↗
                            </a>
                        )}

                        <div className="servicio-review-footer">

                            <label htmlFor={"motivo-" + servicio.id}>
                                Motivo del rechazo
                                <span> (obligatorio si rechazas)</span>
                            </label>

                            <textarea
                                id={"motivo-" + servicio.id}
                                rows="3"
                                value={motivos[servicio.id] || ""}
                                onChange={(evento) =>
                                    cambiarMotivo(
                                        servicio.id,
                                        evento.target.value
                                    )
                                }
                                maxLength="400"
                                placeholder="Indica qué información falta o debe corregirse."
                            />

                            <div className="servicio-review-actions">

                                <button
                                    type="button"
                                    className="servicio-aprobar"
                                    onClick={() =>
                                        decidir(servicio, "Verificado")
                                    }
                                >
                                    ✓ Verificar establecimiento
                                </button>

                                <button
                                    type="button"
                                    className="servicio-rechazar"
                                    onClick={() =>
                                        decidir(servicio, "Rechazado")
                                    }
                                >
                                    Rechazar solicitud
                                </button>

                            </div>

                            <p className="servicio-nota">
                                Solo un administrador puede verificar un
                                establecimiento. {perfil?.nombreCompleto}.
                            </p>

                        </div>

                    </article>

                ))}

            </div>

        </main>
    );
}

export default GestionServicios;
