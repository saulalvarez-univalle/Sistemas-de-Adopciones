import { useState } from "react";

import { validarUrlImagen } from "../services/storageService";

import {
    subirImagen,
    subidaDisponible
} from "../services/imagenService";

import "../styles/campo-imagen.css";

// Campo de una sola imagen, reutilizado por el refugio, el
// establecimiento y el perfil del usuario. La mascota usa su propio
// control porque admite varias fotografías a la vez.
//
// Las dos vías conviven a propósito: subir desde el equipo y pegar un
// enlace. Si Cloudinary no responde, la segunda sigue funcionando.
function CampoImagen({
    id,
    etiqueta,
    ayuda,
    valor,
    alCambiar,
    redonda
}) {

    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState("");


    async function subirArchivo(evento) {

        const archivo = evento.target.files[0];

        // Se limpia el input para que elegir dos veces el mismo archivo
        // vuelva a disparar el evento.
        evento.target.value = "";

        if (!archivo) {
            return;
        }

        setError("");
        setSubiendo(true);

        try {

            alCambiar(await subirImagen(archivo));

        } catch (error) {

            console.error(
                "Error al subir la imagen:",
                error
            );

            setError(
                error.message ||
                "No se pudo subir la imagen."
            );

        } finally {

            setSubiendo(false);
        }
    }


    function cambiarEnlace(evento) {

        const direccion = evento.target.value;

        alCambiar(direccion);

        if (direccion.trim() === "") {

            setError("");

            return;
        }

        setError(validarUrlImagen(direccion));
    }


    function quitar() {

        alCambiar("");

        setError("");
    }


    return (
        <div className="campo-imagen">

            <label
                className="campo-imagen-titulo"
                htmlFor={id}
            >
                {etiqueta}
            </label>

            <div className="campo-imagen-fila">

                <div
                    className={
                        redonda
                            ? "campo-imagen-vista campo-imagen-vista-redonda"
                            : "campo-imagen-vista"
                    }
                >

                    {valor !== "" ? (

                        <img
                            src={valor}
                            alt={"Vista previa de " + etiqueta.toLowerCase()}
                        />

                    ) : (

                        <span>
                            Sin imagen
                        </span>
                    )}

                </div>

                <div className="campo-imagen-controles">

                    {subidaDisponible() && (

                        <>
                            <label
                                className="campo-imagen-boton"
                                htmlFor={id + "-archivo"}
                            >
                                {subiendo
                                    ? "Subiendo..."
                                    : "Subir desde mi computadora"}
                            </label>

                            <input
                                id={id + "-archivo"}
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={subirArchivo}
                                disabled={subiendo}
                            />
                        </>
                    )}

                    <input
                        id={id}
                        type="url"
                        value={valor}
                        onChange={cambiarEnlace}
                        maxLength="600"
                        placeholder="O pega el enlace de una imagen"
                    />

                    {valor !== "" && (

                        <button
                            type="button"
                            className="campo-imagen-quitar"
                            onClick={quitar}
                        >
                            Quitar imagen
                        </button>
                    )}

                </div>

            </div>

            {error !== "" && (
                <div className="campo-imagen-error">
                    {error}
                </div>
            )}

            {ayuda && (
                <small>
                    {ayuda}
                </small>
            )}

        </div>
    );
}

export default CampoImagen;
