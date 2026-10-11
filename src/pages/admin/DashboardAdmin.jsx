import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
    obtenerDatosDelSistema,
    calcularIndicadores
} from "../../services/reporteService";

import "../../styles/admin.css";

function DashboardAdmin() {

    const navigate = useNavigate();

    const {
        perfil
    } = useAuth();

    // HU-26. El panel dejó de mostrar rótulos fijos: ahora cada número
    // sale de la base de datos, de modo que el administrador ve de
    // entrada qué requiere su atención.
    const [indicadores, setIndicadores] = useState(null);

    const cargarIndicadores = useCallback(async () => {

        try {

            setIndicadores(
                calcularIndicadores(
                    await obtenerDatosDelSistema()
                )
            );

        } catch (error) {

            console.error(
                "Error al calcular los indicadores:",
                error
            );
        }

    }, []);


    useEffect(() => {

        cargarIndicadores();

    }, [cargarIndicadores]);


    function pendiente(valor) {

        if (indicadores === null) {
            return "—";
        }

        return valor;
    }


    return (
        <main className="admin-page">

            <section className="admin-container">

                <header className="admin-header">

                    <div className="admin-header-main">

                        <span className="admin-label">
                            RED HUELLA / ADMINISTRACIÓN
                        </span>

                        <h1>
                            Panel administrativo
                        </h1>

                        <p>
                            Gestiona y supervisa los componentes
                            principales de la plataforma.
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


                <section className="admin-overview">

                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                PENDIENTES DE VERIFICAR
                            </span>

                            <strong
                                className={
                                    indicadores &&
                                    indicadores.alberguesPendientes +
                                        indicadores.serviciosPendientes > 0
                                        ? "admin-number-alerta"
                                        : "admin-number-green"
                                }
                            >
                                {pendiente(
                                    indicadores
                                        ? indicadores.alberguesPendientes +
                                          indicadores.serviciosPendientes
                                        : 0
                                )}
                            </strong>
                        </div>

                        <p>
                            Refugios y establecimientos esperando
                            tu revisión.
                        </p>

                    </div>


                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                REPORTES SIN RESOLVER
                            </span>

                            <strong
                                className={
                                    indicadores &&
                                    indicadores.denunciasPendientes > 0
                                        ? "admin-number-alerta"
                                        : "admin-number-green"
                                }
                            >
                                {pendiente(
                                    indicadores
                                        ? indicadores.denunciasPendientes
                                        : 0
                                )}
                            </strong>
                        </div>

                        <p>
                            Denuncias de la comunidad en espera.
                        </p>

                    </div>


                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                MASCOTAS PUBLICADAS
                            </span>

                            <strong>
                                {pendiente(
                                    indicadores
                                        ? indicadores.mascotasTotal
                                        : 0
                                )}
                            </strong>
                        </div>

                        <p>
                            Registros activos en el catálogo público.
                        </p>

                    </div>


                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                ADOPCIONES CONCRETADAS
                            </span>

                            <strong className="admin-number-green">
                                {pendiente(
                                    indicadores
                                        ? indicadores.adopcionesConcretadas
                                        : 0
                                )}
                            </strong>
                        </div>

                        <p>
                            Mascotas que ya están en un hogar.
                        </p>

                    </div>

                </section>


                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>
                            <span className="admin-overline">
                                ADMINISTRACIÓN
                            </span>

                            <h2>
                                Herramientas del sistema
                            </h2>
                        </div>

                    </div>


                    <div className="admin-cards">


                        <article className="admin-card admin-card-primary">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    01
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Albergues
                                </h3>

                                <p>
                                    Revisa las solicitudes de registro,
                                    consulta la información proporcionada
                                    y verifica los albergues antes de
                                    habilitarlos en la plataforma.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/gestion-albergues");
                                }}
                            >
                                Gestionar albergues
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    02
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Especies
                                </h3>

                                <p>
                                    Administra el catálogo de especies
                                    que estará disponible para los
                                    diferentes procesos de adopción.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/gestion-especies");
                                }}
                            >
                                Gestionar especies
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    03
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Catálogos base
                                </h3>

                                <p>
                                    Carga los departamentos, municipios
                                    y especies iniciales del sistema.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/cargar-datos");
                                }}
                            >
                                Cargar datos
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    04
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Establecimientos
                                </h3>

                                <p>
                                    Verifica las veterinarias, tiendas y
                                    peluquerías antes de publicarlas en el
                                    directorio.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/gestion-servicios");
                                }}
                            >
                                Gestionar establecimientos
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    05
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Moderación y cuentas
                                </h3>

                                <p>
                                    Revisa los reportes de la comunidad
                                    sobre publicaciones y suspende o
                                    reactiva las cuentas responsables.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/moderacion");
                                }}
                            >
                                Revisar reportes
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    06
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Mascotas
                                </h3>

                                <p>
                                    Supervisa el catálogo completo,
                                    corrige un estado mal cargado y
                                    retira publicaciones que incumplan
                                    las normas.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/gestion-mascotas");
                                }}
                            >
                                Supervisar catálogo
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                        <article className="admin-card admin-card-primary">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    07
                                </div>

                                <span className="admin-card-status">
                                    ACTIVO
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Reportes
                                </h3>

                                <p>
                                    Indicadores de gestión, adopciones
                                    mes a mes y cobertura territorial,
                                    con descarga en CSV para informes.
                                </p>

                            </div>

                            <button
                                className="admin-card-action"
                                onClick={() => {
                                    navigate("/reportes");
                                }}
                            >
                                Ver reportes
                                <span>
                                    →
                                </span>
                            </button>

                        </article>


                    </div>

                </section>


                <section className="admin-information">

                    <div className="admin-information-mark">
                        RH
                    </div>

                    <div>

                        <span className="admin-overline">
                            RED HUELLA
                        </span>

                        <h2>
                            Administración centralizada
                        </h2>

                        <p>
                            Desde este espacio puedes controlar los
                            componentes que requieren supervisión
                            administrativa antes de estar disponibles
                            para los usuarios de la plataforma.
                        </p>

                    </div>

                </section>

            </section>

        </main>
    );
}

export default DashboardAdmin;