import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    obtenerMascotasPublicas,
    filtrarMascotas,
    CATEGORIAS_EDAD,
    TAMANOS,
    SEXOS
} from "../services/mascotaService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import { obtenerEspeciesActivas } from "../services/especieService";

import {
    obtenerIdsFavoritos,
    alternarFavorito
} from "../services/favoritoService";

import TarjetaMascota from "../components/TarjetaMascota";

import "../styles/mascotas.css";

function Mascotas() {

    const navigate = useNavigate();

    const { usuarioFirebase, perfil } = useAuth();

    const [mascotas, setMascotas] = useState([]);
    const [mascotasFiltradas, setMascotasFiltradas] = useState([]);

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [especies, setEspecies] = useState([]);

    const [texto, setTexto] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");
    const [especieId, setEspecieId] = useState("");
    const [edadCategoria, setEdadCategoria] = useState("");
    const [tamano, setTamano] = useState("");
    const [sexo, setSexo] = useState("");

    const [favoritos, setFavoritos] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const listaMascotas =
                await obtenerMascotasPublicas();

            const listaDepartamentos =
                await obtenerDepartamentos();

            const listaEspecies =
                await obtenerEspeciesActivas();

            setMascotas(listaMascotas);
            setDepartamentos(listaDepartamentos);
            setEspecies(listaEspecies);

            if (usuarioFirebase) {

                const idsFavoritos =
                    await obtenerIdsFavoritos(
                        usuarioFirebase.uid
                    );

                setFavoritos(idsFavoritos);
            }

        } catch (error) {

            console.error(
                "Error al cargar el catálogo:",
                error
            );

            setError(
                "No fue posible cargar el catálogo de mascotas."
            );

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


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

                const lista =
                    await obtenerMunicipios(departamentoId);

                setMunicipios(lista);

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

        const resultado = filtrarMascotas(mascotas, {
            texto,
            departamentoId,
            municipioId,
            especieId,
            edadCategoria,
            tamano,
            sexo
        });

        setMascotasFiltradas(resultado);

    }, [
        mascotas,
        texto,
        departamentoId,
        municipioId,
        especieId,
        edadCategoria,
        tamano,
        sexo
    ]);


    function manejarDepartamento(evento) {

        setDepartamentoId(evento.target.value);

        setMunicipioId("");
    }


    function limpiarFiltros() {

        setTexto("");
        setDepartamentoId("");
        setMunicipioId("");
        setEspecieId("");
        setEdadCategoria("");
        setTamano("");
        setSexo("");
    }


    function obtenerNombreEspecie(id) {

        for (const especie of especies) {

            if (especie.id === id) {
                return especie.nombre;
            }
        }

        return "";
    }


    function obtenerNombreMunicipio(id) {

        for (const municipio of municipios) {

            if (municipio.id === id) {
                return municipio.nombre;
            }
        }

        return "";
    }


    async function manejarFavorito(mascota) {

        if (!usuarioFirebase) {

            navigate("/login");

            return;
        }

        const esFavorito = favoritos.includes(mascota.id);

        try {

            await alternarFavorito(
                usuarioFirebase.uid,
                mascota.id,
                esFavorito
            );

            if (esFavorito) {

                setFavoritos(
                    favoritos.filter(
                        (id) => id !== mascota.id
                    )
                );

            } else {

                setFavoritos([
                    ...favoritos,
                    mascota.id
                ]);
            }

        } catch (error) {

            console.error(
                "Error al actualizar favoritos:",
                error
            );
        }
    }


    return (
        <main className="mascotas-page">

            <section className="mascotas-hero">

                <div className="mascotas-hero-content">

                    <span className="mascotas-eyebrow">
                        RED HUELLA / ADOPCIÓN
                    </span>

                    <h1>
                        Conoce a las mascotas
                        <span> que buscan hogar.</span>
                    </h1>

                    <p>
                        Todas pertenecen a refugios verificados.
                        Filtra por tu zona, por especie, por edad
                        o por tamaño y encuentra la compañía que
                        mejor se adapta a tu hogar.
                    </p>

                    <div className="mascotas-hero-meta">

                        <div>
                            <strong>
                                {mascotas.length}
                            </strong>

                            <span>
                                mascotas publicadas
                            </span>
                        </div>

                        <div>
                            <strong>
                                {mascotasFiltradas.length}
                            </strong>

                            <span>
                                coinciden con tu búsqueda
                            </span>
                        </div>

                    </div>

                </div>

                <div className="mascotas-hero-image">

                    <img
                        src="/imagenes/perro-adopcion.jpg"
                        alt="Mascota en adopción"
                    />

                </div>

            </section>


            <section className="mascotas-content">

                <div className="mascotas-heading">

                    <div>

                        <span className="mascotas-section-tag">
                            EXPLORAR CATÁLOGO
                        </span>

                        <h2>
                            Mascotas disponibles
                            <span> para adopción.</span>
                        </h2>

                    </div>

                </div>


                <div className="mascotas-filter">

                    <div className="mascotas-filter-search">

                        <label htmlFor="busqueda">
                            Buscar por nombre
                        </label>

                        <input
                            id="busqueda"
                            type="text"
                            value={texto}
                            onChange={(evento) =>
                                setTexto(evento.target.value)
                            }
                            placeholder="Ej. Lucas"
                            maxLength="50"
                        />

                    </div>

                    <div className="mascotas-filter-fields">

                        <div className="mascotas-filter-field">

                            <label>
                                Departamento
                            </label>

                            <select
                                value={departamentoId}
                                onChange={manejarDepartamento}
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


                        <div className="mascotas-filter-field">

                            <label>
                                Municipio
                            </label>

                            <select
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


                        <div className="mascotas-filter-field">

                            <label>
                                Especie
                            </label>

                            <select
                                value={especieId}
                                onChange={(evento) =>
                                    setEspecieId(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todas
                                </option>

                                {especies.map((especie) => (

                                    <option
                                        key={especie.id}
                                        value={especie.id}
                                    >
                                        {especie.nombre}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="mascotas-filter-field">

                            <label>
                                Edad
                            </label>

                            <select
                                value={edadCategoria}
                                onChange={(evento) =>
                                    setEdadCategoria(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todas
                                </option>

                                {CATEGORIAS_EDAD.map((categoria) => (

                                    <option
                                        key={categoria}
                                        value={categoria}
                                    >
                                        {categoria}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="mascotas-filter-field">

                            <label>
                                Tamaño
                            </label>

                            <select
                                value={tamano}
                                onChange={(evento) =>
                                    setTamano(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todos
                                </option>

                                {TAMANOS.map((opcion) => (

                                    <option
                                        key={opcion}
                                        value={opcion}
                                    >
                                        {opcion}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="mascotas-filter-field">

                            <label>
                                Sexo
                            </label>

                            <select
                                value={sexo}
                                onChange={(evento) =>
                                    setSexo(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todos
                                </option>

                                {SEXOS.map((opcion) => (

                                    <option
                                        key={opcion}
                                        value={opcion}
                                    >
                                        {opcion}
                                    </option>

                                ))}
                            </select>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="mascotas-clear-button"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>

                </div>


                {cargando && (
                    <div className="mascotas-state">

                        <div className="mascotas-spinner"></div>

                        <p>
                            Cargando mascotas...
                        </p>

                    </div>
                )}


                {!cargando && error !== "" && (
                    <div className="mascotas-state mascotas-state-error">

                        <strong>
                            No se pudo cargar el catálogo
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>
                )}


                {!cargando && error === "" &&
                    mascotasFiltradas.length === 0 && (

                    <div className="mascotas-state mascotas-state-empty">

                        <span className="mascotas-empty-number">
                            00
                        </span>

                        <strong>
                            No hay mascotas que coincidan
                        </strong>

                        <p>
                            Prueba cambiando los filtros o
                            ampliando la zona de búsqueda.
                        </p>

                    </div>
                )}


                {!cargando && mascotasFiltradas.length > 0 && (

                    <div className="mascotas-grid">

                        {mascotasFiltradas.map((mascota) => (

                            <TarjetaMascota
                                key={mascota.id}
                                mascota={mascota}
                                nombreEspecie={obtenerNombreEspecie(
                                    mascota.especieId
                                )}
                                nombreMunicipio={obtenerNombreMunicipio(
                                    mascota.municipioId
                                )}
                                esFavorito={favoritos.includes(
                                    mascota.id
                                )}
                                onAlternarFavorito={manejarFavorito}
                            />

                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Mascotas;
