import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import {
    obtenerEspecies,
    crearEspecie,
    actualizarEspecie
} from "../../services/especieService";

import "../../styles/gestion-especies.css";

function GestionEspecies() {

    const { perfil } = useAuth();

    const [especies, setEspecies] = useState([]);

    const [nombre, setNombre] = useState("");

    const [editandoId, setEditandoId] = useState("");

    const [nombreEditado, setNombreEditado] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    async function cargarEspecies() {

        try {

            const resultado =
                await obtenerEspecies();

            setEspecies(resultado);

        } catch (error) {

            console.error(
                "ERROR AL CARGAR ESPECIES:",
                error
            );

            setError(
                "No se pudieron cargar las especies."
            );

        } finally {

            setCargando(false);
        }
    }

    useEffect(() => {

        cargarEspecies();

    }, []);

    function validarNombre(nombreEspecie) {

        const nombreLimpio =
            nombreEspecie.trim();

        if (nombreLimpio === "") {
            return "Ingresa el nombre de la especie.";
        }

        if (nombreLimpio.length < 3) {
            return "El nombre debe tener al menos 3 caracteres.";
        }

        if (nombreLimpio.length > 50) {
            return "El nombre no puede superar los 50 caracteres.";
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(nombreLimpio)) {
            return "El nombre solo puede contener letras y espacios.";
        }

        return "";
    }

    async function guardarNuevaEspecie(evento) {

        evento.preventDefault();

        setError("");
        setMensaje("");

        const nombreLimpio =
            nombre.trim();

        const errorNombre =
            validarNombre(nombreLimpio);

        if (errorNombre !== "") {

            setError(errorNombre);

            return;
        }

        setGuardando(true);

        try {

            await crearEspecie(nombreLimpio);

            setNombre("");

            setMensaje(
                "La especie fue creada correctamente."
            );

            await cargarEspecies();

        } catch (error) {

            console.error(
                "ERROR AL CREAR ESPECIE:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setGuardando(false);
        }
    }

    function iniciarEdicion(especie) {

        setEditandoId(especie.id);

        setNombreEditado(
            especie.nombre
        );

        setError("");
        setMensaje("");
    }

    function cancelarEdicion() {

        setEditandoId("");

        setNombreEditado("");

        setError("");
    }

    async function guardarEdicion(especie) {

        setError("");
        setMensaje("");

        const nombreLimpio =
            nombreEditado.trim();

        const errorNombre =
            validarNombre(nombreLimpio);

        if (errorNombre !== "") {

            setError(errorNombre);

            return;
        }

        setGuardando(true);

        try {

            await actualizarEspecie(
                especie.id,
                nombreLimpio,
                especie.activo
            );

            setEditandoId("");

            setNombreEditado("");

            setMensaje(
                "La especie fue actualizada correctamente."
            );

            await cargarEspecies();

        } catch (error) {

            console.error(
                "ERROR AL ACTUALIZAR ESPECIE:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setGuardando(false);
        }
    }

    async function cambiarEstado(especie) {

        setError("");
        setMensaje("");

        setGuardando(true);

        try {

            await actualizarEspecie(
                especie.id,
                especie.nombre,
                !especie.activo
            );

            setMensaje(
                especie.activo
                    ? "La especie fue deshabilitada correctamente."
                    : "La especie fue habilitada correctamente."
            );

            await cargarEspecies();

        } catch (error) {

            console.error(
                "ERROR AL CAMBIAR ESTADO:",
                error
            );

            setError(
                "No se pudo cambiar el estado de la especie."
            );

        } finally {

            setGuardando(false);
        }
    }

    if (cargando) {

        return (
            <main className="species-page">

                <section className="species-container">

                    <div className="species-loading">

                        <div className="species-loading-spinner"></div>

                        <p>
                            Cargando catálogo...
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
            <main className="species-page">

                <section className="species-container">

                    <div className="species-empty">

                        <div className="species-empty-icon">
                            !
                        </div>

                        <h1>
                            Acceso no permitido
                        </h1>

                        <p>
                            Solo un administrador puede gestionar
                            las especies del sistema.
                        </p>

                    </div>

                </section>

            </main>
        );
    }

    const especiesActivas =
        especies.filter(
            (especie) => especie.activo
        ).length;

    const especiesInactivas =
        especies.length - especiesActivas;

    return (
        <main className="species-page">

            <section className="species-container">

                <header className="species-header">

                    <div>

                        <span className="species-label">
                            RED HUELLA / CATÁLOGO
                        </span>

                        <h1>
                            Gestión de especies
                        </h1>

                        <p>
                            Administra las especies disponibles
                            para los procesos de adopción.
                        </p>

                    </div>

                    <div className="species-header-count">

                        <strong>
                            {especies.length}
                        </strong>

                        <span>
                            especies registradas
                        </span>

                    </div>

                </header>


                {error !== "" && (

                    <div className="species-alert species-alert-error">

                        <span className="species-alert-icon">
                            !
                        </span>

                        <div>

                            <strong>
                                No se pudo completar la operación
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {mensaje !== "" && (

                    <div className="species-alert species-alert-success">

                        <span className="species-alert-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                Operación completada
                            </strong>

                            <p>
                                {mensaje}
                            </p>

                        </div>

                    </div>

                )}


                <section className="species-stats">

                    <div className="species-stat">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            {especies.length}
                        </strong>

                        <small>
                            Registradas en el catálogo
                        </small>

                    </div>


                    <div className="species-stat">

                        <span>
                            ACTIVAS
                        </span>

                        <strong className="species-stat-green">
                            {especiesActivas}
                        </strong>

                        <small>
                            Disponibles para utilizar
                        </small>

                    </div>


                    <div className="species-stat">

                        <span>
                            DESHABILITADAS
                        </span>

                        <strong className="species-stat-muted">
                            {especiesInactivas}
                        </strong>

                        <small>
                            No disponibles actualmente
                        </small>

                    </div>

                </section>


                <div className="species-layout">

                    <aside className="species-create">

                        <div className="species-create-heading">

                            <span className="species-overline">
                                NUEVO REGISTRO
                            </span>

                            <h2>
                                Agregar especie
                            </h2>

                            <p>
                                Añade una nueva especie al catálogo
                                de Red Huella.
                            </p>

                        </div>

                        <form
                            onSubmit={guardarNuevaEspecie}
                        >

                            <div className="species-form-group">

                                <label htmlFor="nombreEspecie">
                                    Nombre
                                </label>

                                <input
                                    id="nombreEspecie"
                                    type="text"
                                    value={nombre}
                                    onChange={(evento) => {
                                        setNombre(
                                            evento.target.value
                                        );

                                        setError("");
                                        setMensaje("");
                                    }}
                                    placeholder="Ej. Loro"
                                    maxLength="50"
                                    disabled={guardando}
                                />

                                <small>
                                    Solo letras y espacios.
                                </small>

                            </div>

                            <button
                                type="submit"
                                className="species-create-button"
                                disabled={guardando}
                            >
                                {guardando
                                    ? "Guardando..."
                                    : "Agregar especie"}
                            </button>

                        </form>

                    </aside>


                    <section className="species-list-section">

                        <div className="species-list-header">

                            <div>

                                <span className="species-overline">
                                    CATÁLOGO
                                </span>

                                <h2>
                                    Especies registradas
                                </h2>

                            </div>

                            <span className="species-list-count">
                                {especies.length}
                            </span>

                        </div>


                        {especies.length === 0 ? (

                            <div className="species-no-results">

                                <h3>
                                    El catálogo está vacío
                                </h3>

                                <p>
                                    Agrega la primera especie utilizando
                                    el formulario.
                                </p>

                            </div>

                        ) : (

                            <div className="species-table">

                                <div className="species-table-head">

                                    <span>
                                        ESPECIE
                                    </span>

                                    <span>
                                        ESTADO
                                    </span>

                                    <span>
                                        ACCIONES
                                    </span>

                                </div>


                                {especies.map((especie) => (

                                    <div
                                        className={
                                            editandoId === especie.id
                                                ? "species-row species-row-editing"
                                                : "species-row"
                                        }
                                        key={especie.id}
                                    >

                                        {editandoId === especie.id ? (

                                            <div className="species-edit">

                                                <input
                                                    type="text"
                                                    value={nombreEditado}
                                                    onChange={(evento) => {
                                                        setNombreEditado(
                                                            evento.target.value
                                                        );

                                                        setError("");
                                                        setMensaje("");
                                                    }}
                                                    maxLength="50"
                                                    autoFocus
                                                    disabled={guardando}
                                                />

                                                <div className="species-edit-actions">

                                                    <button
                                                        type="button"
                                                        className="species-save-button"
                                                        disabled={guardando}
                                                        onClick={() =>
                                                            guardarEdicion(
                                                                especie
                                                            )
                                                        }
                                                    >
                                                        {guardando
                                                            ? "Guardando..."
                                                            : "Guardar"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="species-cancel-button"
                                                        disabled={guardando}
                                                        onClick={
                                                            cancelarEdicion
                                                        }
                                                    >
                                                        Cancelar
                                                    </button>

                                                </div>

                                            </div>

                                        ) : (

                                            <>
                                                <div className="species-name">

                                                    <div className="species-name-mark">
                                                        {especie.nombre
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {especie.nombre}
                                                        </strong>

                                                        <small>
                                                            Catálogo de especies
                                                        </small>

                                                    </div>

                                                </div>


                                                <div>

                                                    <span
                                                        className={
                                                            especie.activo
                                                                ? "species-status species-status-active"
                                                                : "species-status species-status-inactive"
                                                        }
                                                    >
                                                        <span></span>

                                                        {especie.activo
                                                            ? "Activa"
                                                            : "Deshabilitada"}
                                                    </span>

                                                </div>


                                                <div className="species-actions">

                                                    <button
                                                        type="button"
                                                        className="species-edit-button"
                                                        disabled={guardando}
                                                        onClick={() =>
                                                            iniciarEdicion(
                                                                especie
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            especie.activo
                                                                ? "species-disable-button"
                                                                : "species-enable-button"
                                                        }
                                                        disabled={guardando}
                                                        onClick={() =>
                                                            cambiarEstado(
                                                                especie
                                                            )
                                                        }
                                                    >
                                                        {especie.activo
                                                            ? "Deshabilitar"
                                                            : "Habilitar"}
                                                    </button>

                                                </div>
                                            </>

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                </div>

            </section>

        </main>
    );
}

export default GestionEspecies;