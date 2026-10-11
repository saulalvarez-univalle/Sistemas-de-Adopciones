import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenerMascota } from "../services/mascotaService";

import {
    emitirSolicitud,
    existeSolicitudActiva
} from "../services/solicitudService";

import "../styles/solicitudes.css";

function SolicitudAdopcion() {

    const { mascotaId } = useParams();

    const navigate = useNavigate();

    const { usuarioFirebase, perfil } = useAuth();

    const [mascota, setMascota] = useState(null);

    const [tipoVivienda, setTipoVivienda] = useState("");
    const [tieneEspacioExterior, setTieneEspacioExterior] = useState("");
    const [otrasMascotas, setOtrasMascotas] = useState("");
    const [personasEnCasa, setPersonasEnCasa] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [motivacion, setMotivacion] = useState("");
    const [compromiso, setCompromiso] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    const [error, setError] = useState("");


    useEffect(() => {

        async function cargarMascota() {

            try {

                setCargando(true);
                setError("");

                const datos = await obtenerMascota(mascotaId);

                if (!datos) {

                    setError("La mascota no existe o fue dada de baja.");

                    return;
                }

                if (datos.estadoAdopcion !== "Disponible") {

                    setError(
                        "Esta mascota no está recibiendo solicitudes."
                    );

                    return;
                }

                setMascota(datos);

                if (usuarioFirebase) {

                    const yaExiste = await existeSolicitudActiva(
                        usuarioFirebase.uid,
                        mascotaId
                    );

                    if (yaExiste) {

                        setError(
                            "Ya tienes una solicitud activa para esta mascota."
                        );
                    }
                }

            } catch (error) {

                console.error(
                    "Error al cargar la mascota:",
                    error
                );

                setError("No se pudo cargar la información.");

            } finally {

                setCargando(false);
            }
        }

        cargarMascota();

    }, [mascotaId, usuarioFirebase]);


    function validarFormulario() {

        if (tipoVivienda === "") {
            return "Indica en qué tipo de vivienda vives.";
        }

        if (tieneEspacioExterior === "") {
            return "Indica si cuentas con patio o espacio exterior.";
        }

        if (otrasMascotas === "") {
            return "Indica si tienes otras mascotas en casa.";
        }

        const personas = Number(personasEnCasa);

        if (
            personasEnCasa === "" ||
            Number.isNaN(personas) ||
            personas < 1 ||
            personas > 20
        ) {
            return "Indica cuántas personas viven en tu hogar.";
        }

        if (experiencia === "") {
            return "Indica tu experiencia previa con mascotas.";
        }

        if (motivacion.trim().length < 30) {
            return "Cuéntanos tu motivación en al menos 30 caracteres.";
        }

        if (motivacion.trim().length > 600) {
            return "La motivación no puede superar los 600 caracteres.";
        }

        if (!compromiso) {
            return "Debes aceptar el compromiso de tenencia responsable.";
        }

        return "";
    }


    async function manejarEnvio(evento) {

        evento.preventDefault();

        if (enviando) {
            return;
        }

        setError("");

        const errorFormulario = validarFormulario();

        if (errorFormulario !== "") {

            setError(errorFormulario);

            return;
        }

        try {

            setEnviando(true);

            await emitirSolicitud({
                adoptanteUserId: usuarioFirebase.uid,
                mascotaId: mascota.id,
                albergueId: mascota.albergueId,
                datosSolicitante: {
                    nombreCompleto: perfil?.nombreCompleto || "",
                    telefono: perfil?.telefono || "",
                    email: perfil?.email || "",
                    departamentoId: perfil?.departamentoId || "",
                    municipioId: perfil?.municipioId || "",
                    tipoVivienda: tipoVivienda,
                    tieneEspacioExterior: tieneEspacioExterior,
                    otrasMascotas: otrasMascotas,
                    personasEnCasa: Number(personasEnCasa),
                    experiencia: experiencia,
                    motivacion: motivacion.trim()
                }
            });

            navigate("/mis-solicitudes", {
                state: {
                    mensaje:
                        "Tu solicitud fue enviada. El refugio la revisará y te responderá."
                }
            });

        } catch (error) {

            console.error(
                "Error al enviar la solicitud:",
                error
            );

            setError(
                error.message ||
                "No se pudo enviar la solicitud. Inténtalo nuevamente."
            );

        } finally {

            setEnviando(false);
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando formulario...
                </p>

            </main>
        );
    }


    if (error !== "" && !mascota) {

        return (
            <main className="solicitud-page">

                <div className="solicitud-container">

                    <div className="solicitud-error-block">

                        <strong>
                            No se puede continuar
                        </strong>

                        <p>
                            {error}
                        </p>

                        <Link
                            to="/mascotas"
                            className="solicitud-volver"
                        >
                            Volver al catálogo
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    return (
        <main className="solicitud-page">

            <div className="solicitud-container">

                <Link
                    to={"/mascotas/" + mascotaId}
                    className="solicitud-volver"
                >
                    ← Volver a la ficha
                </Link>


                <header className="solicitud-header">

                    <span className="solicitud-label">
                        RED HUELLA / SOLICITUD DE ADOPCIÓN
                    </span>

                    <h1>
                        Quiero adoptar a {mascota.nombre}
                    </h1>

                    <p>
                        Esta información la revisará el refugio
                        responsable para evaluar tu solicitud. Responde
                        con la mayor honestidad posible.
                    </p>

                </header>


                <form
                    className="solicitud-form"
                    onSubmit={manejarEnvio}
                >

                    <div className="solicitud-grid">

                        <div className="solicitud-field">

                            <label htmlFor="vivienda">
                                Tipo de vivienda
                            </label>

                            <select
                                id="vivienda"
                                value={tipoVivienda}
                                onChange={(evento) =>
                                    setTipoVivienda(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                <option value="Casa">
                                    Casa
                                </option>

                                <option value="Departamento">
                                    Departamento
                                </option>

                                <option value="Casa compartida">
                                    Casa compartida
                                </option>
                            </select>

                        </div>


                        <div className="solicitud-field">

                            <label htmlFor="exterior">
                                ¿Tienes patio o espacio exterior?
                            </label>

                            <select
                                id="exterior"
                                value={tieneEspacioExterior}
                                onChange={(evento) =>
                                    setTieneEspacioExterior(
                                        evento.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                <option value="Sí">
                                    Sí
                                </option>

                                <option value="No">
                                    No
                                </option>
                            </select>

                        </div>


                        <div className="solicitud-field">

                            <label htmlFor="otras">
                                ¿Tienes otras mascotas?
                            </label>

                            <select
                                id="otras"
                                value={otrasMascotas}
                                onChange={(evento) =>
                                    setOtrasMascotas(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                <option value="No">
                                    No
                                </option>

                                <option value="Sí, perros">
                                    Sí, perros
                                </option>

                                <option value="Sí, gatos">
                                    Sí, gatos
                                </option>

                                <option value="Sí, otras especies">
                                    Sí, otras especies
                                </option>
                            </select>

                        </div>


                        <div className="solicitud-field">

                            <label htmlFor="personas">
                                Personas que viven en el hogar
                            </label>

                            <input
                                id="personas"
                                type="number"
                                min="1"
                                max="20"
                                value={personasEnCasa}
                                onChange={(evento) =>
                                    setPersonasEnCasa(evento.target.value)
                                }
                                placeholder="Ej. 4"
                            />

                        </div>


                        <div className="solicitud-field solicitud-field-full">

                            <label htmlFor="experiencia">
                                Experiencia previa con mascotas
                            </label>

                            <select
                                id="experiencia"
                                value={experiencia}
                                onChange={(evento) =>
                                    setExperiencia(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                <option value="Es mi primera mascota">
                                    Es mi primera mascota
                                </option>

                                <option value="He tenido mascotas antes">
                                    He tenido mascotas antes
                                </option>

                                <option value="Tengo mascotas actualmente">
                                    Tengo mascotas actualmente
                                </option>
                            </select>

                        </div>


                        <div className="solicitud-field solicitud-field-full">

                            <label htmlFor="motivacion">
                                ¿Por qué quieres adoptar a {mascota.nombre}?
                            </label>

                            <textarea
                                id="motivacion"
                                rows="5"
                                value={motivacion}
                                onChange={(evento) =>
                                    setMotivacion(evento.target.value)
                                }
                                maxLength="600"
                                placeholder="Cuéntale al refugio cómo sería su vida en tu hogar."
                            />

                            <small>
                                Entre 30 y 600 caracteres.
                            </small>

                        </div>

                    </div>


                    <label className="solicitud-check">

                        <input
                            type="checkbox"
                            checked={compromiso}
                            onChange={(evento) =>
                                setCompromiso(evento.target.checked)
                            }
                        />

                        <span>
                            Me comprometo a brindar tenencia responsable:
                            alimentación, atención veterinaria, espacio
                            adecuado y acompañamiento durante toda la vida
                            del animal.
                        </span>

                    </label>


                    {error !== "" && (
                        <div className="solicitud-error">

                            <strong>
                                Revisa tus datos
                            </strong>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    <button
                        type="submit"
                        className="solicitud-enviar"
                        disabled={enviando}
                    >
                        {enviando
                            ? "Enviando solicitud..."
                            : "Enviar solicitud"}
                    </button>

                </form>

            </div>

        </main>
    );
}

export default SolicitudAdopcion;
