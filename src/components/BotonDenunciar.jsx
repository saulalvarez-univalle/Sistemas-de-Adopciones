import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    crearDenuncia,
    MOTIVOS_DENUNCIA
} from "../services/denunciaService";

// HU-24. Se usa desde la ficha de una mascota, el listado de refugios,
// el directorio de servicios y el muro de alertas: en todos los casos el
// reporte es el mismo, solo cambia a qué contenido apunta.
function BotonDenunciar({
    tipoContenido,
    contenidoReferenciaId,
    contenidoUserId,
    contenidoTitulo
}) {

    const navigate = useNavigate();

    const { usuarioFirebase } = useAuth();

    const [abierto, setAbierto] = useState(false);

    const [motivo, setMotivo] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [enviando, setEnviando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    function abrir() {

        if (!usuarioFirebase) {

            navigate("/login");

            return;
        }

        setMotivo("");
        setObservaciones("");
        setError("");
        setMensaje("");
        setAbierto(true);
    }


    async function enviar(evento) {

        evento.preventDefault();

        if (enviando) {
            return;
        }

        setError("");

        if (motivo === "") {

            setError("Selecciona el motivo del reporte.");

            return;
        }

        if (observaciones.trim().length < 15) {

            setError(
                "Describe el problema en al menos 15 caracteres."
            );

            return;
        }

        try {

            setEnviando(true);

            await crearDenuncia({
                denuncianteUserId: usuarioFirebase.uid,
                tipoContenido: tipoContenido,
                contenidoReferenciaId: contenidoReferenciaId,
                contenidoUserId: contenidoUserId || "",
                contenidoTitulo: contenidoTitulo || "",
                motivo: motivo,
                observaciones: observaciones.trim()
            });

            setMensaje(
                "Gracias. Tu reporte llegó a la administración y será revisado."
            );

            setAbierto(false);

        } catch (error) {

            console.error(
                "Error al enviar la denuncia:",
                error
            );

            setError(
                error.message ||
                "No se pudo enviar el reporte."
            );

        } finally {

            setEnviando(false);
        }
    }


    if (mensaje !== "") {

        return (
            <div className="denuncia-enviada">
                {mensaje}
            </div>
        );
    }


    if (!abierto) {

        return (
            <button
                type="button"
                className="denuncia-boton"
                onClick={abrir}
            >
                Reportar contenido
            </button>
        );
    }


    return (
        <form
            className="denuncia-form"
            onSubmit={enviar}
        >

            <h4>
                Reportar este contenido
            </h4>

            <div className="denuncia-field">

                <label htmlFor={"motivo-denuncia-" + contenidoReferenciaId}>
                    Motivo
                </label>

                <select
                    id={"motivo-denuncia-" + contenidoReferenciaId}
                    value={motivo}
                    onChange={(evento) =>
                        setMotivo(evento.target.value)
                    }
                >
                    <option value="">
                        Selecciona una opción
                    </option>

                    {MOTIVOS_DENUNCIA.map((opcion) => (

                        <option
                            key={opcion}
                            value={opcion}
                        >
                            {opcion}
                        </option>

                    ))}
                </select>

            </div>

            <div className="denuncia-field">

                <label htmlFor={"obs-denuncia-" + contenidoReferenciaId}>
                    ¿Qué ocurre?
                </label>

                <textarea
                    id={"obs-denuncia-" + contenidoReferenciaId}
                    rows="3"
                    value={observaciones}
                    onChange={(evento) =>
                        setObservaciones(evento.target.value)
                    }
                    maxLength="400"
                    placeholder="Explica brevemente el problema para que la administración pueda revisarlo."
                />

            </div>

            {error !== "" && (
                <div className="denuncia-error">
                    {error}
                </div>
            )}

            <div className="denuncia-actions">

                <button
                    type="submit"
                    className="denuncia-enviar"
                    disabled={enviando}
                >
                    {enviando
                        ? "Enviando..."
                        : "Enviar reporte"}
                </button>

                <button
                    type="button"
                    className="denuncia-cancelar"
                    onClick={() => setAbierto(false)}
                    disabled={enviando}
                >
                    Cancelar
                </button>

            </div>

        </form>
    );
}

export default BotonDenunciar;
