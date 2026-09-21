function Home() {
    return (
        <div className="home">

            <section className="hero">

                <div className="hero-content">

                    <span className="hero-tag">
                        🐾 Adopta con amor
                    </span>

                    <h1>
                        Encuentra a tu
                        <span> nuevo compañero</span>
                    </h1>

                    <p>
                        Conecta con mascotas que buscan un hogar,
                        albergues verificados y personas comprometidas
                        con la adopción responsable.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn-primary">
                            Explorar mascotas
                        </button>

                        <button className="btn-secondary">
                            Quiero registrarme
                        </button>
                    </div>

                </div>

                <div className="hero-image">
                    <div className="dog-placeholder">
                        🐶
                    </div>
                </div>

            </section>


            <section className="features">

                <div className="section-title">
                    <span>Todo en un solo lugar</span>
                    <h2>
                        Una plataforma pensada para ellos
                    </h2>
                </div>

                <div className="feature-grid">

                    <div className="feature-card">
                        <div className="feature-icon">
                            🐾
                        </div>

                        <h3>
                            Adopciones responsables
                        </h3>

                        <p>
                            Encuentra mascotas que buscan
                            una familia y conoce su información.
                        </p>
                    </div>


                    <div className="feature-card">
                        <div className="feature-icon">
                            🏠
                        </div>

                        <h3>
                            Albergues verificados
                        </h3>

                        <p>
                            Conecta con instituciones verificadas
                            dedicadas al cuidado animal.
                        </p>
                    </div>


                    <div className="feature-card">
                        <div className="feature-icon">
                            📍
                        </div>

                        <h3>
                            Cerca de ti
                        </h3>

                        <p>
                            Busca información según tu departamento
                            y municipio.
                        </p>
                    </div>

                </div>

            </section>


            <section className="call-to-action">

                <div>
                    <span>
                        ¿Listo para comenzar?
                    </span>

                    <h2>
                        Una pequeña acción puede cambiar una vida.
                    </h2>
                </div>

                <button className="btn-primary">
                    Crear mi cuenta
                </button>

            </section>

        </div>
    );
}

export default Home;