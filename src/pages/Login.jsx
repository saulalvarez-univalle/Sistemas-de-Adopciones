import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { iniciarSesion } from "../services/authService";
import "../styles/login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const mensajeRegistro = location.state?.mensaje || "";

    function validarFormulario() {
        const correo = email.trim();

        if (correo === "") {
            return "Ingresa tu correo electrónico.";
        }

        const formatoEmail =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

        if (!formatoEmail.test(correo)) {
            return "Ingresa un correo electrónico válido.";
        }

        if (password === "") {
            return "Ingresa tu contraseña.";
        }

        return "";
    }

    async function manejarLogin(evento) {
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
            const perfil = await iniciarSesion(
                email.trim().toLowerCase(),
                password
            );

            if (perfil.estadoCuenta !== "Activo") {
                setError(
                    "Tu cuenta no se encuentra activa. Comunícate con la administración."
                );

                setCargando(false);
                return;
            }

            if (
                perfil.rol !== "Adoptante" &&
                perfil.rol !== "Albergue/Refugio" &&
                perfil.rol !== "Servicio" &&
                perfil.rol !== "Admin" &&
                perfil.rol !== "Superusuario"
            ) {
                setError(
                    "Tu cuenta tiene un rol no válido. Comunícate con la administración."
                );

                setCargando(false);
                return;
            }

            if (
                perfil.rol === "Admin" ||
                perfil.rol === "Superusuario"
            ) {
                navigate("/admin");
            } else {
                navigate("/panel");
            }

        } catch (error) {

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                setError(
                    "El correo o la contraseña son incorrectos."
                );
            } else if (error.code === "auth/invalid-email") {
                setError(
                    "El correo electrónico no es válido."
                );
            } else if (error.code === "auth/too-many-requests") {
                setError(
                    "Se realizaron demasiados intentos. Espera unos minutos antes de volver a intentarlo."
                );
            } else if (error.code === "auth/network-request-failed") {
                setError(
                    "No se pudo conectar con el servidor. Revisa tu conexión a Internet."
                );
            } else {
                setError(
                    "No se pudo iniciar sesión. Intenta nuevamente."
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

                        <h1>
                            Un hogar puede cambiar
                            <br />
                            una vida.
                        </h1>

                        <p>
                            Encuentra información de refugios,
                            mascotas y servicios dentro de una
                            plataforma pensada para conectar
                            personas con quienes ayudan a los animales.
                        </p>

                        <div className="auth-benefits">

                            <div>
                                <span>✓</span>
                                Refugios verificados
                            </div>

                            <div>
                                <span>✓</span>
                                Información organizada por ubicación
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
                            BIENVENIDO DE NUEVO
                        </span>

                        <h2>Iniciar sesión</h2>

                        <p>
                            Ingresa a tu cuenta para continuar.
                        </p>

                    </div>

                    {mensajeRegistro !== "" && (
                        <div className="form-success">
                            {mensajeRegistro}
                        </div>
                    )}

                    <form onSubmit={manejarLogin}>

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

                            <div className="password-label">

                                <label htmlFor="password">
                                    Contraseña
                                </label>

                                <button
                                    type="button"
                                    className="forgot-button"
                                    onClick={() =>
                                        navigate("/recuperar-password")
                                    }
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>

                            </div>

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
                                        setPassword(
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Ingresa tu contraseña"
                                    autoComplete="current-password"
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

                        </div>

                        {error !== "" && (
                            <div className="form-error">

                                <strong>
                                    No se pudo iniciar sesión
                                </strong>

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={cargando}
                        >
                            {cargando
                                ? "Iniciando sesión..."
                                : "Iniciar sesión"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        <span>
                            ¿Todavía no tienes una cuenta?
                        </span>

                        <button
                            type="button"
                            className="link-button"
                            onClick={() =>
                                navigate("/registro")
                            }
                        >
                            Crear cuenta
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;