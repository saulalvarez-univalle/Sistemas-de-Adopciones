import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import {
    obtenerEspecies,
    crearEspecie,
    actualizarEspecie
} from "../../services/especieService";

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
            <p>
                Cargando especies...
            </p>
        );
    }

    if (
        perfil &&
        perfil.rol !== "Admin" &&
        perfil.rol !== "Superusuario"
    ) {

        return (
            <div>

                <h1>
                    Acceso no permitido
                </h1>

                <p>
                    Solo un administrador puede gestionar
                    las especies.
                </p>

            </div>
        );
    }

    return (
        <div>

            <h1>
                Gestión de especies
            </h1>

            <p>
                Administra las categorías de especies
                disponibles para las mascotas.
            </p>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {mensaje && (
                <p>
                    {mensaje}
                </p>
            )}

            <form
                onSubmit={guardarNuevaEspecie}
            >

                <h2>
                    Nueva especie
                </h2>

                <label>
                    Nombre de la especie
                </label>

                <input
                    type="text"
                    value={nombre}
                    onChange={(evento) => {
                        setNombre(
                            evento.target.value
                        );

                        setError("");
                    }}
                    placeholder="Ej.: Loro"
                />

                <button
                    type="submit"
                    disabled={guardando}
                >
                    {guardando
                        ? "Guardando..."
                        : "Crear especie"}
                </button>

            </form>

            <hr />

            <h2>
                Especies registradas
            </h2>

            {especies.length === 0 ? (

                <p>
                    No existen especies registradas.
                </p>

            ) : (

                especies.map((especie) => (

                    <div
                        key={especie.id}
                    >

                        {editandoId === especie.id ? (

                            <div>

                                <input
                                    type="text"
                                    value={nombreEditado}
                                    onChange={(evento) => {
                                        setNombreEditado(
                                            evento.target.value
                                        );

                                        setError("");
                                    }}
                                />

                                <button
                                    type="button"
                                    disabled={guardando}
                                    onClick={() =>
                                        guardarEdicion(
                                            especie
                                        )
                                    }
                                >
                                    Guardar
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        cancelarEdicion
                                    }
                                >
                                    Cancelar
                                </button>

                            </div>

                        ) : (

                            <div>

                                <p>
                                    <strong>
                                        {especie.nombre}
                                    </strong>
                                </p>

                                <p>
                                    Estado:{" "}
                                    {especie.activo
                                        ? "Activa"
                                        : "Deshabilitada"}
                                </p>

                                <button
                                    type="button"
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

                        )}

                        <hr />

                    </div>

                ))
            )}

        </div>
    );
}

export default GestionEspecies;