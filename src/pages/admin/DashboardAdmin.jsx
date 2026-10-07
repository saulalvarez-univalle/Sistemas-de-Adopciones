import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "../../styles/admin.css";

function DashboardAdmin() {

    const navigate = useNavigate();

    const {
        perfil
    } = useAuth();

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
                                MÓDULOS DISPONIBLES
                            </span>

                            <strong>
                                02
                            </strong>
                        </div>

                        <p>
                            Módulos administrativos activos
                            actualmente.
                        </p>

                    </div>


                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                VERIFICACIÓN
                            </span>

                            <strong className="admin-number-green">
                                ACTIVA
                            </strong>
                        </div>

                        <p>
                            Gestión de solicitudes de albergues.
                        </p>

                    </div>


                    <div className="admin-overview-card">

                        <div className="admin-overview-top">
                            <span>
                                CATÁLOGO
                            </span>

                            <strong>
                                ACTIVO
                            </strong>
                        </div>

                        <p>
                            Parametrización de especies disponible.
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


                        <article className="admin-card admin-card-disabled">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    03
                                </div>

                                <span className="admin-card-status admin-status-soon">
                                    PRÓXIMAMENTE
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Usuarios
                                </h3>

                                <p>
                                    La administración y supervisión
                                    de las cuentas registradas estará
                                    disponible en una siguiente etapa.
                                </p>

                            </div>

                            <button
                                className="admin-card-action admin-action-disabled"
                                disabled
                            >
                                Próximamente
                            </button>

                        </article>


                        <article className="admin-card admin-card-disabled">

                            <div className="admin-card-top">

                                <div className="admin-card-number">
                                    04
                                </div>

                                <span className="admin-card-status admin-status-soon">
                                    PRÓXIMAMENTE
                                </span>

                            </div>

                            <div className="admin-card-content">

                                <h3>
                                    Mascotas
                                </h3>

                                <p>
                                    Gestiona las mascotas registradas,
                                    su información, disponibilidad y
                                    procesos relacionados con adopciones.
                                </p>

                            </div>

                            <button
                                className="admin-card-action admin-action-disabled"
                                disabled
                            >
                                Próximamente
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