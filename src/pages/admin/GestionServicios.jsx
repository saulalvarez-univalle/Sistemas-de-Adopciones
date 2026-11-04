import { useEffect, useState, useCallback } from "react";

import { useAuth } from "../../context/AuthContext";

import {
    obtenerPerfil,
    suspenderCuenta,
    reactivarCuenta
} from "../../services/userService";

import {
    obtenerTodosLosServicios,
    actualizarEstadoServicio,
    CATEGORIAS_SERVICIO
} from "../../services/servicioService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../../services/territorioService";

import "../../styles/servicios.css";
import "../../styles/admin-dueno.css";

import Cargando from "../../components/Cargando";

import BarraFiltros from "../../components/BarraFiltros";

function GestionServicios() {

    const { perfil } = useAuth();

    const [servicios, setServicios] = useState([]);
    const [duenos, setDuenos] = useState({});

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Pendiente_Verificacion");
    const [filtroCategoria, setFiltroCategoria] = useState("");

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

            const pendientes = await obtenerTodosLosServicios();

            // Los perfiles de los responsables, para poder suspender la
            // cuenta sin salir de esta pantalla.
            const mapa = {};

            for (const registro of pendientes) {

                if (registro.userId && !mapa[registro.userId]) {

                    try {

                        mapa[registro.userId] =
                            await obtenerPerfil(registro.userId);

                    } catch (error) {

                        console.error(
                            "No se pudo leer el perfil del responsable:",
                            error
                        );
                    }
                }
            }

            setDuenos(mapa);


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


    // Las cuentas creadas por authService siempre nacen con estadoCuenta
    // "Activo", pero un documento viejo podría no tener el campo: sin este
    // respaldo se vería vacío y ofrecería "Reactivar" una cuenta que nunca
    // se suspendió.
    function estadoCuentaDe(userId) {

        const perfilDueno = duenos[userId];

        if (!perfilDueno || !perfilDueno.estadoCuenta) {
            return "Activo";
        }

        return perfilDueno.estadoCuenta;
    }


    function cambiarMotivo(id, valor) {

        setMotivos({
            ...motivos,
            [id]: valor
        });

        setError("");
    }



    // Bloquear al responsable es distinto de retirar la verificación:
    // una cuenta suspendida no puede ni siquiera iniciar sesión. No se
    // borra nada, solo cambia estadoCuenta, así la medida es reversible
    // y queda rastro (RNF-08).
    async function cambiarCuenta(registro, suspender) {

        setError("");
        setMensaje("");

        if (!registro.userId) {

            setError("Este registro no tiene una cuenta asociada.");

            return;
        }

        try {

            if (suspender) {

                await suspenderCuenta(registro.userId);

                setMensaje(
                    "Cuenta suspendida. El responsable ya no puede iniciar sesión."
                );

            } else {

                await reactivarCuenta(registro.userId);

                setMensaje("Cuenta reactivada.");
            }

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al cambiar el estado de la cuenta:",
                error
            );

            setError("No se pudo cambiar el estado de la cuenta.");
        }
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

            const estabaVerificado =
                servicio.estadoVerificacion === "Verificado";

            if (estado === "Verificado") {

                setMensaje(
                    servicio.nombreComercio +
                    " fue verificado y ya aparece en el directorio."
                );

            } else if (estabaVerificado) {

                setMensaje(
                    "Se retiró la verificación de " +
                    servicio.nombreComercio +
                    ". Dejó de aparecer en el directorio y en el mapa, " +
                    "y se le notificó el motivo."
                );

            } else {

                setMensaje(
                    "La solicitud fue rechazada con el motivo registrado."
                );
            }

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
            <Cargando texto="Cargando solicitudes" />
        );
    }



    const texto = busqueda.trim().toLowerCase();

    const filtrados = servicios.filter((servicio) => {

        if (
            filtroEstado !== "" &&
            servicio.estadoVerificacion !== filtroEstado
        ) {
            return false;
        }

        if (
            filtroCategoria !== "" &&
            servicio.categoria !== filtroCategoria
        ) {
            return false;
        }

        if (texto === "") {
            return true;
        }

        const campos = [
            servicio.nombreComercio,
            servicio.direccion,
            servicio.telefono
        ];

        return campos.some(
            (campo) => (campo || "").toLowerCase().includes(texto)
        );
    });

    return (
        <main className="servicio-page">

            <div className="servicio-container">

                <header className="servicio-header">

                    <div>

                        <span className="servicio-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Gestión de establecimientos
                        </h1>

                        <p>
                            Revisa los datos de cada veterinaria, tienda o
                            peluquería antes de publicarla, y administra las
                            ya verificadas: puedes retirarles la verificación
                            o suspender la cuenta de su responsable.
                        </p>

                    </div>

                    <div className="servicio-counter">

                        <strong>
                            {servicios.length}
                        </strong>

                        <span>
                            registrados
                        </span>

                    </div>

                </header>


                <BarraFiltros
                    busqueda={busqueda}
                    alBuscar={setBusqueda}
                    marcador="Buscar por nombre, dirección o teléfono"
                    campos={[
                        {
                            id: "estado",
                            etiqueta: "Verificación",
                            valor: filtroEstado,
                            alCambiar: setFiltroEstado,
                            opciones: [
                                { valor: "", texto: "Todos los estados" },
                                { valor: "Pendiente_Verificacion", texto: "Pendientes" },
                                { valor: "Verificado", texto: "Verificados" },
                                { valor: "Rechazado", texto: "Rechazados" }
                            ]
                        },
                        {
                            id: "categoria",
                            etiqueta: "Categoría",
                            valor: filtroCategoria,
                            alCambiar: setFiltroCategoria,
                            opciones: [
                                { valor: "", texto: "Todas las categorías" },
                                ...CATEGORIAS_SERVICIO.map((categoria) => ({
                                    valor: categoria,
                                    texto: categoria
                                }))
                            ]
                        }
                    ]}
                    total={servicios.length}
                    mostrados={filtrados.length}
                    sustantivo="establecimientos"
                />


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


                {filtrados.length === 0 && (

                    <div className="servicio-empty">

                        <span className="servicio-empty-number">
                            00
                        </span>

                        <strong>
                            Nada que mostrar
                        </strong>

                        <p>
                            {servicios.length === 0
                                ? "Todavía no hay establecimientos registrados en la plataforma."
                                : "Ningún establecimiento coincide con los filtros aplicados."}
                        </p>

                    </div>
                )}


                {filtrados.map((servicio) => (

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
                                {servicio.estadoVerificacion === "Verificado"
                                    ? "Verificado"
                                    : servicio.estadoVerificacion === "Rechazado"
                                        ? "Rechazado"
                                        : "Pendiente"}
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


                        {duenos[servicio.userId] && (

                            <div className="admin-dueno">

                                <div>
                                    <span>Cuenta responsable</span>
                                    <strong>
                                        {duenos[servicio.userId].nombreCompleto}
                                    </strong>
                                </div>

                                <div>
                                    <span>Estado</span>
                                    <strong
                                        className={
                                            estadoCuentaDe(servicio.userId) === "Activo"
                                                ? "admin-dueno-activo"
                                                : "admin-dueno-suspendido"
                                        }
                                    >
                                        {estadoCuentaDe(servicio.userId)}
                                    </strong>
                                </div>

                                {estadoCuentaDe(servicio.userId) === "Activo" ? (

                                    <button
                                        type="button"
                                        className="admin-dueno-suspender"
                                        onClick={() => cambiarCuenta(servicio, true)}
                                    >
                                        Suspender cuenta
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className="admin-dueno-reactivar"
                                        onClick={() => cambiarCuenta(servicio, false)}
                                    >
                                        Reactivar cuenta
                                    </button>
                                )}

                            </div>
                        )}

                        <div className="servicio-review-footer">

                            <label htmlFor={"motivo-" + servicio.id}>
                                {servicio.estadoVerificacion === "Verificado"
                                    ? "Motivo para retirar la verificación"
                                    : "Motivo del rechazo"}
                                <span> (obligatorio, se le envía al establecimiento)</span>
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

                                {servicio.estadoVerificacion !== "Verificado" && (

                                    <button
                                        type="button"
                                        className="servicio-aprobar"
                                        onClick={() =>
                                            decidir(servicio, "Verificado")
                                        }
                                    >
                                        ✓ Verificar establecimiento
                                    </button>
                                )}

                                {servicio.estadoVerificacion === "Verificado" ? (

                                    <button
                                        type="button"
                                        className="servicio-rechazar"
                                        onClick={() =>
                                            decidir(servicio, "Rechazado")
                                        }
                                    >
                                        Retirar verificación
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className="servicio-rechazar"
                                        onClick={() =>
                                            decidir(servicio, "Rechazado")
                                        }
                                    >
                                        Rechazar solicitud
                                    </button>
                                )}

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
