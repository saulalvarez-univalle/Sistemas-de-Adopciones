import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
    contarCatalogos,
    cargarTodosLosCatalogos
} from "../../services/semillaService";

import "../../styles/admin.css";

const NOMBRES = {
    departamentos: "Departamentos",
    municipios: "Municipios",
    especies: "Especies"
};

function CargarDatos() {

    const navigate = useNavigate();

    const { perfil } = useAuth();

    const [conteo, setConteo] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [ejecutando, setEjecutando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const revisar = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const resultado = await contarCatalogos();

            setConteo(resultado);

        } catch (error) {

            console.error(
                "Error al revisar los catálogos:",
                error
            );

            setError(
                "No se pudieron leer los catálogos. Revisa las reglas de seguridad."
            );

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        revisar();

    }, [revisar]);


    async function ejecutarCarga() {

        setError("");
        setMensaje("");

        try {

            setEjecutando(true);

            const resumen = await cargarTodosLosCatalogos();

            let escritos = 0;
            let omitidos = 0;

            for (const catalogo of Object.keys(resumen)) {

                escritos = escritos + resumen[catalogo].escritos;
                omitidos = omitidos + resumen[catalogo].omitidos;
            }

            setMensaje(
                "Carga completada: " + escritos + " documentos escritos." +
                (omitidos > 0
                    ? " Se omitieron " + omitidos +
                      " porque ya existía un registro con el mismo nombre."
                    : "")
            );

            await revisar();

        } catch (error) {

            console.error(
                "Error al cargar los catálogos:",
                error
            );

            setError(
                "No se pudo completar la carga. Verifica que tu cuenta tenga rol de administrador."
            );

        } finally {

            setEjecutando(false);
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Revisando los catálogos...
                </p>

            </main>
        );
    }


    return (
        <main className="admin-page">

            <section className="admin-container">

                <header className="admin-header">

                    <div className="admin-header-main">

                        <span className="admin-label">
                            RED HUELLA / CATÁLOGOS BASE
                        </span>

                        <h1>
                            Carga de datos iniciales
                        </h1>

                        <p>
                            Escribe en la base de datos los nueve departamentos
                            de Bolivia, sus municipios y las especies iniciales.
                            La operación es idempotente: puede repetirse sin
                            duplicar registros.
                        </p>

                    </div>

                    <div className="admin-user">

                        <div className="admin-user-avatar">
                            {perfil?.nombreCompleto
                                ? perfil.nombreCompleto.charAt(0).toUpperCase()
                                : "A"}
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                {perfil?.nombreCompleto}
                            </strong>

                            <span>
                                {perfil?.rol}
                            </span>

                        </div>

                    </div>

                </header>


                {mensaje !== "" && (
                    <div className="admin-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}


                <section className="admin-overview">

                    {conteo && Object.keys(conteo).map((clave) => (

                        <div
                            key={clave}
                            className="admin-overview-card"
                        >

                            <div className="admin-overview-top">

                                <span>
                                    {NOMBRES[clave].toUpperCase()}
                                </span>

                                <strong
                                    className={
                                        conteo[clave].enBaseDeDatos > 0
                                            ? "admin-number-green"
                                            : ""
                                    }
                                >
                                    {conteo[clave].enBaseDeDatos}
                                </strong>

                            </div>

                            <p>
                                {conteo[clave].enSemilla} documentos
                                disponibles para cargar.
                            </p>

                        </div>

                    ))}

                </section>


                <section className="admin-section">

                    <div className="admin-cards">

                        <article className="admin-card">

                            <div className="admin-card-top">
                                <div className="admin-card-number">01</div>
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Ejecutar la carga
                                </h3>

                                <p>
                                    Escribe los tres catálogos. Si un
                                    documento ya existe, se reescribe con el
                                    mismo identificador.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={ejecutarCarga}
                                disabled={ejecutando}
                            >
                                {ejecutando
                                    ? "Cargando..."
                                    : "Cargar catálogos"}
                                <span>→</span>
                            </button>

                        </article>

                        <article className="admin-card">

                            <div className="admin-card-top">
                                <div className="admin-card-number">02</div>
                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Volver al panel
                                </h3>

                                <p>
                                    Regresa a las herramientas de
                                    administración del sistema.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => navigate("/admin")}
                            >
                                Ir al panel
                                <span>→</span>
                            </button>

                        </article>

                    </div>

                </section>

            </section>

        </main>
    );
}

export default CargarDatos;
