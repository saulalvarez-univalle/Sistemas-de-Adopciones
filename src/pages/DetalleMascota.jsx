import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenerMascota } from "../services/mascotaService";
import { obtenerAlberguePorId } from "../services/albergueService";
import { obtenerEspecies } from "../services/especieService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import {
    obtenerIdsFavoritos,
    alternarFavorito
} from "../services/favoritoService";

import "../styles/detalle-mascota.css";

function DetalleMascota() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { usuarioFirebase, perfil } = useAuth();

    const [mascota, setMascota] = useState(null);
    const [albergue, setAlbergue] = useState(null);

    const [nombreEspecie, setNombreEspecie] = useState("");
    const [nombreDepartamento, setNombreDepartamento] = useState("");
    const [nombreMunicipio, setNombreMunicipio] = useState("");

    const [fotoActiva, setFotoActiva] = useState(0);

    const [esFavorito, setEsFavorito] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        async function cargarDatos() {

            try {

                setCargando(true);
                setError("");

                const datosMascota = await obtenerMascota(id);

                if (!datosMascota) {

                    setError("La mascota no existe o fue dada de baja.");

                    return;
                }

                setMascota(datosMascota);

                const datosAlbergue =
                    await obtenerAlberguePorId(
                        datosMascota.albergueId
                    );

                setAlbergue(datosAlbergue);

                const especies = await obtenerEspecies();

                for (const especie of especies) {

                    if (especie.id === datosMascota.especieId) {
                        setNombreEspecie(especie.nombre);
                    }
                }

                const departamentos = await obtenerDepartamentos();

                for (const departamento of departamentos) {

                    if (departamento.id === datosMascota.departamentoId) {
                        setNombreDepartamento(departamento.nombre);
                    }
                }

                if (datosMascota.departamentoId) {

                    const municipios =
                        await obtenerMunicipios(
                            datosMascota.departamentoId
                        );

                    for (const municipio of municipios) {

                        if (municipio.id === datosMascota.municipioId) {
                            setNombreMunicipio(municipio.nombre);
                        }
                    }
                }

                if (usuarioFirebase) {

                    const idsFavoritos =
                        await obtenerIdsFavoritos(
                            usuarioFirebase.uid
                        );

                    setEsFavorito(idsFavoritos.includes(id));
                }

            } catch (error) {

                console.error(
                    "Error al cargar la mascota:",
                    error
                );

                setError(
                    "No se pudo cargar la información de la mascota."
                );

            } finally {

                setCargando(false);
            }
        }

        cargarDatos();

    }, [id, usuarioFirebase]);


    async function manejarFavorito() {

        if (!usuarioFirebase) {

            navigate("/login");

            return;
        }

        try {

            const nuevoEstado = await alternarFavorito(
                usuarioFirebase.uid,
                id,
                esFavorito
            );

            setEsFavorito(nuevoEstado);

        } catch (error) {

            console.error(
                "Error al actualizar favoritos:",
                error
            );
        }
    }


    function manejarSolicitud() {

        if (!usuarioFirebase) {

            navigate("/login");

            return;
        }

        navigate("/solicitar/" + id);
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando mascota...
                </p>

            </main>
        );
    }


    if (error !== "" || !mascota) {

        return (
            <main className="detalle-page">

                <div className="detalle-error">

                    <strong>
                        No se encontró la mascota
                    </strong>

                    <p>
                        {error}
                    </p>

                    <Link
                        to="/mascotas"
                        className="detalle-volver"
                    >
                        Volver al catálogo
                    </Link>

                </div>

            </main>
        );
    }


    const fotos =
        mascota.fotosUrls && mascota.fotosUrls.length > 0
            ? mascota.fotosUrls
            : ["/imagenes/hero-mascota.png"];

    const puedeSolicitar =
        mascota.estadoAdopcion === "Disponible" &&
        (!perfil || perfil.rol === "Adoptante");


    return (
        <main className="detalle-page">

            <div className="detalle-container">

                <Link
                    to="/mascotas"
                    className="detalle-volver"
                >
                    ← Volver al catálogo
                </Link>


                <section className="detalle-principal">

                    <div className="detalle-galeria">

                        <div className="detalle-galeria-principal">

                            <img
                                src={fotos[fotoActiva]}
                                alt={mascota.nombre}
                            />

                        </div>

                        {fotos.length > 1 && (

                            <div className="detalle-galeria-miniaturas">

                                {fotos.map((foto, indice) => (

                                    <button
                                        key={foto}
                                        type="button"
                                        className={
                                            indice === fotoActiva
                                                ? "detalle-miniatura detalle-miniatura-activa"
                                                : "detalle-miniatura"
                                        }
                                        onClick={() =>
                                            setFotoActiva(indice)
                                        }
                                    >
                                        <img
                                            src={foto}
                                            alt={
                                                mascota.nombre +
                                                " " +
                                                (indice + 1)
                                            }
                                        />
                                    </button>

                                ))}

                            </div>
                        )}

                    </div>


                    <div className="detalle-informacion">

                        <span className="detalle-eyebrow">
                            {nombreEspecie || "MASCOTA"}
                        </span>

                        <h1>
                            {mascota.nombre}
                        </h1>

                        <div className="detalle-estado">

                            <span className="detalle-status-dot"></span>

                            {mascota.estadoAdopcion}

                        </div>

                        <p className="detalle-descripcion">
                            {mascota.descripcion}
                        </p>

                        <div className="detalle-ficha">

                            <div className="detalle-dato">

                                <span>
                                    Especie
                                </span>

                                <strong>
                                    {nombreEspecie || "No registrada"}
                                </strong>

                            </div>

                            <div className="detalle-dato">

                                <span>
                                    Raza
                                </span>

                                <strong>
                                    {mascota.raza || "No especificada"}
                                </strong>

                            </div>

                            <div className="detalle-dato">

                                <span>
                                    Edad
                                </span>

                                <strong>
                                    {mascota.edadAproximada} año(s) · {mascota.edadCategoria}
                                </strong>

                            </div>

                            <div className="detalle-dato">

                                <span>
                                    Sexo
                                </span>

                                <strong>
                                    {mascota.sexo}
                                </strong>

                            </div>

                            <div className="detalle-dato">

                                <span>
                                    Tamaño
                                </span>

                                <strong>
                                    {mascota.tamano}
                                </strong>

                            </div>

                            <div className="detalle-dato">

                                <span>
                                    Ubicación
                                </span>

                                <strong>
                                    {nombreMunicipio}
                                    {nombreDepartamento
                                        ? ", " + nombreDepartamento
                                        : ""}
                                </strong>

                            </div>

                        </div>

                        <div className="detalle-acciones">

                            {puedeSolicitar && (
                                <button
                                    type="button"
                                    className="detalle-solicitar"
                                    onClick={manejarSolicitud}
                                >
                                    Solicitar adopción
                                </button>
                            )}

                            {!puedeSolicitar && (
                                <div className="detalle-no-disponible">
                                    Esta mascota no está recibiendo
                                    solicitudes en este momento.
                                </div>
                            )}

                            <button
                                type="button"
                                className={
                                    esFavorito
                                        ? "detalle-favorito detalle-favorito-activo"
                                        : "detalle-favorito"
                                }
                                onClick={manejarFavorito}
                            >
                                {esFavorito
                                    ? "♥ En tus favoritos"
                                    : "♡ Guardar en favoritos"}
                            </button>

                        </div>

                    </div>

                </section>


                {albergue && (

                    <section className="detalle-albergue">

                        <div className="detalle-albergue-header">

                            <span className="detalle-section-tag">
                                REFUGIO RESPONSABLE
                            </span>

                            <h2>
                                {albergue.nombreRefugio}
                            </h2>

                        </div>

                        <p>
                            {albergue.descripcion}
                        </p>

                        <div className="detalle-albergue-datos">

                            <div>
                                <span>
                                    Dirección
                                </span>

                                <strong>
                                    {albergue.direccion}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Teléfono
                                </span>

                                <strong>
                                    {albergue.telefonoContacto}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Horarios
                                </span>

                                <strong>
                                    {albergue.horariosAtencion}
                                </strong>
                            </div>

                        </div>

                        {albergue.latitud && albergue.longitud && (

                            <a
                                className="detalle-mapa-link"
                                href={
                                    "https://www.google.com/maps?q=" +
                                    albergue.latitud +
                                    "," +
                                    albergue.longitud
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ver ubicación en el mapa →
                            </a>
                        )}

                    </section>
                )}

            </div>

        </main>
    );
}

export default DetalleMascota;
