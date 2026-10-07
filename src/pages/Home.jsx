import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";
function Home() {
    const { usuarioFirebase, perfil } = useAuth();

let rutaRefugios = "/refugios";

if (
    usuarioFirebase &&
    perfil &&
    (
        perfil.rol === "Admin" ||
        perfil.rol === "Superusuario"
    )
) {
    rutaRefugios = "/gestion-albergues";
}
    return (
        <main className="home">

            {/* HERO */}

<section
    id="inicio"
    className="home-hero"
>

    <div className="home-hero-content">

        <span className="home-tag">
            RED HUELLA
        </span>

        <h1>
            Conecta.
            <span>Cuida. Adopta.</span>
        </h1>

        <p>
            Encuentra mascotas en adopción, refugios
            y servicios para animales cerca de ti.
            Todo en una misma plataforma.
        </p>

        <div className="home-hero-buttons">

            <a
                href="#explora"
                className="home-button-primary"
            >
                Explorar la plataforma
            </a>

            <Link
                to="/registro"
                className="home-button-secondary"
            >
                Crear mi cuenta
            </Link>

        </div>

    </div>


    <div className="home-hero-pet">

        <div className="home-hero-circle"></div>

        <img
            src="/imagenes/hero-mascota.png"
            alt="Mascota"
        />

        <div className="home-hero-card">

            <span className="home-hero-card-index">
                01
            </span>

            <div>

                <strong>
                    Bienestar animal
                </strong>

                <p>
                    Todo en un mismo lugar.
                </p>

            </div>

        </div>

    </div>

</section>



            {/* CATEGORÍAS */}

            <section
                id="explora"
                className="home-explore"
            >

                <div className="home-section-heading">

                    <div>
                        <span className="home-section-tag">
                            DESCUBRE RED HUELLA
                        </span>

                        <h2>
                            Encuentra lo que
                            <span> necesitas.</span>
                        </h2>
                    </div>

                    <p>
                        Explora diferentes opciones para
                        encontrar una mascota, conocer refugios
                        o acceder a servicios para su cuidado.
                    </p>

                </div>


                <div className="home-category-grid">

                    <a
                        href="#adopciones"
                        className="home-category-card"
                    >

                        <div className="home-category-image">

                            <img
                                src="/imagenes/perro-adopcion.jpg"
                                alt="Perro disponible para adopción"
                            />

                        </div>

                        <div className="home-category-content">

                            <span className="home-category-icon">
                                02
                            </span>

                            <div>
                                <h3>
                                    Adopciones
                                </h3>

                                <p>
                                    Conoce mascotas que buscan
                                    una familia.
                                </p>
                            </div>

                            <strong>
                                →
                            </strong>

                        </div>

                    </a>


                    <Link
    to={rutaRefugios}
    className="home-category-card"
>

                        <div className="home-category-image">

                            <img
                                src="/imagenes/refugio.jpg"
                                alt="Refugio de animales"
                            />

                        </div>

                        <div className="home-category-content">

                            <span className="home-category-icon">
                                03
                            </span>

                            <div>
                                <h3>
                                    Refugios
                                </h3>

                                <p>
                                    Encuentra refugios y conoce
                                    su información.
                                </p>
                            </div>

                            <strong>
                                →
                            </strong>

                        </div>

                    </Link>


                    <a
                        href="#servicios"
                        className="home-category-card"
                    >

                        <div className="home-category-image">

                            <img
                                src="/imagenes/mascotas-juntas.jpg"
                                alt="Mascotas que reciben cuidados"
                            />

                        </div>

                        <div className="home-category-content">

                            <span className="home-category-icon">
                                04
                            </span>

                            <div>
                                <h3>
                                    Servicios
                                </h3>

                                <p>
                                    Veterinarias, tiendas y
                                    peluquerías para mascotas.
                                </p>
                            </div>

                            <strong>
                                →
                            </strong>

                        </div>

                    </a>

                </div>

            </section>


            {/* ADOPCIONES */}

            <section
                id="adopciones"
                className="home-section"
            >

                <div className="home-section-heading">

                    <div>
                        <span className="home-section-tag">
                            ADOPCIONES
                        </span>

                        <h2>
                            Una nueva familia
                            <span> puede estar esperándolos.</span>
                        </h2>
                    </div>

                    <p>
                        Conoce mascotas disponibles para
                        adopción y descubre sus historias.
                    </p>

                </div>


                <div className="pet-cards">

                    <article className="pet-card">

                        <div className="pet-card-image">

                            <img
                                src="/imagenes/perro-adopcion.jpg"
                                alt="Perro en adopción"
                            />

                            <span>
                                En adopción
                            </span>

                        </div>

                        <div className="pet-card-content">

                            <h3>
                                Perros
                            </h3>

                            <p>
                                Encuentra perros que esperan
                                una familia responsable.
                            </p>

                            <a href="#como-funciona">
                                Saber cómo adoptar →
                            </a>

                        </div>

                    </article>


                    <article className="pet-card">

                        <div className="pet-card-image">

                            <img
                                src="/imagenes/gato-adopcion.jpg"
                                alt="Gato en adopción"
                            />

                            <span>
                                En adopción
                            </span>

                        </div>

                        <div className="pet-card-content">

                            <h3>
                                Gatos
                            </h3>

                            <p>
                                Conoce gatos que buscan un
                                hogar seguro y responsable.
                            </p>

                            <a href="#como-funciona">
                                Saber cómo adoptar →
                            </a>

                        </div>

                    </article>


                    <article className="pet-card">

                        <div className="pet-card-image">

                            <img
                                src="/imagenes/mascotas-juntas.jpg"
                                alt="Mascotas disponibles para adopción"
                            />

                            <span>
                                Adopción responsable
                            </span>

                        </div>

                        <div className="pet-card-content">

                            <h3>
                                Dale una oportunidad
                            </h3>

                            <p>
                                Una adopción responsable puede
                                cambiar dos vidas.
                            </p>

                            <Link to="/registro">
                                Crear mi cuenta →
                            </Link>

                        </div>

                    </article>

                </div>

            </section>


            {/* REFUGIOS */}

            <section
                id="albergues"
                className="home-shelters"
            >

                <div className="home-shelters-image">

                    <img
                        src="/imagenes/refugio.jpg"
                        alt="Refugio de animales"
                    />

                </div>


                <div className="home-shelters-content">

                    <span className="home-section-tag">
                        REFUGIOS
                    </span>

                    <h2>
                        Conoce los refugios
                        <span> de tu zona.</span>
                    </h2>

                    <p>
                        Red Huella permite que los refugios
                        registren su información para que las
                        personas puedan encontrarlos según su
                        ubicación.
                    </p>

                    <p>
                        Podrás consultar su información,
                        ubicación, horarios, contacto y las
                        mascotas disponibles para adopción.
                    </p>

                    <Link
    to={rutaRefugios}
    className="home-button-primary"
>
    Conocer refugios de mi zona
</Link>

                </div>

            </section>


            {/* SERVICIOS */}

            <section
                id="servicios"
                className="home-services"
            >

                <div className="home-services-content">

                    <span className="home-section-tag">
                        SERVICIOS PARA MASCOTAS
                    </span>

                    <h2>
                        Todo lo que necesitas
                        <span> cerca de ti.</span>
                    </h2>

                    <p>
                        Encuentra establecimientos dedicados
                        al cuidado animal según tu departamento
                        y municipio.
                    </p>


                    <div className="home-service-list">

                        <div className="home-service-item">

                            <span>
                                🩺
                            </span>

                            <div>
                                <h3>
                                    Veterinarias
                                </h3>

                                <p>
                                    Atención y cuidado para
                                    tus mascotas.
                                </p>
                            </div>

                        </div>


                        <div className="home-service-item">

                            <span>
                                🛍️
                            </span>

                            <div>
                                <h3>
                                    Tiendas
                                </h3>

                                <p>
                                    Productos y accesorios
                                    para animales.
                                </p>
                            </div>

                        </div>


                        <div className="home-service-item">

                            <span>
                                ✂️
                            </span>

                            <div>
                                <h3>
                                    Peluquerías
                                </h3>

                                <p>
                                    Servicios de higiene y
                                    cuidado estético.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                <div className="home-services-image">

                    <img
                        src="/imagenes/mascotas-juntas.jpg"
                        alt="Mascotas recibiendo cuidados"
                    />

                </div>

            </section>


            {/* COMO FUNCIONA */}

            <section
                id="como-funciona"
                className="home-how"
            >

                <div className="home-how-image">

                    <img
                        src="/imagenes/hero.jpg"
                        alt="Personas y mascotas"
                    />

                </div>


                <div className="home-how-content">

                    <span className="home-section-tag">
                        ¿CÓMO FUNCIONA?
                    </span>

                    <h2>
                        Una plataforma para
                        <span> todos.</span>
                    </h2>

                    <p>
                        Cada persona puede utilizar Red Huella
                        según lo que necesite.
                    </p>


                    <div className="home-steps">

                        <div className="home-step">

                            <span>
                                01
                            </span>

                            <div>
                                <h3>
                                    Regístrate
                                </h3>

                                <p>
                                    Crea una cuenta según el
                                    tipo de usuario que seas.
                                </p>
                            </div>

                        </div>


                        <div className="home-step">

                            <span>
                                02
                            </span>

                            <div>
                                <h3>
                                    Explora
                                </h3>

                                <p>
                                    Busca mascotas, refugios y
                                    servicios en tu zona.
                                </p>
                            </div>

                        </div>


                        <div className="home-step">

                            <span>
                                03
                            </span>

                            <div>
                                <h3>
                                    Conoce los detalles
                                </h3>

                                <p>
                                    Consulta información,
                                    ubicación, horarios y contacto.
                                </p>
                            </div>

                        </div>


                        <div className="home-step">

                            <span>
                                04
                            </span>

                            <div>
                                <h3>
                                    Conecta
                                </h3>

                                <p>
                                    Adopta, encuentra un refugio
                                    o accede a un servicio.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* NOSOTROS */}

            <section
                id="nosotros"
                className="home-about"
            >

                <div className="home-about-image">

                    <img
                        src="/imagenes/mascotas-juntas.jpg"
                        alt="Perros y gatos juntos"
                    />

                </div>


                <div className="home-about-content">

                    <span className="home-section-tag">
                        SOBRE RED HUELLA
                    </span>

                    <h2>
                        Una red que conecta
                        <span> a quienes cuidan.</span>
                    </h2>

                    <p>
                        Red Huella es una plataforma pensada
                        para reunir en un mismo espacio a
                        personas, refugios y servicios
                        relacionados con el bienestar animal.
                    </p>

                    <p>
                        Nuestro objetivo es facilitar el acceso
                        a información confiable y ayudar a que
                        las personas puedan encontrar opciones
                        para sus mascotas según su ubicación.
                    </p>


                    <div className="home-about-values">

                        <div>
                            <strong>
                                🐾
                            </strong>

                            <span>
                                Bienestar animal
                            </span>
                        </div>

                        <div>
                            <strong>
                                🤝
                            </strong>

                            <span>
                                Comunidad
                            </span>
                        </div>

                        <div>
                            <strong>
                                📍
                            </strong>

                            <span>
                                Cerca de ti
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="home-cta">

                <div>

                    <span>
                        FORMA PARTE DE RED HUELLA
                    </span>

                    <h2>
                        Conecta con quienes hacen
                        del bienestar animal una prioridad.
                    </h2>

                </div>

                <Link
                    to="/registro"
                    className="home-cta-button"
                >
                    Crear mi cuenta
                </Link>

            </section>


            {/* FOOTER */}

            <footer className="home-footer">

                <div className="home-footer-brand">

                    <Link
                        to="/"
                        className="home-footer-logo"
                    >
                        🐾 Red Huella
                    </Link>

                    <p>
                        Plataforma de adopción, refugios y
                        servicios para mascotas.
                    </p>

                </div>


                <div className="home-footer-column">

                    <h3>
                        Explorar
                    </h3>

                    <a href="#adopciones">
                        Adopciones
                    </a>

                    <Link to={rutaRefugios}>
    Refugios
</Link>

                    <a href="#servicios">
                        Servicios
                    </a>

                </div>


                <div className="home-footer-column">

                    <h3>
                        Plataforma
                    </h3>

                    <a href="#como-funciona">
                        ¿Cómo funciona?
                    </a>

                    <a href="#nosotros">
                        Nosotros
                    </a>

                    <Link to="/registro">
                        Crear cuenta
                    </Link>

                </div>


                <div className="home-footer-column">

                    <h3>
                        Cuenta
                    </h3>

                    <Link to="/login">
                        Iniciar sesión
                    </Link>

                    <Link to="/registro">
                        Registrarse
                    </Link>

                    <Link to="/recuperar-password">
                        Recuperar contraseña
                    </Link>

                </div>

            </footer>

        </main>
    );
}

export default Home;