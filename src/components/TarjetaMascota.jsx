import { Link } from "react-router-dom";

function TarjetaMascota({
    mascota,
    nombreEspecie,
    nombreMunicipio,
    esFavorito,
    onAlternarFavorito
}) {

    const foto =
        mascota.fotosUrls && mascota.fotosUrls.length > 0
            ? mascota.fotosUrls[0]
            : "/imagenes/hero-mascota.png";

    return (
        <article className="mascota-card">

            <div className="mascota-card-image">

                <img
                    src={foto}
                    alt={mascota.nombre}
                />

                <span className="mascota-card-especie">
                    {nombreEspecie || "Mascota"}
                </span>

                {onAlternarFavorito && (
                    <button
                        type="button"
                        className={
                            esFavorito
                                ? "mascota-card-favorito mascota-card-favorito-activo"
                                : "mascota-card-favorito"
                        }
                        onClick={() =>
                            onAlternarFavorito(mascota)
                        }
                        aria-label={
                            esFavorito
                                ? "Quitar de favoritos"
                                : "Agregar a favoritos"
                        }
                    >
                        {esFavorito ? "♥" : "♡"}
                    </button>
                )}

                {mascota.estadoAdopcion === "En proceso" && (
                    <span className="mascota-card-estado">
                        En proceso
                    </span>
                )}

            </div>

            <div className="mascota-card-content">

                <h3>
                    {mascota.nombre}
                </h3>

                <div className="mascota-card-datos">

                    <span>
                        {mascota.sexo}
                    </span>

                    <span>
                        {mascota.edadCategoria}
                    </span>

                    <span>
                        {mascota.tamano}
                    </span>

                </div>

                <p>
                    {mascota.descripcion}
                </p>

                <div className="mascota-card-footer">

                    <span className="mascota-card-ubicacion">
                        {nombreMunicipio || "Bolivia"}
                    </span>

                    <Link to={"/mascotas/" + mascota.id}>
                        Ver detalle
                        <span> →</span>
                    </Link>

                </div>

            </div>

        </article>
    );
}

export default TarjetaMascota;
