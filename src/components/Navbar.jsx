import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { cerrarSesion } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import MenuUsuario from "./MenuUsuario";

import { contarNoLeidas } from "../services/notificacionService";

import "../styles/navbar.css";
import "../styles/notificaciones.css";

function Navbar() {
    const navigate = useNavigate();

    const {
        usuarioFirebase,
        perfil,
        cargando
    } = useAuth();

    const [menuAbierto, setMenuAbierto] = useState(false);

    const [sinLeer, setSinLeer] = useState(0);

    // HU-23. El contador se consulta una vez al montar y cada vez que
    // cambia el usuario. No es tiempo real: con onSnapshot lo sería, pero
    // eso deja una escucha abierta en cada pantalla de la aplicación.
    useEffect(() => {

        if (!usuarioFirebase) {

            setSinLeer(0);

            return;
        }

        async function cargarContador() {

            try {

                setSinLeer(
                    await contarNoLeidas(usuarioFirebase.uid)
                );

            } catch (error) {

                console.error(
                    "Error al contar las notificaciones:",
                    error
                );
            }
        }

        cargarContador();

    }, [usuarioFirebase]);

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

                    <Link
                        to="/mascotas"
                        onClick={cerrarMenu}
                    >
                        Adoptar
                    </Link>

                    <Link
                        to="/refugios"
                        onClick={cerrarMenu}
                    >
                        Refugios
                    </Link>

                    <Link
                        to="/servicios"
                        onClick={cerrarMenu}
                    >
                        Servicios
                    </Link>

                    <Link
                        to="/alertas"
                        onClick={cerrarMenu}
                    >
                        Perdidas
                    </Link>

                    <a
                        href="/#nosotros"
                        onClick={cerrarMenu}
                    >
                        Nosotros
                    </a>

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

                            <MenuUsuario
                                perfil={perfil}
                                sinLeer={sinLeer}
                                alNavegar={cerrarMenu}
                                alCerrarSesion={manejarCerrarSesion}
                            />
                        )}

                    </div>

                </nav>

            </div>

        </header>
    );
}

export default Navbar;