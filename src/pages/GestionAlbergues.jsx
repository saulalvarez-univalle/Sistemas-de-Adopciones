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

import {
    obtenerAlberguesPendientes,
    actualizarEstadoAlbergue
} from "../services/albergueService";

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
                await obtenerAlberguesPendientes();

            const listaDepartamentos =
                await obtenerDepartamentos();

            setAlbergues(resultado);

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

            setAlbergues(
                albergues.filter(
                    (albergue) =>
                        albergue.id !== id
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

            setMensajes({
                ...mensajes,
                [id]:
                    "Albergue rechazado correctamente."
            });

            setAlbergues(
                albergues.filter(
                    (albergue) =>
                        albergue.id !== id
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


    return (
        <main className="shelter-admin-page">

            <section className="shelter-admin-container">

                <div className="shelter-admin-header">

                    <div>

                        <span className="shelter-admin-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Solicitudes de albergues
                        </h1>

                        <p>
                            Revisa la información de cada refugio
                            antes de aprobar su incorporación a la plataforma.
                        </p>

                    </div>

                    <div className="shelter-admin-counter">

                        <span>
                            {albergues.length}
                        </span>

                        <small>
                            pendientes
                        </small>

                    </div>

                </div>


                {albergues.length === 0 ? (

                    <div className="shelter-admin-empty">

                        <span className="shelter-admin-empty-icon">
                            ✓
                        </span>

                        <h2>
                            Todo está al día
                        </h2>

                        <p>
                            No hay solicitudes pendientes
                            de verificación.
                        </p>

                    </div>

                ) : (

                    <div className="shelter-admin-list">

                        {albergues.map(
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
                                                        Solicitud de registro
                                                    </p>

                                                </div>

                                            </div>

                                            <span className="shelter-admin-status">
                                                Pendiente
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

                                            </div>


                                            <div className="shelter-admin-reject">

                                                <div>

                                                    <h3>
                                                        Rechazar solicitud
                                                    </h3>

                                                    <p>
                                                        Indica qué información
                                                        debe corregirse.
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
                                                        Rechazar solicitud
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