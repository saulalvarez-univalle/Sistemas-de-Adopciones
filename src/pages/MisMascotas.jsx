import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenerAlberguePorUsuario } from "../services/albergueService";

import {
    registrarMascota,
    obtenerMascotasPorAlbergue,
    actualizarMascota,
    actualizarEstadoMascota,
    darDeBajaMascota,
    ESTADOS_ADOPCION,
    TAMANOS,
    SEXOS
} from "../services/mascotaService";

import { obtenerEspeciesActivas } from "../services/especieService";

import {
    subirFotosMascota,
    validarImagen,
    MAXIMO_FOTOS_POR_MASCOTA
} from "../services/storageService";

import "../styles/mis-mascotas.css";

const FORMULARIO_VACIO = {
    nombre: "",
    descripcion: "",
    especieId: "",
    raza: "",
    edadAproximada: "",
    tamano: "",
    sexo: ""
};

function MisMascotas() {

    const navigate = useNavigate();

    const { usuarioFirebase } = useAuth();

    const [albergue, setAlbergue] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [especies, setEspecies] = useState([]);

    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [editandoId, setEditandoId] = useState("");

    const [fotosExistentes, setFotosExistentes] = useState([]);
    const [archivos, setArchivos] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            const datosAlbergue =
                await obtenerAlberguePorUsuario(
                    usuarioFirebase.uid
                );

            setAlbergue(datosAlbergue);

            const listaEspecies =
                await obtenerEspeciesActivas();

            setEspecies(listaEspecies);

            if (datosAlbergue) {

                const listaMascotas =
                    await obtenerMascotasPorAlbergue(
                        datosAlbergue.id
                    );

                setMascotas(listaMascotas);
            }

        } catch (error) {

            console.error(
                "Error al cargar las mascotas:",
                error
            );

            setError(
                "No se pudo cargar la información de tus mascotas."
            );

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargarDatos();

    }, [cargarDatos]);


    function cambiarCampo(campo, valor) {

        setFormulario({
            ...formulario,
            [campo]: valor
        });

        setError("");
        setMensaje("");
    }


    function abrirFormularioNuevo() {

        setFormulario(FORMULARIO_VACIO);
        setEditandoId("");
        setFotosExistentes([]);
        setArchivos([]);
        setMostrarFormulario(true);
        setError("");
        setMensaje("");
    }


    function abrirFormularioEdicion(mascota) {

        setFormulario({
            nombre: mascota.nombre || "",
            descripcion: mascota.descripcion || "",
            especieId: mascota.especieId || "",
            raza: mascota.raza || "",
            edadAproximada: String(mascota.edadAproximada ?? ""),
            tamano: mascota.tamano || "",
            sexo: mascota.sexo || ""
        });

        setEditandoId(mascota.id);
        setFotosExistentes(mascota.fotosUrls || []);
        setArchivos([]);
        setMostrarFormulario(true);
        setError("");
        setMensaje("");
    }


    function cerrarFormulario() {

        setMostrarFormulario(false);
        setEditandoId("");
        setFormulario(FORMULARIO_VACIO);
        setFotosExistentes([]);
        setArchivos([]);
        setError("");
    }


    function manejarArchivos(evento) {

        const seleccionados = Array.from(evento.target.files);

        const total =
            fotosExistentes.length + seleccionados.length;

        if (total > MAXIMO_FOTOS_POR_MASCOTA) {

            setError(
                "Puedes tener como máximo " +
                MAXIMO_FOTOS_POR_MASCOTA +
                " fotografías por mascota."
            );

            return;
        }

        for (const archivo of seleccionados) {

            const errorArchivo = validarImagen(archivo);

            if (errorArchivo !== "") {

                setError(errorArchivo);

                return;
            }
        }

        setError("");

        setArchivos(seleccionados);
    }


    function quitarFotoExistente(url) {

        setFotosExistentes(
            fotosExistentes.filter(
                (foto) => foto !== url
            )
        );
    }


    function validarFormulario() {

        const nombre = formulario.nombre.trim();

        if (nombre.length < 2) {
            return "El nombre de la mascota debe tener al menos 2 caracteres.";
        }

        if (nombre.length > 50) {
            return "El nombre no puede superar los 50 caracteres.";
        }

        if (formulario.descripcion.trim().length < 20) {
            return "La descripción debe tener al menos 20 caracteres.";
        }

        if (formulario.descripcion.trim().length > 600) {
            return "La descripción no puede superar los 600 caracteres.";
        }

        if (formulario.especieId === "") {
            return "Selecciona la especie de la mascota.";
        }

        const edad = Number(formulario.edadAproximada);

        if (
            formulario.edadAproximada === "" ||
            Number.isNaN(edad) ||
            edad < 0 ||
            edad > 25
        ) {
            return "Ingresa una edad aproximada entre 0 y 25 años.";
        }

        if (formulario.tamano === "") {
            return "Selecciona el tamaño de la mascota.";
        }

        if (formulario.sexo === "") {
            return "Selecciona el sexo de la mascota.";
        }

        if (
            fotosExistentes.length === 0 &&
            archivos.length === 0
        ) {
            return "Agrega al menos una fotografía de la mascota.";
        }

        return "";
    }


    async function manejarGuardar(evento) {

        evento.preventDefault();

        if (guardando) {
            return;
        }

        setError("");
        setMensaje("");

        const errorFormulario = validarFormulario();

        if (errorFormulario !== "") {

            setError(errorFormulario);

            return;
        }

        try {

            setGuardando(true);

            let urls = [...fotosExistentes];

            if (archivos.length > 0) {

                const nuevasUrls = await subirFotosMascota(
                    albergue.id,
                    archivos
                );

                urls = urls.concat(nuevasUrls);
            }

            const datos = {
                albergueId: albergue.id,
                nombre: formulario.nombre.trim(),
                descripcion: formulario.descripcion.trim(),
                especieId: formulario.especieId,
                raza: formulario.raza.trim(),
                edadAproximada: Number(formulario.edadAproximada),
                tamano: formulario.tamano,
                sexo: formulario.sexo,
                fotosUrls: urls,
                departamentoId: albergue.departamentoId,
                municipioId: albergue.municipioId
            };

            if (editandoId !== "") {

                await actualizarMascota(editandoId, datos);

                setMensaje("La mascota se actualizó correctamente.");

            } else {

                await registrarMascota(datos);

                setMensaje("La mascota se registró correctamente.");
            }

            cerrarFormulario();

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al guardar la mascota:",
                error
            );

            setError(
                error.message ||
                "No se pudo guardar la mascota. Inténtalo nuevamente."
            );

        } finally {

            setGuardando(false);
        }
    }


    async function cambiarEstado(mascota, estado) {

        try {

            await actualizarEstadoMascota(mascota.id, estado);

            setMensaje(
                "El estado de " + mascota.nombre + " se actualizó."
            );

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al cambiar el estado:",
                error
            );

            setError("No se pudo cambiar el estado de la mascota.");
        }
    }


    async function darDeBaja(mascota) {

        try {

            await darDeBajaMascota(mascota.id);

            setMensaje(
                mascota.nombre + " ya no aparece en el catálogo."
            );

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al dar de baja la mascota:",
                error
            );

            setError("No se pudo dar de baja la mascota.");
        }
    }


    function obtenerNombreEspecie(id) {

        for (const especie of especies) {

            if (especie.id === id) {
                return especie.nombre;
            }
        }

        return "Sin especie";
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando tus mascotas...
                </p>

            </main>
        );
    }


    if (!albergue) {

        return (
            <main className="mascotas-admin-page">

                <div className="mascotas-admin-container">

                    <div className="mascotas-admin-empty">

                        <div className="mascotas-admin-empty-icon">
                            !
                        </div>

                        <h2>
                            Todavía no registraste tu albergue
                        </h2>

                        <p>
                            Antes de publicar mascotas necesitas
                            registrar la información de tu refugio
                            y esperar su verificación.
                        </p>

                        <button
                            type="button"
                            className="mascotas-admin-primary"
                            onClick={() => navigate("/albergue")}
                        >
                            Registrar mi albergue
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    if (albergue.estadoVerificacion !== "Verificado") {

        return (
            <main className="mascotas-admin-page">

                <div className="mascotas-admin-container">

                    <div className="mascotas-admin-empty">

                        <div className="mascotas-admin-empty-icon">
                            ⏳
                        </div>

                        <h2>
                            Tu albergue todavía no está verificado
                        </h2>

                        <p>
                            Solo los refugios verificados por la
                            administración pueden publicar mascotas.
                            Puedes consultar el estado de tu solicitud
                            desde la sección Mi albergue.
                        </p>

                        <button
                            type="button"
                            className="mascotas-admin-primary"
                            onClick={() => navigate("/albergue")}
                        >
                            Consultar estado
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    return (
        <main className="mascotas-admin-page">

            <div className="mascotas-admin-container">

                <header className="mascotas-admin-header">

                    <div>

                        <span className="mascotas-admin-label">
                            RED HUELLA / MIS MASCOTAS
                        </span>

                        <h1>
                            Mascotas de {albergue.nombreRefugio}
                        </h1>

                        <p>
                            Registra, actualiza y administra el estado
                            de adopción de los animales de tu refugio.
                        </p>

                    </div>

                    <div className="mascotas-admin-counter">

                        <strong>
                            {mascotas.length}
                        </strong>

                        <span>
                            publicadas
                        </span>

                    </div>

                </header>


                {mensaje !== "" && (
                    <div className="mascotas-admin-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && !mostrarFormulario && (
                    <div className="mascotas-admin-error">
                        {error}
                    </div>
                )}


                {!mostrarFormulario && (

                    <button
                        type="button"
                        className="mascotas-admin-primary"
                        onClick={abrirFormularioNuevo}
                    >
                        + Registrar una mascota
                    </button>
                )}


                {mostrarFormulario && (

                    <section className="mascotas-admin-form">

                        <div className="mascotas-admin-form-header">

                            <span className="mascotas-admin-label">
                                {editandoId !== ""
                                    ? "EDITANDO"
                                    : "NUEVO REGISTRO"}
                            </span>

                            <h2>
                                {editandoId !== ""
                                    ? "Actualizar mascota"
                                    : "Registrar una mascota"}
                            </h2>

                        </div>

                        <form onSubmit={manejarGuardar}>

                            <div className="mascotas-admin-grid">

                                <div className="mascotas-admin-field">

                                    <label htmlFor="nombre">
                                        Nombre
                                    </label>

                                    <input
                                        id="nombre"
                                        type="text"
                                        value={formulario.nombre}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "nombre",
                                                evento.target.value
                                            )
                                        }
                                        maxLength="50"
                                        placeholder="Ej. Lucas"
                                    />

                                </div>


                                <div className="mascotas-admin-field">

                                    <label htmlFor="especie">
                                        Especie
                                    </label>

                                    <select
                                        id="especie"
                                        value={formulario.especieId}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "especieId",
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecciona una opción
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


                                <div className="mascotas-admin-field">

                                    <label htmlFor="raza">
                                        Raza <span>(opcional)</span>
                                    </label>

                                    <input
                                        id="raza"
                                        type="text"
                                        value={formulario.raza}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "raza",
                                                evento.target.value
                                            )
                                        }
                                        maxLength="50"
                                        placeholder="Ej. Mestizo"
                                    />

                                </div>


                                <div className="mascotas-admin-field">

                                    <label htmlFor="edad">
                                        Edad aproximada (años)
                                    </label>

                                    <input
                                        id="edad"
                                        type="number"
                                        min="0"
                                        max="25"
                                        step="1"
                                        value={formulario.edadAproximada}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "edadAproximada",
                                                evento.target.value
                                            )
                                        }
                                        placeholder="Ej. 2"
                                    />

                                </div>


                                <div className="mascotas-admin-field">

                                    <label htmlFor="tamano">
                                        Tamaño
                                    </label>

                                    <select
                                        id="tamano"
                                        value={formulario.tamano}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "tamano",
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecciona una opción
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


                                <div className="mascotas-admin-field">

                                    <label htmlFor="sexo">
                                        Sexo
                                    </label>

                                    <select
                                        id="sexo"
                                        value={formulario.sexo}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "sexo",
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecciona una opción
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


                                <div className="mascotas-admin-field mascotas-admin-field-full">

                                    <label htmlFor="descripcion">
                                        Descripción
                                    </label>

                                    <textarea
                                        id="descripcion"
                                        rows="4"
                                        value={formulario.descripcion}
                                        onChange={(evento) =>
                                            cambiarCampo(
                                                "descripcion",
                                                evento.target.value
                                            )
                                        }
                                        maxLength="600"
                                        placeholder="Cuenta su historia, su carácter y los cuidados que necesita."
                                    />

                                    <small>
                                        Entre 20 y 600 caracteres.
                                    </small>

                                </div>


                                <div className="mascotas-admin-field mascotas-admin-field-full">

                                    <label htmlFor="fotos">
                                        Fotografías
                                    </label>

                                    <input
                                        id="fotos"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        multiple
                                        onChange={manejarArchivos}
                                    />

                                    <small>
                                        JPG o PNG, hasta 3 MB cada una.
                                        Máximo {MAXIMO_FOTOS_POR_MASCOTA} fotografías.
                                    </small>

                                    {fotosExistentes.length > 0 && (

                                        <div className="mascotas-admin-fotos">

                                            {fotosExistentes.map((foto) => (

                                                <div
                                                    key={foto}
                                                    className="mascotas-admin-foto"
                                                >
                                                    <img
                                                        src={foto}
                                                        alt="Fotografía de la mascota"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            quitarFotoExistente(foto)
                                                        }
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>

                                            ))}

                                        </div>
                                    )}

                                    {archivos.length > 0 && (

                                        <p className="mascotas-admin-nuevas">
                                            {archivos.length} fotografía(s) nueva(s)
                                            por subir.
                                        </p>
                                    )}

                                </div>

                            </div>


                            {error !== "" && (
                                <div className="mascotas-admin-error">
                                    {error}
                                </div>
                            )}


                            <div className="mascotas-admin-actions">

                                <button
                                    type="submit"
                                    className="mascotas-admin-save"
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : "Guardar mascota"}
                                </button>

                                <button
                                    type="button"
                                    className="mascotas-admin-cancel"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </section>
                )}


                {mascotas.length === 0 && !mostrarFormulario && (

                    <div className="mascotas-admin-empty">

                        <div className="mascotas-admin-empty-icon">
                            00
                        </div>

                        <h2>
                            Todavía no publicaste ninguna mascota
                        </h2>

                        <p>
                            Registra la primera para que aparezca
                            en el catálogo público.
                        </p>

                    </div>
                )}


                {mascotas.length > 0 && (

                    <div className="mascotas-admin-list">

                        {mascotas.map((mascota) => (

                            <article
                                key={mascota.id}
                                className="mascotas-admin-card"
                            >

                                <div className="mascotas-admin-card-image">

                                    <img
                                        src={
                                            mascota.fotosUrls &&
                                            mascota.fotosUrls.length > 0
                                                ? mascota.fotosUrls[0]
                                                : "/imagenes/hero-mascota.png"
                                        }
                                        alt={mascota.nombre}
                                    />

                                </div>

                                <div className="mascotas-admin-card-body">

                                    <div className="mascotas-admin-card-header">

                                        <h3>
                                            {mascota.nombre}
                                        </h3>

                                        <span
                                            className={
                                                "mascotas-admin-estado mascotas-admin-estado-" +
                                                mascota.estadoAdopcion
                                                    .toLowerCase()
                                                    .replace(" ", "-")
                                            }
                                        >
                                            {mascota.estadoAdopcion}
                                        </span>

                                    </div>

                                    <div className="mascotas-admin-card-datos">

                                        <span>
                                            {obtenerNombreEspecie(
                                                mascota.especieId
                                            )}
                                        </span>

                                        <span>
                                            {mascota.sexo}
                                        </span>

                                        <span>
                                            {mascota.edadCategoria}
                                        </span>

                                        <span>
                                            {mascota.tamano}
                                        </span>

                                    </div>

                                    <p>
                                        {mascota.descripcion}
                                    </p>

                                    <div className="mascotas-admin-card-actions">

                                        <select
                                            value={mascota.estadoAdopcion}
                                            onChange={(evento) =>
                                                cambiarEstado(
                                                    mascota,
                                                    evento.target.value
                                                )
                                            }
                                        >
                                            {ESTADOS_ADOPCION.map((estado) => (

                                                <option
                                                    key={estado}
                                                    value={estado}
                                                >
                                                    {estado}
                                                </option>

                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                abrirFormularioEdicion(mascota)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="mascotas-admin-baja"
                                            onClick={() =>
                                                darDeBaja(mascota)
                                            }
                                        >
                                            Dar de baja
                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}

export default MisMascotas;
