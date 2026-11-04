import "../styles/cargando.css";

// Las dieciocho pantallas del sistema escribían su propio bloque de
// carga con las clases loading-page y loading-spinner, que no estaban
// definidas en ningún archivo de estilos: el resultado era un div vacío
// y una línea de texto suelta sobre el fondo. Este componente reemplaza
// ese bloque por una pantalla con la identidad del sistema.
//
// La huella late en lugar de girar porque el giro continuo da sensación
// de que algo se trabó; el latido se lee como "está trabajando".
function Cargando({ texto, detalle }) {

    return (
        <main className="cargando-pagina">

            <div className="cargando-caja">

                <div
                    className="cargando-marca"
                    role="status"
                    aria-live="polite"
                    aria-label={texto || "Cargando"}
                >

                    <span className="cargando-aro"></span>

                    <img
                        src="/imagenes/logo.png"
                        alt=""
                    />

                </div>

                <p className="cargando-texto">
                    {texto || "Cargando"}
                </p>

                {detalle && (
                    <p className="cargando-detalle">
                        {detalle}
                    </p>
                )}

                <div className="cargando-barra">
                    <span></span>
                </div>

            </div>

        </main>
    );
}

export default Cargando;
