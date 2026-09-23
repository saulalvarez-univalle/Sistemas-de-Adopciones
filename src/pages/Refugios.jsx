import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { obtenerAlberguesVerificados } from "../services/albergueService";
import { useAuth } from "../context/AuthContext";

import "../styles/refugios.css";

function Refugios() {

    const { perfil, usuarioFirebase } = useAuth();

    const [albergues, setAlbergues] = useState([]);
    const [alberguesFiltrados, setAlberguesFiltrados] = useState([]);

    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState("");

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarAlbergues();
    }, []);

    useEffect(() => {

        if (perfil) {

            if (perfil.departamentoId) {
                setDepartamentoSeleccionado(perfil.departamentoId);
            }

            if (perfil.municipioId) {
                setMunicipioSeleccionado(perfil.municipioId);
            }
        }

    }, [perfil]);

    useEffect(() => {

        filtrarAlbergues();

    }, [
        albergues,
        departamentoSeleccionado,
        municipioSeleccionado
    ]);

    async function cargarAlbergues() {

        setCargando(true);
        setError("");

        try {

            const resultado = await obtenerAlberguesVerificados();

            setAlbergues(resultado);

        } catch (error) {

            console.error(
                "Error al cargar los refugios:",
                error
            );

            setError(
                "No fue posible cargar los refugios."
            );

        } finally {

            setCargando(false);

        }
    }

    function filtrarAlbergues() {

        let resultado = [];

        for (const albergue of albergues) {

            if (
                departamentoSeleccionado &&
                albergue.departamentoId !== departamentoSeleccionado
            ) {
                continue;
            }

            if (
                municipioSeleccionado &&
                albergue.municipioId !== municipioSeleccionado
            ) {
                continue;
            }

            resultado.push(albergue);
        }

        setAlberguesFiltrados(resultado);
    }

    function obtenerGoogleMaps(latitud, longitud) {

        return (
            "https://www.google.com/maps?q=" +
            latitud +
            "," +
            longitud
        );
    }

    function limpiarFiltros() {

        setDepartamentoSeleccionado("");
        setMunicipioSeleccionado("");
    }

    function obtenerTextoZona() {

        if (perfil?.municipioId) {
            return "Mostrando refugios de tu municipio";
        }

        if (perfil?.departamentoId) {
            return "Mostrando refugios de tu departamento";
        }

        return "Explora los refugios verificados disponibles";
    }

    return (
        <main className="refugios-page">

            <section className="refugios-hero">

                <div className="refugios-hero-content">

                    <span className="refugios-eyebrow">
                        RED HUella / REFUGIOS
                    </span>

                    <h1>
                        Encuentra un refugio
                        <span> cerca de ti.</span>
                    </h1>

                    <p>
                        Conoce refugios verificados, consulta
                        su información y encuentra la ubicación
                        que necesitas para acercarte a ellos.
                    </p>

                    <div className="refugios-hero-meta">

                        <div>
                            <strong>
                                {albergues.length}
                            </strong>

                            <span>
                                refugios verificados
                            </span>
                        </div>

                        <div>
                            <strong>
                                Bolivia
                            </strong>

                            <span>
                                cobertura territorial
                            </span>
                        </div>

                    </div>

                </div>

                <div className="refugios-hero-image">

                    <img
                        src="/imagenes/refugio2.jpg"
                        alt="Refugio de animales"
                    />

                    <div className="refugios-hero-floating">

                        <span className="refugios-floating-number">
                            01
                        </span>

                        <div>
                            <strong>
                                Información verificada
                            </strong>

                            <p>
                                Consulta datos registrados
                                por cada refugio.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            <section className="refugios-content">

                <div className="refugios-heading">

                    <div>

                        <span className="refugios-section-tag">
                            EXPLORAR REFUGIOS
                        </span>

                        <h2>
                            Refugios disponibles
                            <span> en tu zona.</span>
                        </h2>

                    </div>

                    <p>
                        {obtenerTextoZona()}
                    </p>

                </div>


                <div className="refugios-filter">

                    <div className="refugios-filter-main">

                        <div className="refugios-filter-label">

                            <span>
                                FILTRAR RESULTADOS
                            </span>

                            <strong>
                                Ubicación
                            </strong>

                        </div>

                        <div className="refugios-filter-fields">

                            <div className="refugios-filter-field">

                                <label>
                                    Departamento
                                </label>

                                <select
                                    value={departamentoSeleccionado}
                                    onChange={(event) => {

                                        setDepartamentoSeleccionado(
                                            event.target.value
                                        );

                                        setMunicipioSeleccionado("");

                                    }}
                                >
                                    <option value="">
                                        Todos los departamentos
                                    </option>

                                    {
                                        [
                                            ...new Set(
                                                albergues.map(
                                                    (albergue) =>
                                                        albergue.departamentoId
                                                )
                                            )
                                        ].map((departamento) => (

                                            <option
                                                key={departamento}
                                                value={departamento}
                                            >
                                                {departamento}
                                            </option>

                                        ))
                                    }

                                </select>

                            </div>


                            <div className="refugios-filter-field">

                                <label>
                                    Municipio
                                </label>

                                <select
                                    value={municipioSeleccionado}
                                    onChange={(event) => {
                                        setMunicipioSeleccionado(
                                            event.target.value
                                        );
                                    }}
                                >

                                    <option value="">
                                        Todos los municipios
                                    </option>

                                    {
                                        [
                                            ...new Set(
                                                albergues
                                                    .filter(
                                                        (albergue) => {

                                                            if (
                                                                !departamentoSeleccionado
                                                            ) {
                                                                return true;
                                                            }

                                                            return (
                                                                albergue.departamentoId ===
                                                                departamentoSeleccionado
                                                            );
                                                        }
                                                    )
                                                    .map(
                                                        (albergue) =>
                                                            albergue.municipioId
                                                    )
                                            )
                                        ].map((municipio) => (

                                            <option
                                                key={municipio}
                                                value={municipio}
                                            >
                                                {municipio}
                                            </option>

                                        ))
                                    }

                                </select>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="refugios-clear-button"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>

                </div>


                {
                    cargando && (

                        <div className="refugios-state">

                            <div className="refugios-spinner"></div>

                            <h3>
                                Cargando refugios
                            </h3>

                            <p>
                                Estamos buscando refugios
                                verificados.
                            </p>

                        </div>

                    )
                }


                {
                    !cargando && error && (

                        <div className="refugios-state refugios-state-error">

                            <span>
                                !
                            </span>

                            <h3>
                                No pudimos cargar los refugios
                            </h3>

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={cargarAlbergues}
                            >
                                Intentar nuevamente
                            </button>

                        </div>

                    )
                }


                {
                    !cargando &&
                    !error &&
                    alberguesFiltrados.length === 0 && (

                        <div className="refugios-state refugios-state-empty">

                            <div className="refugios-empty-number">
                                00
                            </div>

                            <h3>
                                No encontramos refugios en esta zona
                            </h3>

                            <p>
                                Prueba seleccionando otra ubicación
                                para consultar los refugios disponibles.
                            </p>

                            <button
                                type="button"
                                onClick={limpiarFiltros}
                            >
                                Ver todos los refugios
                            </button>

                        </div>

                    )
                }


                {
                    !cargando &&
                    !error &&
                    alberguesFiltrados.length > 0 && (

                        <div className="refugios-grid">

                            {
                                alberguesFiltrados.map(
                                    (albergue, indice) => (

                                        <article
                                            className="refugio-card"
                                            key={albergue.id}
                                        >

                                            <div className="refugio-card-image">

                                                <img
                                                    src="/imagenes/perfilref.jpg"
                                                    alt={
                                                        "Refugio " +
                                                        albergue.nombreRefugio
                                                    }
                                                />

                                                <span>
                                                    VERIFICADO
                                                </span>

                                            </div>


                                            <div className="refugio-card-content">

                                                <div className="refugio-card-number">
                                                    {
                                                        String(
                                                            indice + 1
                                                        ).padStart(2, "0")
                                                    }
                                                </div>

                                                <h3>
                                                    {albergue.nombreRefugio}
                                                </h3>

                                                <p className="refugio-description">
                                                    {
                                                        albergue.descripcion ||
                                                        "Refugio registrado en Red Huella."
                                                    }
                                                </p>


                                                <div className="refugio-details">

                                                    <div>

                                                        <span>
                                                            UBICACIÓN
                                                        </span>

                                                        <strong>
                                                            {
                                                                albergue.direccion ||
                                                                "Dirección no registrada"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            CONTACTO
                                                        </span>

                                                        <strong>
                                                            {
                                                                albergue.telefonoContacto ||
                                                                "No disponible"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            ATENCIÓN
                                                        </span>

                                                        <strong>
                                                            {
                                                                albergue.horariosAtencion ||
                                                                "Horario no registrado"
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="refugio-card-footer">

                                                    {
                                                        albergue.latitud &&
                                                        albergue.longitud && (

                                                            <a
                                                                href={
                                                                    obtenerGoogleMaps(
                                                                        albergue.latitud,
                                                                        albergue.longitud
                                                                    )
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Ver ubicación
                                                                <span>
                                                                    →
                                                                </span>
                                                            </a>

                                                        )
                                                    }

                                                    <span className="refugio-status">
                                                        Verificado
                                                    </span>

                                                </div>

                                            </div>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    )
                }

            </section>


            <section className="refugios-bottom">

                <div>

                    <span>
                        RED HUella
                    </span>

                    <h2>
                        Una red de refugios
                        <strong>
                            más cerca de ti.
                        </strong>
                    </h2>

                    <p>
                        Red Huella centraliza información de
                        instituciones verificadas para facilitar
                        el acceso a refugios según la ubicación.
                    </p>

                </div>

                <Link
                    to="/"
                    className="refugios-bottom-button"
                >
                    Volver al inicio
                </Link>

            </section>

        </main>
    );
}

export default Refugios;