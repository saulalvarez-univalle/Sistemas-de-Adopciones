import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registrarUsuario } from "../services/authService";

function Registro() {
    const navigate = useNavigate();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [rol, setRol] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [aceptaTerminos, setAceptaTerminos] = useState(false);

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    function validarNombre() {
        const nombre = nombreCompleto.trim();

        if (nombre === "") {
            return "El nombre completo es obligatorio.";
        }

        if (nombre.length < 3) {
            return "El nombre completo debe tener al menos 3 caracteres.";
        }

        if (nombre.length > 100) {
            return "El nombre completo no puede superar los 100 caracteres.";
        }

        const formatoNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

        if (!formatoNombre.test(nombre)) {
            return "El nombre solo puede contener letras y espacios.";
        }

        return "";
    }

    function validarEmail() {
        const correo = email.trim();

        if (correo === "") {
            return "El correo electrónico es obligatorio.";
        }

        if (correo.length > 150) {
            return "El correo electrónico es demasiado largo.";
        }

        const formatoEmail =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

        if (!formatoEmail.test(correo)) {
            return "Ingresa un correo electrónico válido.";
        }

        return "";
    }

    function validarTelefono() {
        const numero = telefono.trim();

        if (numero === "") {
            return "El número de celular es obligatorio.";
        }

        const formatoTelefono = /^[567][0-9]{7}$/;

        if (!formatoTelefono.test(numero)) {
            return "El celular debe tener 8 dígitos y comenzar con 5, 6 o 7.";
        }

        return "";
    }

    function validarPassword() {
        if (password === "") {
            return "La contraseña es obligatoria.";
        }

        if (password.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }

        if (!/[A-Z]/.test(password)) {
            return "La contraseña debe contener al menos una mayúscula.";
        }

        if (!/[a-z]/.test(password)) {
            return "La contraseña debe contener al menos una minúscula.";
        }

        if (!/[0-9]/.test(password)) {
            return "La contraseña debe contener al menos un número.";
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(password)) {
            return "La contraseña debe contener al menos un símbolo especial.";
        }

        return "";
    }

    function validarFormulario() {
        const errorNombre = validarNombre();

        if (errorNombre !== "") {
            return errorNombre;
        }

        const errorEmail = validarEmail();

        if (errorEmail !== "") {
            return errorEmail;
        }

        const errorTelefono = validarTelefono();

        if (errorTelefono !== "") {
            return errorTelefono;
        }

        if (rol === "") {
            return "Selecciona el tipo de cuenta.";
        }

        const errorPassword = validarPassword();

        if (errorPassword !== "") {
            return errorPassword;
        }

        if (confirmarPassword === "") {
            return "Confirma tu contraseña.";
        }

        if (password !== confirmarPassword) {
            return "Las contraseñas no coinciden.";
        }

        if (!aceptaTerminos) {
            return "Debes aceptar los términos y condiciones.";
        }

        return "";
    }

    async function manejarRegistro(evento) {
        evento.preventDefault();

        if (cargando) {
            return;
        }

        setError("");

        const errorFormulario = validarFormulario();

        if (errorFormulario !== "") {
            setError(errorFormulario);
            return;
        }

        setCargando(true);

        try {
            await registrarUsuario(
                nombreCompleto.trim(),
                email.trim().toLowerCase(),
                telefono.trim(),
                rol,
                "",
                "",
                password
            );

            navigate("/login", {
                state: {
                    mensaje:
                        "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión."
                }
            });
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setError("Este correo electrónico ya está registrado.");
            } else if (error.code === "auth/invalid-email") {
                setError("El correo electrónico no es válido.");
            } else if (error.code === "auth/weak-password") {
                setError("La contraseña no cumple los requisitos de seguridad.");
            } else if (error.code === "auth/network-request-failed") {
                setError(
                    "No se pudo conectar con el servidor. Revisa tu conexión a Internet."
                );
            } else {
                setError(
                    "No se pudo crear la cuenta. Intenta nuevamente."
                );
            }
        }

        setCargando(false);
    }

    return (
        <main className="auth-page">

            <section className="auth-container">

                <div className="auth-brand-panel">

                    <div className="auth-brand-content">
                        <div className="brand-mark">
                            🐾
                        </div>

                        <h1>Refugios que conectan<br />con nuevos hogares.</h1>

                        <p>
                            Crea tu cuenta y forma parte de una plataforma
                            dedicada al bienestar y adopción responsable
                            de mascotas.
                        </p>

                        <div className="auth-benefits">
                            <div>
                                <span>✓</span>
                                Información centralizada
                            </div>

                            <div>
                                <span>✓</span>
                                Refugios verificados
                            </div>

                            <div>
                                <span>✓</span>
                                Adopciones responsables
                            </div>
                        </div>
                    </div>

                </div>

                <div className="auth-card">

                    <div className="auth-header">
                        <span className="auth-eyebrow">
                            NUEVA CUENTA
                        </span>

                        <h2>Crear cuenta</h2>

                        <p>
                            Completa tus datos para comenzar.
                        </p>
                    </div>

                    <form onSubmit={manejarRegistro}>

                        <div className="form-group">
                            <label htmlFor="nombre">
                                Nombre completo
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                value={nombreCompleto}
                                onChange={(evento) =>
                                    setNombreCompleto(evento.target.value)
                                }
                                placeholder="Ej. Constanza Olguin Flores"
                                maxLength="100"
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(evento) =>
                                    setEmail(evento.target.value)
                                }
                                placeholder="correo@ejemplo.com"
                                maxLength="150"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">
                                Número de celular
                            </label>

                            <input
                                id="telefono"
                                type="tel"
                                value={telefono}
                                onChange={(evento) => {
                                    const valor = evento.target.value;

                                    if (/^[0-9]*$/.test(valor)) {
                                        setTelefono(valor);
                                    }
                                }}
                                placeholder="Ej. 71234567"
                                maxLength="8"
                                autoComplete="tel"
                            />

                            <small>
                                8 dígitos. Debe comenzar con 5, 6 o 7.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="rol">
                                Tipo de cuenta
                            </label>

                            <select
                                id="rol"
                                value={rol}
                                onChange={(evento) =>
                                    setRol(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                <option value="Adoptante">
                                    Adoptante
                                </option>

                                <option value="Albergue">
                                    Albergue / Refugio
                                </option>

                                <option value="Servicio">
                                    Veterinaria / Tienda / Peluquería
                                </option>
                            </select>

                            <small>
                                Podrás completar la información específica
                                de tu cuenta posteriormente.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <div className="password-container">

                                <input
                                    id="password"
                                    type={
                                        mostrarPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(evento) =>
                                        setPassword(evento.target.value)
                                    }
                                    placeholder="Crea una contraseña segura"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-button"
                                    onClick={() =>
                                        setMostrarPassword(
                                            !mostrarPassword
                                        )
                                    }
                                >
                                    {mostrarPassword
                                        ? "Ocultar"
                                        : "Mostrar"}
                                </button>

                            </div>

                            <small>
                                Mínimo 8 caracteres, una mayúscula,
                                una minúscula, un número y un símbolo.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmarPassword">
                                Confirmar contraseña
                            </label>

                            <div className="password-container">

                                <input
                                    id="confirmarPassword"
                                    type={
                                        mostrarConfirmarPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmarPassword}
                                    onChange={(evento) =>
                                        setConfirmarPassword(
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Repite tu contraseña"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-button"
                                    onClick={() =>
                                        setMostrarConfirmarPassword(
                                            !mostrarConfirmarPassword
                                        )
                                    }
                                >
                                    {mostrarConfirmarPassword
                                        ? "Ocultar"
                                        : "Mostrar"}
                                </button>

                            </div>
                        </div>

                        <label className="terms-check">

                            <input
                                type="checkbox"
                                checked={aceptaTerminos}
                                onChange={(evento) =>
                                    setAceptaTerminos(
                                        evento.target.checked
                                    )
                                }
                            />

                            <span>
                                Acepto los términos y condiciones y la
                                política de privacidad.
                            </span>

                        </label>

                        {error !== "" && (
                            <div className="form-error">
                                <strong>Revisa tus datos</strong>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={cargando}
                        >
                            {cargando
                                ? "Creando cuenta..."
                                : "Crear mi cuenta"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        <span>
                            ¿Ya tienes una cuenta?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="link-button"
                        >
                            Iniciar sesión
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Registro;