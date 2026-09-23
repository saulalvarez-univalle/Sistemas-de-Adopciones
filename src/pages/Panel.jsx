import { Navigate, useNavigate } from "react-router-dom";

import { cerrarSesion } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "../styles/panel.css";

function Panel() {

    const navigate = useNavigate();

    const {
        perfil
    } = useAuth();

    if (
        perfil &&
        (
            perfil.rol === "Admin" ||
            perfil.rol === "Superusuario"
        )
    ) {
        return <Navigate to="/admin" replace />;
    }

    async function manejarCerrarSesion() {

        try {

            await cerrarSesion();

            navigate("/");

        } catch (error) {

            console.error(
                "Error al cerrar sesión:",
                error
            );

        }
    }

    function obtenerTextoRol() {

        if (!perfil) {
            return "";
        }

        if (perfil.rol === "Albergue/Refugio") {
            return "Albergue / Refugio";
        }

        return perfil.rol;
    }

    function mostrarContenido() {

        if (!perfil) {
            return (
                <div className="panel-empty">

                    <div className="panel-empty-icon">
                        !
                    </div>

                    <h2>
                        No se pudo cargar tu perfil
                    </h2>

                    <p>
                        Ocurrió un problema al obtener la información
                        de tu cuenta. Intenta actualizar la página.
                    </p>

                </div>
            );
        }

        if (perfil.rol === "Adoptante") {

            return (
                <>
                    <section className="panel-welcome">

                        <div className="panel-welcome-content">

                            <span className="panel-section-label">
                                ESPACIO PERSONAL
                            </span>

                            <h2>
                                Hola, {perfil.nombreCompleto}
                            </h2>

                            <p>
                                Administra tu cuenta y descubre las
                                funcionalidades disponibles en Red Huella.
                            </p>

                        </div>

                        <div className="panel-welcome-mark">
                            <img
                                src="/imagenes/logo.png"
                                alt=""
                            />
                        </div>

                    </section>

                    <section className="panel-section">

                        <div className="panel-section-heading">

                            <div>
                                <span className="panel-overline">
                                    ACCESOS
                                </span>

                                <h2>
                                    ¿Qué deseas hacer?
                                </h2>
                            </div>

                        </div>

                        <div className="panel-cards">

                            <article className="panel-card">

                                <div className="panel-card-icon">
                                    <span>01</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Mi perfil
                                    </h3>

                                    <p>
                                        Consulta y actualiza tu información
                                        personal y ubicación.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/perfil")}
                                >
                                    Ver perfil
                                    <span>→</span>
                                </button>

                            </article>

                            <article className="panel-card">

                                <div className="panel-card-icon panel-card-icon-green">
                                    <span>02</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Adopciones
                                    </h3>

                                    <p>
                                        Encuentra mascotas que buscan un
                                        nuevo hogar y conoce sus historias.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/")}
                                >
                                    Explorar
                                    <span>→</span>
                                </button>

                            </article>

                            <article className="panel-card">

                                <div className="panel-card-icon panel-card-icon-soft">
                                    <span>03</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Refugios
                                    </h3>

                                    <p>
                                        Conoce los refugios y organizaciones
                                        que forman parte de Red Huella.
                                    </p>

                                </div>

                                <button
    className="panel-card-link"
    onClick={() => navigate("/refugios")}
>
    Ver refugios
    <span>→</span>
</button>
                            </article>

                        </div>

                    </section>
                </>
            );
        }

        if (perfil.rol === "Albergue/Refugio") {

            return (
                <>
                    <section className="panel-welcome panel-welcome-refuge">

                        <div className="panel-welcome-content">

                            <span className="panel-section-label">
                                ESPACIO DEL ALBERGUE
                            </span>

                            <h2>
                                Hola, {perfil.nombreCompleto}
                            </h2>

                            <p>
                                Gestiona la información de tu refugio
                                y mantén actualizados sus datos en
                                Red Huella.
                            </p>

                        </div>

                        <div className="panel-role-badge">
                            <span className="panel-status-dot"></span>
                            {obtenerTextoRol()}
                        </div>

                    </section>

                    <section className="panel-section">

                        <div className="panel-section-heading">

                            <div>
                                <span className="panel-overline">
                                    GESTIÓN
                                </span>

                                <h2>
                                    Administración del albergue
                                </h2>
                            </div>

                        </div>

                        <div className="panel-cards">

                            <article className="panel-card panel-card-featured">

                                <div className="panel-card-icon panel-card-icon-green">
                                    <span>01</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Mi albergue
                                    </h3>

                                    <p>
                                        Administra el nombre, descripción,
                                        ubicación, contacto y horarios
                                        de atención.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/albergue")}
                                >
                                    Gestionar albergue
                                    <span>→</span>
                                </button>

                            </article>

                            <article className="panel-card">

                                <div className="panel-card-icon panel-card-icon-soft">
                                    <span>02</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Verificación
                                    </h3>

                                    <p>
                                        Consulta el estado de revisión de
                                        la información registrada para tu
                                        albergue.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/albergue")}
                                >
                                    Consultar estado
                                    <span>→</span>
                                </button>

                            </article>

                            <article className="panel-card">

                                <div className="panel-card-icon">
                                    <span>03</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Mi perfil
                                    </h3>

                                    <p>
                                        Actualiza tus datos personales y
                                        la información territorial de tu
                                        cuenta.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/perfil")}
                                >
                                    Ver perfil
                                    <span>→</span>
                                </button>

                            </article>

                        </div>

                    </section>
                </>
            );
        }

        if (perfil.rol === "Servicio") {

            return (
                <>
                    <section className="panel-welcome panel-welcome-service">

                        <div className="panel-welcome-content">

                            <span className="panel-section-label">
                                ESPACIO PROFESIONAL
                            </span>

                            <h2>
                                Hola, {perfil.nombreCompleto}
                            </h2>

                            <p>
                                Gestiona tu cuenta y prepara la información
                                de tu servicio para formar parte de Red Huella.
                            </p>

                        </div>

                        <div className="panel-role-badge">
                            <span className="panel-status-dot"></span>
                            Servicio
                        </div>

                    </section>

                    <section className="panel-section">

                        <div className="panel-section-heading">

                            <div>
                                <span className="panel-overline">
                                    MI CUENTA
                                </span>

                                <h2>
                                    Accesos disponibles
                                </h2>
                            </div>

                        </div>

                        <div className="panel-cards panel-cards-two">

                            <article className="panel-card">

                                <div className="panel-card-icon panel-card-icon-green">
                                    <span>01</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Mi servicio
                                    </h3>

                                    <p>
                                        Próximamente podrás registrar y
                                        administrar tu veterinaria, tienda
                                        o peluquería.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/")}
                                >
                                    Volver al inicio
                                    <span>→</span>
                                </button>

                            </article>

                            <article className="panel-card">

                                <div className="panel-card-icon panel-card-icon-soft">
                                    <span>02</span>
                                </div>

                                <div className="panel-card-content">

                                    <h3>
                                        Mi perfil
                                    </h3>

                                    <p>
                                        Consulta y actualiza tus datos
                                        personales y ubicación.
                                    </p>

                                </div>

                                <button
                                    className="panel-card-link"
                                    onClick={() => navigate("/perfil")}
                                >
                                    Ver perfil
                                    <span>→</span>
                                </button>

                            </article>

                        </div>

                    </section>
                </>
            );
        }

        return (
            <div className="panel-empty">

                <div className="panel-empty-icon">
                    !
                </div>

                <h2>
                    Cuenta sin configuración
                </h2>

                <p>
                    Tu tipo de cuenta todavía no tiene un panel
                    configurado.
                </p>

            </div>
        );
    }

    return (
        <main className="panel-page">

            <section className="panel-container">

                <header className="panel-header">

                    <div className="panel-header-brand">

                        <span className="panel-label">
                            RED HUELLA
                        </span>

                        <h1>
                            Mi panel
                        </h1>

                    </div>

                    <div className="panel-header-user">

                        {perfil && (
                            <div className="panel-user-info">

                                <span>
                                    {perfil.nombreCompleto}
                                </span>

                                <small>
                                    {obtenerTextoRol()}
                                </small>

                            </div>
                        )}

                        <button
                            className="panel-logout"
                            onClick={manejarCerrarSesion}
                        >
                            Cerrar sesión
                        </button>

                    </div>

                </header>

                {mostrarContenido()}

            </section>

        </main>
    );
}

export default Panel;