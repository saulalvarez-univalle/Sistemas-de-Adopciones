import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { actualizarPerfil } from "../services/userService";
import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

function Perfil() {

    const navigate = useNavigate();

    const {
        usuarioFirebase,
        perfil
    } = useAuth();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [telefono, setTelefono] = useState("");

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {

        async function cargarDatos() {

            try {

                setCargando(true);
                setError("");

                const listaDepartamentos =
                    await obtenerDepartamentos();

                setDepartamentos(listaDepartamentos);

                if (perfil) {

                    setNombreCompleto(
                        perfil.nombreCompleto || ""
                    );

                    setTelefono(
                        perfil.telefono || ""
                    );

                    setDepartamentoId(
                        perfil.departamentoId || ""
                    );

                    setMunicipioId(
                        perfil.municipioId || ""
                    );

                    if (perfil.departamentoId) {

                        const listaMunicipios =
                            await obtenerMunicipios(
                                perfil.departamentoId
                            );

                        setMunicipios(listaMunicipios);
                    }
                }

            } catch (error) {

                console.error(
                    "Error al cargar el perfil:",
                    error
                );

                setError(
                    "No se pudo cargar la información del perfil."
                );

            } finally {

                setCargando(false);

            }
        }

        cargarDatos();

    }, [perfil]);


    async function manejarDepartamento(evento) {

        const nuevoDepartamentoId =
            evento.target.value;

        setDepartamentoId(
            nuevoDepartamentoId
        );

        setMunicipioId("");
        setMunicipios([]);
        setError("");
        setMensaje("");

        if (nuevoDepartamentoId) {

            try {

                const listaMunicipios =
                    await obtenerMunicipios(
                        nuevoDepartamentoId
                    );

                setMunicipios(
                    listaMunicipios
                );

            } catch (error) {

                console.error(
                    "Error al cargar municipios:",
                    error
                );

                setError(
                    "No se pudieron cargar los municipios."
                );
            }
        }
    }


    function validarFormulario() {

        const nombreLimpio =
            nombreCompleto.trim();

        const telefonoLimpio =
            telefono.trim();

        if (nombreLimpio.length < 3) {

            setError(
                "El nombre debe tener al menos 3 caracteres."
            );

            return false;
        }

        if (nombreLimpio.length > 100) {

            setError(
                "El nombre no puede superar los 100 caracteres."
            );

            return false;
        }

        const patronNombre =
            /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (!patronNombre.test(nombreLimpio)) {

            setError(
                "El nombre solo puede contener letras y espacios."
            );

            return false;
        }

        if (!/^[567]\d{7}$/.test(telefonoLimpio)) {

            setError(
                "El teléfono debe tener 8 dígitos y comenzar con 5, 6 o 7."
            );

            return false;
        }

        if (!departamentoId) {

            setError(
                "Selecciona un departamento."
            );

            return false;
        }

        if (!municipioId) {

            setError(
                "Selecciona un municipio."
            );

            return false;
        }

        return true;
    }


    async function manejarGuardar(evento) {

        evento.preventDefault();

        setError("");
        setMensaje("");

        if (!validarFormulario()) {
            return;
        }

        if (!usuarioFirebase) {

            setError(
                "No hay una sesión activa."
            );

            return;
        }

        try {

            setGuardando(true);

            await actualizarPerfil(
                usuarioFirebase.uid,
                nombreCompleto.trim(),
                telefono.trim(),
                departamentoId,
                municipioId
            );

            setMensaje(
                "Tu perfil se actualizó correctamente."
            );

        } catch (error) {

            console.error(
                "Error al actualizar el perfil:",
                error
            );

            setError(
                "No se pudo actualizar el perfil. Inténtalo nuevamente."
            );

        } finally {

            setGuardando(false);

        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando perfil...
                </p>

            </main>
        );
    }


    return (
        <main className="profile-page">

            <section className="profile-container">

                <div className="profile-header">

                    <div>

                        <span className="profile-label">
                            RED HUELLA
                        </span>

                        <h1>
                            Mi perfil
                        </h1>

                        <p>
                            Administra la información de tu cuenta.
                        </p>

                    </div>

                    <button
                        className="profile-back"
                        onClick={() => navigate("/panel")}
                    >
                        Volver al panel
                    </button>

                </div>


                {error && (
                    <div className="profile-message profile-error">
                        {error}
                    </div>
                )}


                {mensaje && (
                    <div className="profile-message profile-success">
                        {mensaje}
                    </div>
                )}


                <form
                    className="profile-form"
                    onSubmit={manejarGuardar}
                >

                    <div className="profile-section">

                        <h2>
                            Información personal
                        </h2>

                        <div className="profile-grid">

                            <div className="profile-field">

                                <label htmlFor="nombreCompleto">
                                    Nombre completo
                                </label>

                                <input
                                    id="nombreCompleto"
                                    type="text"
                                    value={nombreCompleto}
                                    onChange={(evento) => {
                                        setNombreCompleto(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="100"
                                />

                            </div>


                            <div className="profile-field">

                                <label htmlFor="telefono">
                                    Teléfono
                                </label>

                                <input
                                    id="telefono"
                                    type="text"
                                    value={telefono}
                                    onChange={(evento) => {
                                        setTelefono(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="8"
                                />

                            </div>


                            <div className="profile-field profile-field-full">

                                <label>
                                    Correo electrónico
                                </label>

                                <input
                                    type="email"
                                    value={
                                        perfil?.email || ""
                                    }
                                    disabled
                                />

                                <small>
                                    El correo está asociado a tu cuenta
                                    de autenticación.
                                </small>

                            </div>

                        </div>

                    </div>


                    <div className="profile-section">

                        <h2>
                            Ubicación
                        </h2>

                        <div className="profile-grid">

                            <div className="profile-field">

                                <label htmlFor="departamento">
                                    Departamento
                                </label>

                                <select
                                    id="departamento"
                                    value={departamentoId}
                                    onChange={manejarDepartamento}
                                >

                                    <option value="">
                                        Selecciona un departamento
                                    </option>

                                    {departamentos.map(
                                        (departamento) => (
                                            <option
                                                key={departamento.id}
                                                value={departamento.id}
                                            >
                                                {departamento.nombre}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="profile-field">

                                <label htmlFor="municipio">
                                    Municipio
                                </label>

                                <select
                                    id="municipio"
                                    value={municipioId}
                                    onChange={(evento) => {
                                        setMunicipioId(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    disabled={
                                        !departamentoId
                                    }
                                >

                                    <option value="">
                                        Selecciona un municipio
                                    </option>

                                    {municipios.map(
                                        (municipio) => (
                                            <option
                                                key={municipio.id}
                                                value={municipio.id}
                                            >
                                                {municipio.nombre}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </div>


                    <div className="profile-section">

                        <h2>
                            Información de cuenta
                        </h2>

                        <div className="profile-grid">

                            <div className="profile-field">

                                <label>
                                    Tipo de cuenta
                                </label>

                                <input
                                    type="text"
                                    value={
                                        perfil?.rol || ""
                                    }
                                    disabled
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Estado de cuenta
                                </label>

                                <input
                                    type="text"
                                    value={
                                        perfil?.estadoCuenta || ""
                                    }
                                    disabled
                                />

                            </div>

                        </div>

                        <p className="profile-security-note">
                            El tipo y estado de tu cuenta son administrados
                            por el sistema y no pueden modificarse desde
                            este formulario.
                        </p>

                    </div>


                    <div className="profile-actions">

                        <button
                            type="button"
                            className="profile-cancel"
                            onClick={() => navigate("/panel")}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="profile-save"
                            disabled={guardando}
                        >
                            {guardando
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </button>

                    </div>

                </form>

            </section>

        </main>
    );
}

export default Perfil;