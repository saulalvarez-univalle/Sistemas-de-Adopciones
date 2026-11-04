import { useEffect, useState, useCallback } from "react";

import { useAuth } from "../context/AuthContext";

import {
    obtenerNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas
} from "../services/notificacionService";

import "../styles/notificaciones.css";

import Cargando from "../components/Cargando";

import BarraFiltros from "../components/BarraFiltros";

const ICONOS = {
    Solicitud: "✉",
    Adopcion: "✓",
    Verificacion: "★",
    Moderacion: "!"
};

function Notificaciones() {

    const { usuarioFirebase } = useAuth();

    const [notificaciones, setNotificaciones] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroLectura, setFiltroLectura] = useState("");

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargar = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            setNotificaciones(
                await obtenerNotificaciones(usuarioFirebase.uid)
            );

        } catch (error) {

            console.error(
                "Error al cargar las notificaciones:",
                error
            );

            setError("No se pudieron cargar las notificaciones.");

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargar();

    }, [cargar]);


    function formatearFecha(fecha) {

        if (!fecha || !fecha.seconds) {
            return "";
        }

        const momento = new Date(fecha.seconds * 1000);

        return momento.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }) + " · " + momento.toLocaleTimeString("es-BO", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }


    async function leer(notificacion) {

        if (notificacion.leido === true) {
            return;
        }

        try {

            await marcarComoLeida(notificacion.id);

            await cargar();

        } catch (error) {

            console.error(
                "Error al marcar la notificación:",
                error
            );
        }
    }


    async function leerTodas() {

        try {

            await marcarTodasComoLeidas(usuarioFirebase.uid);

            await cargar();

        } catch (error) {

            console.error(
                "Error al marcar las notificaciones:",
                error
            );
        }
    }


    if (cargando) {

        return (
            <Cargando texto="Cargando notificaciones" />
        );
    }


    const noLeidas = notificaciones.filter(
        (notificacion) => notificacion.leido !== true
    );

    const texto = busqueda.trim().toLowerCase();

    const filtradas = notificaciones.filter((notificacion) => {

        if (filtroTipo !== "" && notificacion.tipo !== filtroTipo) {
            return false;
        }

        if (filtroLectura === "nuevas" && notificacion.leido === true) {
            return false;
        }

        if (filtroLectura === "leidas" && notificacion.leido !== true) {
            return false;
        }

        if (texto === "") {
            return true;
        }

        const campos = [notificacion.titulo, notificacion.mensaje];

        return campos.some(
            (campo) => (campo || "").toLowerCase().includes(texto)
        );
    });


    return (
        <main className="notif-page">

            <div className="notif-container">

                <header className="notif-header">

                    <div>

                        <span className="notif-label">
                            RED HUELLA / NOTIFICACIONES
                        </span>

                        <h1>
                            Tus notificaciones
                        </h1>

                        <p>
                            Los avisos sobre tus solicitudes, verificaciones
                            y reportes.
                        </p>

                    </div>

                    {noLeidas.length > 0 && (

                        <button
                            type="button"
                            className="notif-leer-todas"
                            onClick={leerTodas}
                        >
                            Marcar todas como leídas ({noLeidas.length})
                        </button>
                    )}

                </header>


                {notificaciones.length > 0 && (

                    <BarraFiltros
                        busqueda={busqueda}
                        alBuscar={setBusqueda}
                        marcador="Buscar en tus avisos"
                        campos={[
                            {
                                id: "lectura",
                                etiqueta: "Lectura",
                                valor: filtroLectura,
                                alCambiar: setFiltroLectura,
                                opciones: [
                                    { valor: "", texto: "Todas" },
                                    { valor: "nuevas", texto: "Sin leer" },
                                    { valor: "leidas", texto: "Leídas" }
                                ]
                            },
                            {
                                id: "tipo",
                                etiqueta: "Tipo",
                                valor: filtroTipo,
                                alCambiar: setFiltroTipo,
                                opciones: [
                                    { valor: "", texto: "Todos los tipos" },
                                    { valor: "Solicitud", texto: "Solicitudes" },
                                    { valor: "Adopcion", texto: "Adopciones" },
                                    { valor: "Verificacion", texto: "Verificaciones" },
                                    { valor: "Moderacion", texto: "Moderación" }
                                ]
                            }
                        ]}
                        total={notificaciones.length}
                        mostrados={filtradas.length}
                        sustantivo="avisos"
                    />
                )}


                {error !== "" && (
                    <div className="notif-error">
                        {error}
                    </div>
                )}


                {notificaciones.length === 0 && (

                    <div className="notif-empty">

                        <span className="notif-empty-number">
                            00
                        </span>

                        <strong>
                            No tienes notificaciones
                        </strong>

                        <p>
                            Aquí aparecerán los avisos cuando un refugio
                            responda tus solicitudes o cuando haya novedades
                            sobre tus publicaciones.
                        </p>

                    </div>
                )}


                {filtradas.length > 0 && (

                    <div className="notif-lista">

                        {filtradas.map((notificacion) => (

                            <article
                                key={notificacion.id}
                                className={
                                    notificacion.leido === true
                                        ? "notif-card"
                                        : "notif-card notif-card-nueva"
                                }
                                onClick={() => leer(notificacion)}
                            >

                                <div
                                    className={
                                        "notif-icono notif-icono-" +
                                        (notificacion.tipo || "Solicitud")
                                            .toLowerCase()
                                    }
                                >
                                    {ICONOS[notificacion.tipo] || "•"}
                                </div>

                                <div className="notif-contenido">

                                    <div className="notif-card-header">

                                        <h3>
                                            {notificacion.titulo}
                                        </h3>

                                        {notificacion.leido !== true && (
                                            <span className="notif-punto"></span>
                                        )}

                                    </div>

                                    <p>
                                        {notificacion.mensaje}
                                    </p>

                                    <span className="notif-fecha">
                                        {formatearFecha(
                                            notificacion.fechaCreacion
                                        )}
                                    </span>

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}

export default Notificaciones;
