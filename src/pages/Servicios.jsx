import { useEffect, useState, useCallback } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { useAuth } from "../context/AuthContext";

import {
    obtenerServiciosVerificados,
    filtrarServicios,
    CATEGORIAS_SERVICIO
} from "../services/servicioService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import BotonDenunciar from "../components/BotonDenunciar";

import "../styles/servicios.css";
import "../styles/notificaciones.css";

// HU-22: marcadores categorizados por color. Se dibujan con un divIcon
// en lugar de una imagen, para no depender de archivos externos.
const COLORES = {
    "Veterinaria": "#176b73",
    "Tienda de mascotas": "#b27a25",
    "Peluquería canina y felina": "#2e806b"
};

function crearIcono(categoria) {

    const color = COLORES[categoria] || "#60757b";

    return L.divIcon({
        className: "servicio-marcador",
        html:
            '<span style="background:' + color + '"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
}

function Servicios() {

    const { perfil } = useAuth();

    const [servicios, setServicios] = useState([]);
    const [filtrados, setFiltrados] = useState([]);

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [texto, setTexto] = useState("");
    const [categoria, setCategoria] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const lista = await obtenerServiciosVerificados();

            const listaDepartamentos = await obtenerDepartamentos();

            setServicios(lista);
            setDepartamentos(listaDepartamentos);

        } catch (error) {

            console.error(
                "Error al cargar los servicios:",
                error
            );

            setError("No fue posible cargar el directorio de servicios.");

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargarDatos();

    }, [cargarDatos]);


    useEffect(() => {

        if (perfil && perfil.departamentoId) {
            setDepartamentoId(perfil.departamentoId);
        }

    }, [perfil]);


    useEffect(() => {

        async function cargarMunicipios() {

            if (!departamentoId) {

                setMunicipios([]);

                return;
            }

            try {

                setMunicipios(
                    await obtenerMunicipios(departamentoId)
                );

            } catch (error) {

                console.error(
                    "Error al cargar municipios:",
                    error
                );
            }
        }

        cargarMunicipios();

    }, [departamentoId]);


    useEffect(() => {

        setFiltrados(
            filtrarServicios(servicios, {
                texto,
                categoria,
                departamentoId,
                municipioId
            })
        );

    }, [servicios, texto, categoria, departamentoId, municipioId]);


    function limpiarFiltros() {

        setTexto("");
        setCategoria("");
        setDepartamentoId("");
        setMunicipioId("");
    }


    function nombreMunicipio(id) {

        for (const municipio of municipios) {

            if (municipio.id === id) {
                return municipio.nombre;
            }
        }

        return "";
    }


    const conUbicacion = filtrados.filter(
        (servicio) => servicio.latitud && servicio.longitud
    );

    const centro =
        conUbicacion.length > 0
            ? [conUbicacion[0].latitud, conUbicacion[0].longitud]
            : [-17.393384, -66.157632];


    return (
        <main className="directorio-page">

            <section className="directorio-hero">

                <span className="servicio-label">
                    RED HUELLA / SERVICIOS
                </span>

                <h1>
                    Veterinarias, tiendas y peluquerías
                    <span> cerca de ti.</span>
                </h1>

                <p>
                    Establecimientos verificados por la administración.
                    Filtra por categoría y por municipio, o ubícalos
                    directamente en el mapa.
                </p>

                <div className="directorio-meta">

                    <div>
                        <strong>
                            {servicios.length}
                        </strong>

                        <span>
                            establecimientos verificados
                        </span>
                    </div>

                    <div>
                        <strong>
                            {filtrados.length}
                        </strong>

                        <span>
                            coinciden con tu búsqueda
                        </span>
                    </div>

                </div>

            </section>


            <section className="directorio-content">

                <div className="directorio-filtros">

                    <div className="servicio-field">

                        <label htmlFor="buscar">
                            Buscar por nombre
                        </label>

                        <input
                            id="buscar"
                            type="text"
                            value={texto}
                            onChange={(evento) =>
                                setTexto(evento.target.value)
                            }
                            maxLength="60"
                            placeholder="Ej. San Francisco"
                        />

                    </div>

                    <div className="servicio-field">

                        <label htmlFor="categoria-filtro">
                            Categoría
                        </label>

                        <select
                            id="categoria-filtro"
                            value={categoria}
                            onChange={(evento) =>
                                setCategoria(evento.target.value)
                            }
                        >
                            <option value="">
                                Todas
                            </option>

                            {CATEGORIAS_SERVICIO.map((opcion) => (

                                <option
                                    key={opcion}
                                    value={opcion}
                                >
                                    {opcion}
                                </option>

                            ))}
                        </select>

                    </div>

                    <div className="servicio-field">

                        <label htmlFor="departamento-filtro">
                            Departamento
                        </label>

                        <select
                            id="departamento-filtro"
                            value={departamentoId}
                            onChange={(evento) => {

                                setDepartamentoId(evento.target.value);

                                setMunicipioId("");
                            }}
                        >
                            <option value="">
                                Todos
                            </option>

                            {departamentos.map((departamento) => (

                                <option
                                    key={departamento.id}
                                    value={departamento.id}
                                >
                                    {departamento.nombre}
                                </option>

                            ))}
                        </select>

                    </div>

                    <div className="servicio-field">

                        <label htmlFor="municipio-filtro">
                            Municipio
                        </label>

                        <select
                            id="municipio-filtro"
                            value={municipioId}
                            onChange={(evento) =>
                                setMunicipioId(evento.target.value)
                            }
                            disabled={!departamentoId}
                        >
                            <option value="">
                                Todos
                            </option>

                            {municipios.map((municipio) => (

                                <option
                                    key={municipio.id}
                                    value={municipio.id}
                                >
                                    {municipio.nombre}
                                </option>

                            ))}
                        </select>

                    </div>

                    <button
                        type="button"
                        className="directorio-limpiar"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>

                </div>


                <div className="directorio-leyenda">

                    {CATEGORIAS_SERVICIO.map((opcion) => (

                        <span key={opcion}>
                            <i style={{ background: COLORES[opcion] }}></i>
                            {opcion}
                        </span>

                    ))}

                </div>


                {cargando && (
                    <div className="servicio-empty">

                        <div className="loading-spinner"></div>

                        <p>
                            Cargando el directorio...
                        </p>

                    </div>
                )}


                {!cargando && error !== "" && (
                    <div className="servicio-error">
                        {error}
                    </div>
                )}


                {!cargando && error === "" && (

                    <div className="directorio-mapa">

                        <MapContainer
                            center={centro}
                            zoom={12}
                            style={{ width: "100%", height: "440px" }}
                        >

                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {conUbicacion.map((servicio) => (

                                <Marker
                                    key={servicio.id}
                                    position={[
                                        servicio.latitud,
                                        servicio.longitud
                                    ]}
                                    icon={crearIcono(servicio.categoria)}
                                >

                                    <Popup>

                                        {servicio.fotoUrl && (

                                            <img
                                                className="popup-foto"
                                                src={servicio.fotoUrl}
                                                alt={servicio.nombreComercio}
                                            />
                                        )}

                                        <strong>
                                            {servicio.nombreComercio}
                                        </strong>

                                        <br />

                                        {servicio.categoria}

                                        <br />

                                        {servicio.direccion}

                                        <br />

                                        Tel. {servicio.telefono}

                                        <br />

                                        {servicio.horarioAtencion}

                                    </Popup>

                                </Marker>

                            ))}

                        </MapContainer>

                    </div>
                )}


                {!cargando && filtrados.length === 0 && error === "" && (

                    <div className="servicio-empty">

                        <span className="servicio-empty-number">
                            00
                        </span>

                        <strong>
                            No hay establecimientos que coincidan
                        </strong>

                        <p>
                            Prueba cambiando los filtros o ampliando la zona
                            de búsqueda.
                        </p>

                    </div>
                )}


                {filtrados.length > 0 && (

                    <div className="directorio-lista">

                        {filtrados.map((servicio) => (

                            <article
                                key={servicio.id}
                                className="directorio-card"
                            >

                                {servicio.fotoUrl && (

                                    <div className="directorio-card-foto">

                                        <img
                                            src={servicio.fotoUrl}
                                            alt={servicio.nombreComercio}
                                        />

                                    </div>
                                )}

                                <div className="directorio-card-header">

                                    <span
                                        className="servicio-categoria"
                                        style={{
                                            background:
                                                (COLORES[servicio.categoria] ||
                                                    "#60757b") + "1a",
                                            color:
                                                COLORES[servicio.categoria] ||
                                                "#60757b"
                                        }}
                                    >
                                        {servicio.categoria}
                                    </span>

                                    <h3>
                                        {servicio.nombreComercio}
                                    </h3>

                                </div>

                                <p>
                                    {servicio.descripcion}
                                </p>

                                {servicio.serviciosOfrecidos &&
                                    servicio.serviciosOfrecidos.length > 0 && (

                                    <div className="directorio-ofrecidos">

                                        {servicio.serviciosOfrecidos.map((item) => (

                                            <span key={item}>
                                                {item}
                                            </span>

                                        ))}

                                    </div>
                                )}

                                <div className="directorio-card-datos">

                                    <div>
                                        <span>Dirección</span>
                                        <strong>
                                            {servicio.direccion}
                                            {nombreMunicipio(servicio.municipioId)
                                                ? ", " + nombreMunicipio(
                                                    servicio.municipioId
                                                )
                                                : ""}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Teléfono</span>
                                        <strong>
                                            {servicio.telefono}
                                        </strong>
                                    </div>

                                    {servicio.telefonoEmergencias && (
                                        <div>
                                            <span>Emergencias</span>
                                            <strong>
                                                {servicio.telefonoEmergencias}
                                            </strong>
                                        </div>
                                    )}

                                    <div>
                                        <span>Horarios</span>
                                        <strong>
                                            {servicio.horarioAtencion}
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
                                        Cómo llegar →
                                    </a>
                                )}

                                <div className="servicio-reporte">

                                    <BotonDenunciar
                                        tipoContenido="Servicio"
                                        contenidoReferenciaId={servicio.id}
                                        contenidoUserId={servicio.userId}
                                        contenidoTitulo={
                                            "Establecimiento: " +
                                            servicio.nombreComercio
                                        }
                                    />

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Servicios;
