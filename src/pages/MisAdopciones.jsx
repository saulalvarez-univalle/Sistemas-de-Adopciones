import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenerAdopcionesConcretadas } from "../services/solicitudService";
import { obtenerMascota } from "../services/mascotaService";
import { obtenerAlberguePorId } from "../services/albergueService";

import "../styles/solicitudes.css";

function MisAdopciones() {

    const { usuarioFirebase } = useAuth();

    const [adopciones, setAdopciones] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargarAdopciones = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            const lista = await obtenerAdopcionesConcretadas(
                usuarioFirebase.uid
            );

            const completas = [];

            for (const adopcion of lista) {

                const mascota = await obtenerMascota(
                    adopcion.mascotaId
                );

                const albergue = await obtenerAlberguePorId(
                    adopcion.albergueId
                );

                completas.push({
                    ...adopcion,
                    mascota: mascota,
                    albergue: albergue
                });
            }

            setAdopciones(completas);

        } catch (error) {

            console.error(
                "Error al cargar las adopciones:",
                error
            );

            setError(
                "No se pudo cargar el historial de adopciones."
            );

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargarAdopciones();

    }, [cargarAdopciones]);


    function formatearFecha(fecha) {

        if (!fecha || !fecha.seconds) {
            return "Sin fecha";
        }

        const momento = new Date(fecha.seconds * 1000);

        return momento.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando tus adopciones...
                </p>

            </main>
        );
    }


    return (
        <main className="solicitud-page">

            <div className="solicitud-container">

                <header className="solicitud-header">

                    <span className="solicitud-label">
                        RED HUELLA / MIS MASCOTAS ADOPTADAS
                    </span>

                    <h1>
                        Mis mascotas adoptadas
                    </h1>

                    <p>
                        El historial de las adopciones que concretaste a través
                        de la plataforma, con la ficha de cada mascota y los
                        datos del refugio de origen.
                    </p>

                </header>


                {error !== "" && (
                    <div className="solicitud-error">
                        <span>
                            {error}
                        </span>
                    </div>
                )}


                {error === "" && adopciones.length === 0 && (

                    <div className="solicitud-empty">

                        <span className="solicitud-empty-number">
                            00
                        </span>

                        <strong>
                            Todavía no concretaste ninguna adopción
                        </strong>

                        <p>
                            Cuando un refugio registre la entrega de una
                            mascota que solicitaste, aparecerá aquí.
                        </p>

                        <Link
                            to="/mascotas"
                            className="solicitud-volver"
                        >
                            Ir al catálogo
                        </Link>

                    </div>
                )}


                {adopciones.length > 0 && (

                    <div className="solicitud-list">

                        {adopciones.map((adopcion) => (

                            <article
                                key={adopcion.id}
                                className="solicitud-card"
                            >

                                <div className="solicitud-card-image">

                                    <img
                                        src={
                                            adopcion.mascota &&
                                            adopcion.mascota.fotosUrls &&
                                            adopcion.mascota.fotosUrls.length > 0
                                                ? adopcion.mascota.fotosUrls[0]
                                                : "/imagenes/hero-mascota.png"
                                        }
                                        alt={
                                            adopcion.mascota
                                                ? adopcion.mascota.nombre
                                                : "Mascota"
                                        }
                                    />

                                </div>

                                <div className="solicitud-card-body">

                                    <div className="solicitud-card-header">

                                        <h3>
                                            {adopcion.mascota
                                                ? adopcion.mascota.nombre
                                                : "Mascota"}
                                        </h3>

                                        <span className="solicitud-estado solicitud-estado-concretada">
                                            Adoptada
                                        </span>

                                    </div>

                                    <p className="solicitud-card-fecha">
                                        Adoptada el {formatearFecha(
                                            adopcion.fechaAdopcion
                                        )}
                                    </p>

                                    {adopcion.mascota && (

                                        <div className="solicitud-adopcion-datos">

                                            <span>
                                                {adopcion.mascota.sexo}
                                            </span>

                                            <span>
                                                {adopcion.mascota.edadCategoria}
                                            </span>

                                            <span>
                                                {adopcion.mascota.tamano}
                                            </span>

                                        </div>
                                    )}

                                    {adopcion.albergue && (

                                        <div className="solicitud-observacion">

                                            <strong>
                                                Refugio de origen
                                            </strong>

                                            <p>
                                                {adopcion.albergue.nombreRefugio}
                                                {" · "}
                                                {adopcion.albergue.telefonoContacto}
                                            </p>

                                        </div>
                                    )}

                                    <div className="solicitud-card-actions">

                                        {adopcion.mascota && (
                                            <Link
                                                to={"/mascotas/" + adopcion.mascotaId}
                                            >
                                                Ver su ficha →
                                            </Link>
                                        )}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}

export default MisAdopciones;
