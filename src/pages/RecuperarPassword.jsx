import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../services/firebase";

function RecuperarPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    function validarEmail() {
        const correo = email.trim();

        if (correo === "") {
            return "Ingresa tu correo electrónico.";
        }

        const formatoEmail =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

        if (!formatoEmail.test(correo)) {
            return "Ingresa un correo electrónico válido.";
        }

        return "";
    }

    async function manejarRecuperacion(evento) {
        evento.preventDefault();

        if (cargando) {
            return;
        }

        setError("");
        setMensaje("");

        const errorEmail = validarEmail();

        if (errorEmail !== "") {
            setError(errorEmail);
            return;
        }

        setCargando(true);

        try {
            await sendPasswordResetEmail(
                auth,
                email.trim().toLowerCase()
            );

            setMensaje(
                "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña."
            );

            setEmail("");
        } catch (error) {
            if (error.code === "auth/invalid-email") {
                setError("El correo electrónico no es válido.");
            } else if (
                error.code === "auth/network-request-failed"
            ) {
                setError(
                    "No se pudo conectar con el servidor. Revisa tu conexión a Internet."
                );
            } else {
                setError(
                    "No se pudo procesar la solicitud. Intenta nuevamente."
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
                            🔐
                        </div>

                        <h1>
                            Recupera el acceso
                            <br />
                            a tu cuenta.
                        </h1>

                        <p>
                            Te enviaremos instrucciones para que
                            puedas establecer una nueva contraseña
                            de forma segura.
                        </p>

                    </div>

                </div>

                <div className="auth-card">

                    <div className="auth-header">

                        <span className="auth-eyebrow">
                            RECUPERACIÓN DE CUENTA
                        </span>

                        <h2>
                            ¿Olvidaste tu contraseña?
                        </h2>

                        <p>
                            Introduce el correo asociado a tu cuenta.
                        </p>

                    </div>

                    {mensaje !== "" && (
                        <div className="form-success">
                            {mensaje}
                        </div>
                    )}

                    {error !== "" && (
                        <div className="form-error">
                            <strong>
                                No se pudo procesar la solicitud
                            </strong>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={manejarRecuperacion}>

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

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={cargando}
                        >
                            {cargando
                                ? "Enviando..."
                                : "Enviar instrucciones"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate("/login")}
                        >
                            Volver a iniciar sesión
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default RecuperarPassword;