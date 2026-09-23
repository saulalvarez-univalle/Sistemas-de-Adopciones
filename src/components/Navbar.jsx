import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { cerrarSesion } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "../styles/navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const {
        usuarioFirebase,
        perfil,
        cargando
    } = useAuth();

    const [menuAbierto, setMenuAbierto] = useState(false);

    function cerrarMenu() {
        setMenuAbierto(false);
    }

    async function manejarCerrarSesion() {
        try {
            await cerrarSesion();

            setMenuAbierto(false);

            navigate("/");
        } catch (error) {
            console.error(
                "Error al cerrar sesión:",
                error
            );
        }
    }

    function mostrarMenuUsuario() {

        if (perfil === null) {
            return;
        }

        if (
            perfil.rol === "Admin" ||
            perfil.rol === "Superusuario"
        ) {
            return (
                <>
                    <Link
                        to="/admin"
                        onClick={cerrarMenu}
                    >
                        Administración
                    </Link>
                </>
            );
        }

        if (perfil.rol === "Albergue/Refugio") {
            return (
                <>
                    <Link
                        to="/panel"
                        onClick={cerrarMenu}
                    >
                        Mi panel
                    </Link>

                    <Link
                        to="/albergue"
                        onClick={cerrarMenu}
                    >
                        Mi albergue
                    </Link>
                </>
            );
        }

        return (
            <Link
                to="/panel"
                onClick={cerrarMenu}
            >
                Mi panel
            </Link>
        );
    }

    return (
        <header className="navbar">

            <div className="navbar-container">

                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={cerrarMenu}
                >
                    <img
                        src="/imagenes/logo.png"
                        alt="Red Huella"
                        className="navbar-logo-image"
                    />
                </Link>

                <button
                    className="navbar-menu-button"
                    onClick={() => {
                        setMenuAbierto(!menuAbierto);
                    }}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>

                <nav
                    className={
                        menuAbierto
                            ? "navbar-links navbar-links-open"
                            : "navbar-links"
                    }
                >

                    <Link
                        to="/"
                        onClick={cerrarMenu}
                    >
                        Inicio
                    </Link>

                    <a
                        href="/#nosotros"
                        onClick={cerrarMenu}
                    >
                        Nosotros
                    </a>

                    {usuarioFirebase && mostrarMenuUsuario()}

                    <div className="navbar-actions">

                        {!cargando && !usuarioFirebase && (
                            <>
                                <Link
                                    to="/login"
                                    className="navbar-login"
                                    onClick={cerrarMenu}
                                >
                                    Iniciar sesión
                                </Link>

                                <Link
                                    to="/registro"
                                    className="navbar-register"
                                    onClick={cerrarMenu}
                                >
                                    Crear cuenta
                                </Link>
                            </>
                        )}

                        {usuarioFirebase && (
                            <>
                                <Link
                                    to="/perfil"
                                    className="navbar-profile"
                                    onClick={cerrarMenu}
                                >
                                    Mi perfil
                                </Link>

                                <button
                                    className="navbar-logout"
                                    onClick={manejarCerrarSesion}
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        )}

                    </div>

                </nav>

            </div>

        </header>
    );
}

export default Navbar;