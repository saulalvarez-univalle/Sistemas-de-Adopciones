import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import icono from "leaflet/dist/images/marker-icon.png";
import iconoSombra from "leaflet/dist/images/marker-shadow.png";

import { useAuth } from "../context/AuthContext";

import "../styles/cargando.css";
import "../styles/admin-dueno.css";

import BarraFiltros from "../components/BarraFiltros";

import {
    obtenerTodosLosAlbergues,
    actualizarEstadoAlbergue,
    suspenderRefugio,
    reactivarRefugio
} from "../services/albergueService";

import { obtenerPerfil } from "../services/userService";

import { formatearFecha } from "../utils/fechas";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";


const iconoMarcador = new L.Icon({
    iconUrl: icono,
    shadowUrl: iconoSombra,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});


function GestionAlbergues() {

    const { perfil } = useAuth();

    const [albergues, setAlbergues] = useState([]);
    const [duenos, setDuenos] = useState({});

    const [busqueda, setBusqueda] = useState("");
    const [filtroDepartamento, setFiltroDepartamento] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Pendiente_Verificacion");

    const [departamentos, setDepartamentos] =
        useState([]);

    const [municipios, setMunicipios] =
        useState([]);

    const [cargando, setCargando] =
        useState(true);

    const [motivos, setMotivos] =
        useState({});

    const [errores, setErrores] =
        useState({});

    const [mensajes, setMensajes] =
        useState({});


    async function cargarDatos() {

        try {

            setCargando(true);

            const resultado =
                await obtenerTodosLosAlbergues();

            const listaDepartamentos =
                await obtenerDepartamentos();

            setAlbergues(resultado);

            // El perfil del responsable de cada refugio, para poder
            // suspender su cuenta sin salir de esta pantalla.
            const mapa = {};

            for (const registro of resultado) {

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

            setDepartamentos(
                listaDepartamentos
            );

            let todosLosMunicipios = [];

            for (
                let i = 0;
                i < listaDepartamentos.length;
                i++
            ) {

                const listaMunicipios =
                    await obtenerMunicipios(
                        listaDepartamentos[i].id
                    );

                todosLosMunicipios =
                    todosLosMunicipios.concat(
                        listaMunicipios
                    );
            }

            setMunicipios(
                todosLosMunicipios
            );

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

        cargarDatos();

    }, []);


    function obtenerNombreDepartamento(
        id
    ) {

        for (
            let i = 0;
            i < departamentos.length;
            i++
        ) {

            if (
                departamentos[i].id === id
            ) {

                return departamentos[i].nombre;
            }
        }

        return id;
    }


    function obtenerNombreMunicipio(
        id
    ) {

        for (
            let i = 0;
            i < municipios.length;
            i++
        ) {

            if (
                municipios[i].id === id
            ) {

                return municipios[i].nombre;
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


    function cambiarMotivo(
        id,
        valor
    ) {

        setMotivos({
            ...motivos,
            [id]: valor
        });

        setErrores({
            ...errores,
            [id]: ""
        });
    }


    // Bloquear al responsable es distinto de retirar la verificación:
    // una cuenta suspendida no puede ni siquiera iniciar sesión. No se
    // borra nada, solo cambia estadoCuenta, así la medida es reversible
    // y queda rastro (RNF-08).
    async function cambiarCuenta(albergue, suspender) {

        setErrores({
            ...errores,
            [albergue.id]: ""
        });

        setMensajes({
            ...mensajes,
            [albergue.id]: ""
        });

        if (!albergue.userId) {

            setErrores({
                ...errores,
                [albergue.id]:
                    "Este refugio no tiene una cuenta asociada."
            });

            return;
        }

        try {

            if (suspender) {

                await suspenderRefugio(
                    albergue.id,
                    albergue.userId
                );

                setMensajes({
                    ...mensajes,
                    [albergue.id]:
                        "Cuenta suspendida. El responsable ya no puede " +
                        "iniciar sesión, el refugio salió del listado " +
                        "público y sus mascotas salieron del catálogo."
                });

            } else {

                await reactivarRefugio(
                    albergue.id,
                    albergue.userId
                );

                setMensajes({
                    ...mensajes,
                    [albergue.id]:
                        "Cuenta reactivada. Si el refugio está verificado, " +
                        "volvió al listado público junto con sus mascotas."
                });
            }

            await cargarDatos();

        } catch (error) {

            console.error(
                "ERROR AL CAMBIAR EL ESTADO DE LA CUENTA:",
                error
            );

            setErrores({
                ...errores,
                [albergue.id]:
                    "No se pudo cambiar el estado de la cuenta."
            });
        }
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
                "Verificado",
                ""
            );

            setMensajes({
                ...mensajes,
                [id]:
                    "Albergue verificado correctamente."
            });

            await cargarDatos();

        } catch (error) {

            console.error(
                "ERROR AL APROBAR ALBERGUE:",
                error
            );

            setMensajes({
                ...mensajes,
                [id]:
                    "No se pudo verificar el albergue."
            });
        }
    }


    async function rechazar(id) {

        const motivo =
            motivos[id]
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

            const anterior = albergues.find(
                (albergue) => albergue.id === id
            );

            setMensajes({
                ...mensajes,
                [id]:
                    anterior &&
                    anterior.estadoVerificacion === "Verificado"
                        ? "Se retiró la verificación. El refugio dejó de aparecer en el listado público y sus mascotas salieron del catálogo."
                        : "Albergue rechazado correctamente."
            });

            await cargarDatos();

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
            <main className="shelter-admin-page">

                <section className="shelter-admin-container">

                    <div className="shelter-admin-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Cargando solicitudes...
                        </p>

                    </div>

                </section>

            </main>
        );
    }


    if (
        perfil &&
        perfil.rol !== "Admin" &&
        perfil.rol !== "Superusuario"
    ) {

        return (
            <main className="shelter-admin-page">

                <section className="shelter-admin-container">

                    <div className="shelter-admin-message shelter-admin-error">

                        <h1>
                            Acceso no permitido
                        </h1>

                        <p>
                            Solo un administrador puede verificar
                            los albergues.
                        </p>

                    </div>

                </section>

            </main>
        );
    }



    const texto = busqueda.trim().toLowerCase();

    const filtrados = albergues.filter((albergue) => {

        if (
            filtroEstado !== "" &&
            albergue.estadoVerificacion !== filtroEstado
        ) {
            return false;
        }

        if (
            filtroDepartamento !== "" &&
            albergue.departamentoId !== filtroDepartamento
        ) {
            return false;
        }

        if (texto === "") {
            return true;
        }

        const campos = [
            albergue.nombreRefugio,
            albergue.direccion,
            albergue.telefonoContacto
        ];

        return campos.some(
            (campo) => (campo || "").toLowerCase().includes(texto)
        );
    });

    // Solo los departamentos que tienen refugios esperando: ofrecer los
    // nueve cuando hay solicitudes de dos haría que el filtro casi
    // siempre devolviera nada.
    const departamentosConSolicitud = [];

    for (const albergue of albergues) {

        if (
            albergue.departamentoId &&
            !departamentosConSolicitud.some(
                (item) => item.valor === albergue.departamentoId
            )
        ) {
            departamentosConSolicitud.push({
                valor: albergue.departamentoId,
                texto: obtenerNombreDepartamento(albergue.departamentoId)
            });
        }
    }

    departamentosConSolicitud.sort(
        (a, b) => a.texto.localeCompare(b.texto)
    );

    return (
        <main className="shelter-admin-page">

            <section className="shelter-admin-container">

                <div className="shelter-admin-header">

                    <div>

                        <span className="shelter-admin-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Gestión de refugios
                        </h1>

                        <p>
                            Revisa las solicitudes nuevas y administra los
                            refugios ya verificados: puedes retirarles la
                            verificación o suspender la cuenta de su responsable.
                        </p>

                    </div>

                    <div className="shelter-admin-counter">

                        <span>
                            {albergues.length}
                        </span>

                        <small>
                            registrados
                        </small>

                    </div>

                </div>


                {albergues.length > 0 && (

                    <BarraFiltros
                        busqueda={busqueda}
                        alBuscar={setBusqueda}
                        marcador="Buscar por nombre, dirección o teléfono"
                        campos={[
                            {
                                id: "estado",
                                etiqueta: "Estado",
                                valor: filtroEstado,
                                alCambiar: setFiltroEstado,
                                opciones: [
                                    { valor: "", texto: "Todos los estados" },
                                    { valor: "Pendiente_Verificacion", texto: "Pendientes de revisar" },
                                    { valor: "Verificado", texto: "Verificados" },
                                    { valor: "Rechazado", texto: "Rechazados" }
                                ]
                            },
                            {
                                id: "departamento",
                                etiqueta: "Departamento",
                                valor: filtroDepartamento,
                                alCambiar: setFiltroDepartamento,
                                opciones: [
                                    { valor: "", texto: "Todos los departamentos" },
                                    ...departamentosConSolicitud
                                ]
                            }
                        ]}
                        total={albergues.length}
                        mostrados={filtrados.length}
                        sustantivo="refugios"
                    />
                )}


                {filtrados.length === 0 ? (

                    <div className="shelter-admin-empty">

                        <span className="shelter-admin-empty-icon">
                            ✓
                        </span>

                        <h2>
                            Nada que mostrar
                        </h2>

                        <p>
                            {albergues.length === 0
                                ? "Todavía no hay refugios registrados en la plataforma."
                                : "Ningún refugio coincide con los filtros aplicados."}
                        </p>

                    </div>

                ) : (

                    <div className="shelter-admin-list">

                        {filtrados.map(
                            (albergue) => {

                                const latitud =
                                    Number(
                                        albergue.latitud
                                    );

                                const longitud =
                                    Number(
                                        albergue.longitud
                                    );

                                const ubicacionValida =
                                    !isNaN(latitud) &&
                                    !isNaN(longitud);

                                return (

                                    <article
                                        className="shelter-admin-card"
                                        key={albergue.id}
                                    >

                                        <div className="shelter-admin-card-header">

                                            <div>

                                                <span className="shelter-admin-card-icon">
                                                    🏠
                                                </span>

                                                <div>

                                                    <h2>
                                                        {albergue.nombreRefugio}
                                                    </h2>

                                                    <p>
                                                        {albergue.estadoVerificacion === "Verificado"
                                                            ? "Refugio activo en la plataforma"
                                                            : "Solicitud de registro"}
                                                    </p>

                                                </div>

                                            </div>

                                            <span className="shelter-admin-status">
                                                {albergue.estadoVerificacion === "Verificado"
                                                    ? "Verificado"
                                                    : albergue.estadoVerificacion === "Rechazado"
                                                        ? "Rechazado"
                                                        : "Pendiente"}
                                            </span>

                                        </div>


                                        <div className="shelter-admin-main">

                                            <div className="shelter-admin-information">

                                                <section className="shelter-admin-block">

                                                    <h3>
                                                        Sobre el albergue
                                                    </h3>

                                                    <p className="shelter-admin-description">
                                                        {albergue.descripcion}
                                                    </p>

                                                </section>


                                                <section className="shelter-admin-block">

                                                    <h3>
                                                        Contacto y atención
                                                    </h3>

                                                    <div className="shelter-admin-contact">

                                                        <div>
                                                            <span>
                                                                📞
                                                            </span>

                                                            <div>
                                                                <small>
                                                                    Teléfono
                                                                </small>

                                                                <strong>
                                                                    {albergue.telefonoContacto}
                                                                </strong>
                                                            </div>
                                                        </div>


                                                        <div>
                                                            <span>
                                                                🕐
                                                            </span>

                                                            <div>
                                                                <small>
                                                                    Horarios
                                                                </small>

                                                                <strong>
                                                                    {albergue.horariosAtencion}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </section>

                                            </div>


                                            <section className="shelter-admin-location">

                                                <div className="shelter-admin-location-header">

                                                    <div>

                                                        <h3>
                                                            📍 Ubicación
                                                        </h3>

                                                        <p>
                                                            {
                                                                obtenerNombreMunicipio(
                                                                    albergue.municipioId
                                                                )
                                                            }
                                                            ,{" "}
                                                            {
                                                                obtenerNombreDepartamento(
                                                                    albergue.departamentoId
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {ubicacionValida && (

                                                    <div className="shelter-admin-map">

                                                        <MapContainer
                                                            center={[
                                                                latitud,
                                                                longitud
                                                            ]}
                                                            zoom={15}
                                                            scrollWheelZoom={false}
                                                            dragging={false}
                                                            doubleClickZoom={false}
                                                            zoomControl={false}
                                                            style={{
                                                                width: "100%",
                                                                height: "220px"
                                                            }}
                                                        >

                                                            <TileLayer
                                                                attribution='&copy; OpenStreetMap contributors'
                                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            />

                                                            <Marker
                                                                position={[
                                                                    latitud,
                                                                    longitud
                                                                ]}
                                                                icon={
                                                                    iconoMarcador
                                                                }
                                                            />

                                                        </MapContainer>

                                                    </div>

                                                )}


                                                <div className="shelter-admin-address">

                                                    <span>
                                                        📌
                                                    </span>

                                                    <div>

                                                        <small>
                                                            Dirección registrada
                                                        </small>

                                                        <strong>
                                                            {albergue.direccion}
                                                        </strong>

                                                    </div>

                                                </div>


                                                {ubicacionValida && (

                                                    <a
                                                        className="shelter-admin-map-link"
                                                        href={
                                                            "https://www.google.com/maps/search/?api=1&query=" +
                                                            latitud +
                                                            "," +
                                                            longitud
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Abrir ubicación en Google Maps ↗
                                                    </a>

                                                )}

                                            </section>

                                        </div>


                                        <section className="admin-ficha">

                                            <h3>
                                                Datos del registro
                                            </h3>

                                            <div className="admin-ficha-datos">

                                                <div>
                                                    <span>
                                                        Fecha de solicitud
                                                    </span>
                                                    <strong>
                                                        {formatearFecha(
                                                            albergue.fechaSolicitud
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Estado de verificación
                                                    </span>
                                                    <strong>
                                                        {albergue.estadoVerificacion ===
                                                            "Pendiente_Verificacion"
                                                            ? "Pendiente de revisar"
                                                            : albergue.estadoVerificacion}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Visible en público
                                                    </span>
                                                    <strong>
                                                        {albergue.estadoVerificacion === "Verificado" &&
                                                            albergue.activo !== false
                                                            ? "Sí"
                                                            : "No"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Coordenadas
                                                    </span>
                                                    <strong>
                                                        {ubicacionValida
                                                            ? latitud.toFixed(5) + ", " +
                                                              longitud.toFixed(5)
                                                            : "Sin ubicación"}
                                                    </strong>
                                                </div>

                                                <div className="admin-ficha-ancho">
                                                    <span>
                                                        Identificador interno
                                                    </span>
                                                    <strong className="admin-ficha-id">
                                                        {albergue.id}
                                                    </strong>
                                                </div>

                                                {albergue.motivoRechazo && (

                                                    <div className="admin-ficha-ancho">
                                                        <span>
                                                            Último motivo registrado
                                                        </span>
                                                        <strong>
                                                            {albergue.motivoRechazo}
                                                        </strong>
                                                    </div>
                                                )}

                                            </div>

                                        </section>


                                        {duenos[albergue.userId] ? (

                                            <div className="admin-dueno">

                                                <div>
                                                    <span>
                                                        Responsable
                                                    </span>
                                                    <strong>
                                                        {duenos[albergue.userId].nombreCompleto}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Correo
                                                    </span>
                                                    <strong>
                                                        <a
                                                            href={
                                                                "mailto:" +
                                                                duenos[albergue.userId].email
                                                            }
                                                        >
                                                            {duenos[albergue.userId].email}
                                                        </a>
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Teléfono
                                                    </span>
                                                    <strong>
                                                        {duenos[albergue.userId].telefono ||
                                                            "Sin registrar"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Miembro desde
                                                    </span>
                                                    <strong>
                                                        {formatearFecha(
                                                            duenos[albergue.userId].fechaRegistro
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Estado de la cuenta
                                                    </span>
                                                    <strong
                                                        className={
                                                            estadoCuentaDe(albergue.userId) === "Activo"
                                                                ? "admin-dueno-activo"
                                                                : "admin-dueno-suspendido"
                                                        }
                                                    >
                                                        {estadoCuentaDe(albergue.userId)}
                                                    </strong>
                                                </div>

                                                {estadoCuentaDe(albergue.userId) === "Activo" ? (

                                                    <button
                                                        type="button"
                                                        className="admin-dueno-suspender"
                                                        onClick={() =>
                                                            cambiarCuenta(albergue, true)
                                                        }
                                                    >
                                                        Suspender cuenta
                                                    </button>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        className="admin-dueno-reactivar"
                                                        onClick={() =>
                                                            cambiarCuenta(albergue, false)
                                                        }
                                                    >
                                                        Reactivar cuenta
                                                    </button>
                                                )}

                                            </div>

                                        ) : (

                                            <div className="admin-dueno admin-dueno-huerfano">

                                                <div>
                                                    <span>
                                                        Responsable
                                                    </span>
                                                    <strong>
                                                        No se pudo leer la cuenta asociada
                                                        a este refugio.
                                                    </strong>
                                                </div>

                                            </div>
                                        )}


                                        <div className="shelter-admin-review">

                                            <div className="shelter-admin-review-title">

                                                <div>

                                                    <span>
                                                        ✓
                                                    </span>

                                                    <div>

                                                        <h3>
                                                            Decisión de verificación
                                                        </h3>

                                                        <p>
                                                            Comprueba que la información
                                                            proporcionada sea correcta.
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="shelter-admin-approve-area">

                                                {albergue.estadoVerificacion !== "Verificado" && (

                                                    <button
                                                        type="button"
                                                        className="shelter-admin-approve"
                                                        onClick={() =>
                                                            aprobar(
                                                                albergue.id
                                                            )
                                                        }
                                                    >
                                                        ✓ Verificar albergue
                                                    </button>
                                                )}

                                                {albergue.estadoVerificacion === "Verificado" && (

                                                    <p className="shelter-admin-verificado">
                                                        Este refugio está verificado: aparece
                                                        en el listado público y puede publicar
                                                        mascotas.
                                                    </p>
                                                )}

                                            </div>


                                            <div className="shelter-admin-reject">

                                                <div>

                                                    <h3>
                                                        {albergue.estadoVerificacion === "Verificado"
                                                            ? "Retirar la verificación"
                                                            : "Rechazar solicitud"}
                                                    </h3>

                                                    <p>
                                                        {albergue.estadoVerificacion === "Verificado"
                                                            ? "El refugio saldrá del listado público y sus mascotas dejarán de verse en el catálogo. Se le envía el motivo."
                                                            : "Indica qué información debe corregirse."}
                                                    </p>

                                                </div>


                                                <textarea
                                                    value={
                                                        motivos[
                                                            albergue.id
                                                        ] || ""
                                                    }
                                                    onChange={(
                                                        evento
                                                    ) =>
                                                        cambiarMotivo(
                                                            albergue.id,
                                                            evento.target.value
                                                        )
                                                    }
                                                    maxLength="300"
                                                    placeholder="Escribe aquí el motivo del rechazo..."
                                                />


                                                <div className="shelter-admin-reject-footer">

                                                    <span>
                                                        {
                                                            (
                                                                motivos[
                                                                    albergue.id
                                                                ] || ""
                                                            ).length
                                                        } / 300
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="shelter-admin-reject-button"
                                                        onClick={() =>
                                                            rechazar(
                                                                albergue.id
                                                            )
                                                        }
                                                    >
                                                        {albergue.estadoVerificacion === "Verificado"
                                                            ? "Retirar verificación"
                                                            : "Rechazar solicitud"}
                                                    </button>

                                                </div>

                                            </div>

                                        </div>


                                        {errores[
                                            albergue.id
                                        ] && (

                                            <div className="shelter-admin-message shelter-admin-error">

                                                {
                                                    errores[
                                                        albergue.id
                                                    ]
                                                }

                                            </div>

                                        )}


                                        {mensajes[
                                            albergue.id
                                        ] && (

                                            <div className="shelter-admin-message shelter-admin-success">

                                                {
                                                    mensajes[
                                                        albergue.id
                                                    ]
                                                }

                                            </div>

                                        )}

                                    </article>
                                );
                            }
                        )}

                    </div>
                )}

            </section>

        </main>
    );
}

export default GestionAlbergues;