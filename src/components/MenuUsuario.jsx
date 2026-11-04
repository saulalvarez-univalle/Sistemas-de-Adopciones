import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/menu-usuario.css";

// Los accesos propios de cada rol viven acá dentro, separados de los
// enlaces públicos de la barra. Antes estaban todos en la misma fila y,
// con un administrador conectado, la barra llegaba a mostrar nueve
// enlaces seguidos sin distinguir cuáles eran del sitio y cuáles de la
// cuenta.
const ACCESOS_POR_ROL = {
    "Admin": [
        { ruta: "/admin", texto: "Panel administrativo" },
        { ruta: "/gestion-albergues", texto: "Gestionar refugios" },
        { ruta: "/gestion-servicios", texto: "Gestionar establecimientos" },
        { ruta: "/gestion-mascotas", texto: "Gestionar mascotas" },
        { ruta: "/gestion-especies", texto: "Especies" },
        { ruta: "/admin/solicitudes", texto: "Solicitudes de adopción" },
        { ruta: "/moderacion", texto: "Moderación" },
        { ruta: "/reportes", texto: "Reportes" }
    ],
    "Superusuario": [
        { ruta: "/admin", texto: "Panel administrativo" },
        { ruta: "/gestion-albergues", texto: "Gestionar refugios" },
        { ruta: "/gestion-servicios", texto: "Gestionar establecimientos" },
        { ruta: "/gestion-mascotas", texto: "Gestionar mascotas" },
        { ruta: "/gestion-especies", texto: "Especies" },
        { ruta: "/admin/solicitudes", texto: "Solicitudes de adopción" },
        { ruta: "/moderacion", texto: "Moderación" },
        { ruta: "/reportes", texto: "Reportes" },
        { ruta: "/cargar-datos", texto: "Catálogos base" }
    ],
    "Albergue/Refugio": [
        { ruta: "/panel", texto: "Mi panel" },
        { ruta: "/albergue", texto: "Mi albergue" },
        { ruta: "/mis-mascotas", texto: "Mis mascotas" },
        { ruta: "/solicitudes-albergue", texto: "Solicitudes recibidas" }
    ],
    "Servicio": [
        { ruta: "/panel", texto: "Mi panel" },
        { ruta: "/mi-servicio", texto: "Mi establecimiento" }
    ],
    "Adoptante": [
        { ruta: "/panel", texto: "Mi panel" },
        { ruta: "/favoritos", texto: "Favoritos" },
        { ruta: "/mis-solicitudes", texto: "Mis solicitudes" },
        { ruta: "/mis-adopciones", texto: "Mis adopciones" }
    ]
};

function MenuUsuario({ perfil, sinLeer, alCerrarSesion, alNavegar }) {

    const [abierto, setAbierto] = useState(false);

    const contenedor = useRef(null);

    const nombre = perfil?.nombreCompleto || "Mi cuenta";
    const rol = perfil?.rol || "";

    const accesos = ACCESOS_POR_ROL[rol] || [
        { ruta: "/panel", texto: "Mi panel" }
    ];

    // Cerrar al hacer clic fuera y con Escape: sin esto el menú queda
    // abierto tapando la página y hay que volver a tocar el botón.
    useEffect(() => {

        if (!abierto) {
            return;
        }

        function alClicFuera(evento) {

            if (
                contenedor.current &&
                !contenedor.current.contains(evento.target)
            ) {
                setAbierto(false);
            }
        }

        function alPresionarTecla(evento) {

            if (evento.key === "Escape") {
                setAbierto(false);
            }
        }

        document.addEventListener("mousedown", alClicFuera);
        document.addEventListener("keydown", alPresionarTecla);

        return () => {
            document.removeEventListener("mousedown", alClicFuera);
            document.removeEventListener("keydown", alPresionarTecla);
        };

    }, [abierto]);


    function navegar() {

        setAbierto(false);

        if (alNavegar) {
            alNavegar();
        }
    }


    function inicial() {

        const limpio = nombre.trim();

        return limpio === ""
            ? "?"
            : limpio.charAt(0).toUpperCase();
    }


    return (
        <div
            className="menu-usuario"
            ref={contenedor}
        >

            <button
                type="button"
                className={
                    abierto
                        ? "menu-usuario-boton menu-usuario-boton-abierto"
                        : "menu-usuario-boton"
                }
                onClick={() => setAbierto(!abierto)}
                aria-expanded={abierto}
                aria-haspopup="true"
            >

                <span className="menu-usuario-avatar">

                    {perfil?.fotoPerfilUrl ? (

                        <img
                            src={perfil.fotoPerfilUrl}
                            alt=""
                        />

                    ) : (
                        inicial()
                    )}

                    {sinLeer > 0 && (
                        <span className="menu-usuario-punto"></span>
                    )}

                </span>

                <span className="menu-usuario-texto">

                    <strong>
                        {nombre.split(" ")[0]}
                    </strong>

                    <small>
                        {rol}
                    </small>

                </span>

                <span className="menu-usuario-flecha">
                    ▾
                </span>

            </button>


            {abierto && (

                <div className="menu-usuario-panel">

                    <div className="menu-usuario-cabecera">

                        <strong>
                            {nombre}
                        </strong>

                        <span>
                            {rol}
                        </span>

                    </div>

                    <div className="menu-usuario-grupo">

                        <span className="menu-usuario-titulo">
                            Mi espacio
                        </span>

                        {accesos.map((acceso) => (

                            <Link
                                key={acceso.ruta}
                                to={acceso.ruta}
                                onClick={navegar}
                            >
                                {acceso.texto}
                            </Link>
                        ))}

                    </div>

                    <div className="menu-usuario-grupo">

                        <span className="menu-usuario-titulo">
                            Cuenta
                        </span>

                        <Link
                            to="/notificaciones"
                            onClick={navegar}
                        >
                            Notificaciones

                            {sinLeer > 0 && (
                                <span className="menu-usuario-globo">
                                    {sinLeer > 9 ? "9+" : sinLeer}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/perfil"
                            onClick={navegar}
                        >
                            Mi perfil
                        </Link>

                        <button
                            type="button"
                            className="menu-usuario-salir"
                            onClick={() => {
                                setAbierto(false);
                                alCerrarSesion();
                            }}
                        >
                            Cerrar sesión
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default MenuUsuario;
