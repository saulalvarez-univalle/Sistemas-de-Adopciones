import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    registrarAlbergue,
    obtenerAlberguePorUsuario,
    actualizarAlbergue
} from "../services/albergueService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import MapaUbicacion from "../components/MapaUbicacion";

function Albergue() {

    const navigate = useNavigate();

    const {
        usuarioFirebase,
        perfil
    } = useAuth();

    const [albergueId, setAlbergueId] = useState("");

    const [nombreRefugio, setNombreRefugio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [direccion, setDireccion] = useState("");
    const [telefonoContacto, setTelefonoContacto] = useState("");
    const [horariosAtencion, setHorariosAtencion] = useState("");

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");

    const [posicion, setPosicion] = useState(null);

    const [estadoVerificacion, setEstadoVerificacion] = useState("");
    const [motivoRechazo, setMotivoRechazo] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    useEffect(() => {

        async function cargarDatos() {

            try {

                setCargando(true);
                setError("");

                const listaDepartamentos =
                    await obtenerDepartamentos();

                setDepartamentos(
                    listaDepartamentos
                );

                if (!usuarioFirebase) {
                    return;
                }

                const datosAlbergue =
                    await obtenerAlberguePorUsuario(
                        usuarioFirebase.uid
                    );

                if (datosAlbergue) {

                    setAlbergueId(
                        datosAlbergue.id
                    );

                    setNombreRefugio(
                        datosAlbergue.nombreRefugio || ""
                    );

                    setDescripcion(
                        datosAlbergue.descripcion || ""
                    );

                    setDireccion(
                        datosAlbergue.direccion || ""
                    );

                    setTelefonoContacto(
                        datosAlbergue.telefonoContacto || ""
                    );

                    setHorariosAtencion(
                        datosAlbergue.horariosAtencion || ""
                    );

                    setDepartamentoId(
                        datosAlbergue.departamentoId || ""
                    );

                    setMunicipioId(
                        datosAlbergue.municipioId || ""
                    );

                    setEstadoVerificacion(
                        datosAlbergue.estadoVerificacion || ""
                    );

                    setMotivoRechazo(
                        datosAlbergue.motivoRechazo || ""
                    );

                    if (
                        datosAlbergue.latitud &&
                        datosAlbergue.longitud
                    ) {

                        setPosicion([
                            datosAlbergue.latitud,
                            datosAlbergue.longitud
                        ]);
                    }

                    if (
                        datosAlbergue.departamentoId
                    ) {

                        const listaMunicipios =
                            await obtenerMunicipios(
                                datosAlbergue.departamentoId
                            );

                        setMunicipios(
                            listaMunicipios
                        );
                    }

                } else {

                    if (perfil) {

                        setDepartamentoId(
                            perfil.departamentoId || ""
                        );

                        setMunicipioId(
                            perfil.municipioId || ""
                        );

                        if (perfil.departamentoId) {

                            const listaMunicipios =
                                await obtenerMunicipios(
                                    perfil.departamentoId
                                );

                            setMunicipios(
                                listaMunicipios
                            );
                        }
                    }

                }

            } catch (error) {

                console.error(
                    "Error al cargar el albergue:",
                    error
                );

                setError(
                    "No se pudo cargar la información del albergue."
                );

            } finally {

                setCargando(false);

            }
        }

        cargarDatos();

    }, [usuarioFirebase, perfil]);


    async function manejarDepartamento(evento) {

        const nuevoDepartamentoId =
            evento.target.value;

        setDepartamentoId(
            nuevoDepartamentoId
        );

        setMunicipioId("");
        setMunicipios([]);
        setError("");
        setMensaje("");

        if (nuevoDepartamentoId) {

            try {

                const listaMunicipios =
                    await obtenerMunicipios(
                        nuevoDepartamentoId
                    );

                setMunicipios(
                    listaMunicipios
                );

            } catch (error) {

                console.error(
                    "Error al cargar municipios:",
                    error
                );

                setError(
                    "No se pudieron cargar los municipios."
                );
            }
        }
    }


    function validarFormulario() {

        if (nombreRefugio.trim().length < 3) {

            setError(
                "El nombre del refugio debe tener al menos 3 caracteres."
            );

            return false;
        }

        if (nombreRefugio.trim().length > 100) {

            setError(
                "El nombre del refugio no puede superar los 100 caracteres."
            );

            return false;
        }

        if (descripcion.trim().length < 10) {

            setError(
                "La descripción debe tener al menos 10 caracteres."
            );

            return false;
        }

        if (direccion.trim().length < 5) {

            setError(
                "Ingresa una dirección válida."
            );

            return false;
        }

        if (!/^[567]\d{7}$/.test(telefonoContacto.trim())) {

            setError(
                "El teléfono debe tener 8 dígitos y comenzar con 5, 6 o 7."
            );

            return false;
        }

        if (horariosAtencion.trim().length < 3) {

            setError(
                "Ingresa los horarios de atención."
            );

            return false;
        }

        if (!departamentoId) {

            setError(
                "Selecciona un departamento."
            );

            return false;
        }

        if (!municipioId) {

            setError(
                "Selecciona un municipio."
            );

            return false;
        }

        if (!posicion) {

            setError(
                "Selecciona la ubicación del refugio en el mapa."
            );

            return false;
        }

        return true;
    }


    async function manejarGuardar(evento) {

        evento.preventDefault();

        setError("");
        setMensaje("");

        if (!validarFormulario()) {
            return;
        }

        if (!usuarioFirebase) {

            setError(
                "No hay una sesión activa."
            );

            return;
        }

        try {

            setGuardando(true);

            const datos = {

                userId: usuarioFirebase.uid,

                nombreRefugio:
                    nombreRefugio.trim(),

                descripcion:
                    descripcion.trim(),

                departamentoId:
                    departamentoId,

                municipioId:
                    municipioId,

                direccion:
                    direccion.trim(),

                latitud:
                    posicion[0],

                longitud:
                    posicion[1],

                telefonoContacto:
                    telefonoContacto.trim(),

                horariosAtencion:
                    horariosAtencion.trim()

            };

            if (albergueId) {

    await actualizarAlbergue(
        albergueId,
        datos
    );

    if (
        estadoVerificacion ===
        "Rechazado"
    ) {
        setEstadoVerificacion(
            "Pendiente_Verificacion"
        );

        setMotivoRechazo("");
    }

    setMensaje(
        "La información del albergue se actualizó correctamente."
    );

}else {

                const nuevoId =
                    await registrarAlbergue(
                        datos
                    );

                setAlbergueId(
                    nuevoId
                );

                setEstadoVerificacion(
                    "Pendiente_Verificacion"
                );

                setMotivoRechazo("");

                setMensaje(
                    "La solicitud del albergue fue registrada y quedó pendiente de verificación."
                );
            }

        } catch (error) {

            console.error(
                "Error al guardar el albergue:",
                error
            );

            setError(
                "No se pudo guardar la información. Inténtalo nuevamente."
            );

        } finally {

            setGuardando(false);

        }
    }


    function mostrarEstado() {

        if (!estadoVerificacion) {
            return null;
        }

        if (
            estadoVerificacion ===
            "Pendiente_Verificacion"
        ) {

            return (
                <div className="shelter-status shelter-pending">

                    <span>⏳</span>

                    <div>

                        <strong>
                            Pendiente de verificación
                        </strong>

                        <p>
                            Tu solicitud fue registrada.
                            Un administrador debe revisar la
                            información antes de publicar el refugio.
                        </p>

                    </div>

                </div>
            );
        }

        if (
            estadoVerificacion ===
            "Verificado"
        ) {

            return (
                <div className="shelter-status shelter-approved">

                    <span>✅</span>

                    <div>

                        <strong>
                            Albergue verificado
                        </strong>

                        <p>
                            La información de tu refugio fue
                            verificada correctamente.
                        </p>

                    </div>

                </div>
            );
        }

        if (
            estadoVerificacion ===
            "Rechazado"
        ) {

            return (
                <div className="shelter-status shelter-rejected">

                    <span>⚠️</span>

                    <div>

                        <strong>
                            Solicitud rechazada
                        </strong>

                        <p>
                            Revisa el motivo indicado por el
                            administrador y corrige la información.
                        </p>

                        {motivoRechazo && (
                            <div className="shelter-reason">

                                <strong>
                                    Motivo:
                                </strong>

                                <p>
                                    {motivoRechazo}
                                </p>

                            </div>
                        )}

                    </div>

                </div>
            );
        }

        return null;
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando información del albergue...
                </p>

            </main>
        );
    }


    return (
        <main className="shelter-page">

            <section className="shelter-container">

                <div className="shelter-header">

                    <div>

                        <span className="shelter-label">
                            RED HUELLA
                        </span>

                        <h1>
                            Mi albergue
                        </h1>

                        <p>
                            Registra y administra la información
                            de tu refugio.
                        </p>

                    </div>

                    <button
                        className="shelter-back"
                        onClick={() => navigate("/panel")}
                    >
                        Volver al panel
                    </button>

                </div>


                {mostrarEstado()}


                {error && (
                    <div className="shelter-message shelter-error">
                        {error}
                    </div>
                )}


                {mensaje && (
                    <div className="shelter-message shelter-success">
                        {mensaje}
                    </div>
                )}


                <form
                    className="shelter-form"
                    onSubmit={manejarGuardar}
                >

                    <div className="shelter-section">

                        <h2>
                            Información del refugio
                        </h2>

                        <div className="shelter-grid">

                            <div className="shelter-field">

                                <label htmlFor="nombreRefugio">
                                    Nombre del refugio
                                </label>

                                <input
                                    id="nombreRefugio"
                                    type="text"
                                    value={nombreRefugio}
                                    onChange={(evento) => {
                                        setNombreRefugio(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="100"
                                />

                            </div>


                            <div className="shelter-field">

                                <label htmlFor="telefonoContacto">
                                    Teléfono de contacto
                                </label>

                                <input
                                    id="telefonoContacto"
                                    type="text"
                                    value={telefonoContacto}
                                    onChange={(evento) => {
                                        setTelefonoContacto(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="8"
                                />

                            </div>


                            <div className="shelter-field shelter-field-full">

                                <label htmlFor="descripcion">
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion"
                                    value={descripcion}
                                    onChange={(evento) => {
                                        setDescripcion(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    rows="5"
                                    maxLength="500"
                                />

                            </div>


                            <div className="shelter-field shelter-field-full">

                                <label htmlFor="horariosAtencion">
                                    Horarios de atención
                                </label>

                                <input
                                    id="horariosAtencion"
                                    type="text"
                                    value={horariosAtencion}
                                    onChange={(evento) => {
                                        setHorariosAtencion(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="200"
                                    placeholder="Ej. Lunes a viernes de 09:00 a 18:00"
                                />

                            </div>

                        </div>

                    </div>


                    <div className="shelter-section">

                        <h2>
                            Ubicación y contacto
                        </h2>

                        <div className="shelter-grid">

                            <div className="shelter-field">

                                <label htmlFor="departamento">
                                    Departamento
                                </label>

                                <select
                                    id="departamento"
                                    value={departamentoId}
                                    onChange={manejarDepartamento}
                                >

                                    <option value="">
                                        Selecciona un departamento
                                    </option>

                                    {departamentos.map(
                                        (departamento) => (
                                            <option
                                                key={departamento.id}
                                                value={departamento.id}
                                            >
                                                {departamento.nombre}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="shelter-field">

                                <label htmlFor="municipio">
                                    Municipio
                                </label>

                                <select
                                    id="municipio"
                                    value={municipioId}
                                    onChange={(evento) => {
                                        setMunicipioId(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    disabled={
                                        !departamentoId
                                    }
                                >

                                    <option value="">
                                        Selecciona un municipio
                                    </option>

                                    {municipios.map(
                                        (municipio) => (
                                            <option
                                                key={municipio.id}
                                                value={municipio.id}
                                            >
                                                {municipio.nombre}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="shelter-field shelter-field-full">

                                <label htmlFor="direccion">
                                    Dirección
                                </label>

                                <input
                                    id="direccion"
                                    type="text"
                                    value={direccion}
                                    onChange={(evento) => {
                                        setDireccion(
                                            evento.target.value
                                        );
                                        setError("");
                                        setMensaje("");
                                    }}
                                    maxLength="200"
                                />

                            </div>

                        </div>


                        <div className="shelter-map-info">

                            <p>
                                Selecciona en el mapa la ubicación
                                exacta del refugio.
                            </p>

                        </div>

                        <MapaUbicacion
                            posicion={posicion}
                            setPosicion={setPosicion}
                        />

                    </div>


                    <div className="shelter-actions">

                        <button
                            type="button"
                            className="shelter-cancel"
                            onClick={() => navigate("/panel")}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="shelter-save"
                            disabled={guardando}
                        >
                            {guardando
                                ? "Guardando..."
                                : "Guardar información"}
                        </button>

                    </div>

                </form>

            </section>

        </main>
    );
}

export default Albergue;