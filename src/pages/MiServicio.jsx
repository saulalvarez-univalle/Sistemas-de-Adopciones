import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    registrarServicio,
    obtenerServicioPorUsuario,
    actualizarServicio,
    CATEGORIAS_SERVICIO
} from "../services/servicioService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import MapaUbicacion from "../components/MapaUbicacion";

import CampoImagen from "../components/CampoImagen";

import "../styles/servicios.css";

function MiServicio() {

    const navigate = useNavigate();

    const { usuarioFirebase, perfil } = useAuth();

    const [servicioId, setServicioId] = useState("");

    const [categoria, setCategoria] = useState("");
    const [nombreComercio, setNombreComercio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [serviciosOfrecidos, setServiciosOfrecidos] = useState("");
    const [horarioAtencion, setHorarioAtencion] = useState("");

    const [fotoUrl, setFotoUrl] = useState("");
    const [telefono, setTelefono] = useState("");
    const [telefonoEmergencias, setTelefonoEmergencias] = useState("");
    const [direccion, setDireccion] = useState("");

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


    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const listaDepartamentos = await obtenerDepartamentos();

            setDepartamentos(listaDepartamentos);

            if (!usuarioFirebase) {
                return;
            }

            const datos = await obtenerServicioPorUsuario(
                usuarioFirebase.uid
            );

            if (datos) {

                setServicioId(datos.id);
                setCategoria(datos.categoria || "");
                setNombreComercio(datos.nombreComercio || "");
                setDescripcion(datos.descripcion || "");
                setServiciosOfrecidos(
                    (datos.serviciosOfrecidos || []).join(", ")
                );
                setHorarioAtencion(datos.horarioAtencion || "");
                setFotoUrl(datos.fotoUrl || "");
                setTelefono(datos.telefono || "");
                setTelefonoEmergencias(datos.telefonoEmergencias || "");
                setDireccion(datos.direccion || "");
                setDepartamentoId(datos.departamentoId || "");
                setMunicipioId(datos.municipioId || "");
                setEstadoVerificacion(datos.estadoVerificacion || "");
                setMotivoRechazo(datos.motivoRechazo || "");

                if (datos.latitud && datos.longitud) {
                    setPosicion([datos.latitud, datos.longitud]);
                }

                if (datos.departamentoId) {

                    setMunicipios(
                        await obtenerMunicipios(datos.departamentoId)
                    );
                }

            } else if (perfil) {

                setDepartamentoId(perfil.departamentoId || "");
                setMunicipioId(perfil.municipioId || "");

                if (perfil.departamentoId) {

                    setMunicipios(
                        await obtenerMunicipios(perfil.departamentoId)
                    );
                }
            }

        } catch (error) {

            console.error(
                "Error al cargar el establecimiento:",
                error
            );

            setError(
                "No se pudo cargar la información de tu establecimiento."
            );

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase, perfil]);


    useEffect(() => {

        cargarDatos();

    }, [cargarDatos]);


    async function manejarDepartamento(evento) {

        const nuevo = evento.target.value;

        setDepartamentoId(nuevo);
        setMunicipioId("");
        setMunicipios([]);
        setError("");
        setMensaje("");

        if (nuevo) {

            try {

                setMunicipios(await obtenerMunicipios(nuevo));

            } catch (error) {

                console.error(
                    "Error al cargar municipios:",
                    error
                );
            }
        }
    }


    function validarFormulario() {

        if (categoria === "") {
            return "Selecciona la categoría de tu establecimiento.";
        }

        if (nombreComercio.trim().length < 3) {
            return "El nombre del establecimiento debe tener al menos 3 caracteres.";
        }

        if (nombreComercio.trim().length > 100) {
            return "El nombre no puede superar los 100 caracteres.";
        }

        if (descripcion.trim().length < 20) {
            return "La descripción debe tener al menos 20 caracteres.";
        }

        if (descripcion.trim().length > 600) {
            return "La descripción no puede superar los 600 caracteres.";
        }

        if (serviciosOfrecidos.trim() === "") {
            return "Indica al menos un servicio que ofreces.";
        }

        if (!/^[567]\d{7}$/.test(telefono.trim())) {
            return "El teléfono debe tener 8 dígitos y comenzar con 5, 6 o 7.";
        }

        if (
            telefonoEmergencias.trim() !== "" &&
            !/^[567]\d{7}$/.test(telefonoEmergencias.trim())
        ) {
            return "El teléfono de emergencias debe tener 8 dígitos y comenzar con 5, 6 o 7.";
        }

        if (horarioAtencion.trim().length < 5) {
            return "Indica tus horarios de atención.";
        }

        if (!departamentoId) {
            return "Selecciona un departamento.";
        }

        if (!municipioId) {
            return "Selecciona un municipio.";
        }

        if (direccion.trim().length < 5) {
            return "Ingresa la dirección de tu establecimiento.";
        }

        if (!posicion) {
            return "Marca la ubicación de tu establecimiento en el mapa.";
        }

        return "";
    }


    async function manejarGuardar(evento) {

        evento.preventDefault();

        if (guardando) {
            return;
        }

        setError("");
        setMensaje("");

        const errorFormulario = validarFormulario();

        if (errorFormulario !== "") {

            setError(errorFormulario);

            return;
        }

        const datos = {
            userId: usuarioFirebase.uid,
            categoria: categoria,
            nombreComercio: nombreComercio.trim(),
            descripcion: descripcion.trim(),
            serviciosOfrecidos: serviciosOfrecidos
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== ""),
            horarioAtencion: horarioAtencion.trim(),
            fotoUrl: fotoUrl.trim(),
            telefono: telefono.trim(),
            telefonoEmergencias: telefonoEmergencias.trim(),
            departamentoId: departamentoId,
            municipioId: municipioId,
            direccion: direccion.trim(),
            latitud: posicion[0],
            longitud: posicion[1]
        };

        try {

            setGuardando(true);

            if (servicioId !== "") {

                await actualizarServicio(servicioId, datos);

                setMensaje("La información se actualizó correctamente.");

            } else {

                await registrarServicio(datos);

                setMensaje(
                    "Tu establecimiento se registró. Quedará visible cuando el administrador lo verifique."
                );
            }

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al guardar el establecimiento:",
                error
            );

            setError(
                error.message ||
                "No se pudo guardar la información. Inténtalo nuevamente."
            );

        } finally {

            setGuardando(false);
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando tu establecimiento...
                </p>

            </main>
        );
    }


    return (
        <main className="servicio-page">

            <div className="servicio-container">

                <header className="servicio-header">

                    <div>

                        <span className="servicio-label">
                            RED HUELLA / MI ESTABLECIMIENTO
                        </span>

                        <h1>
                            {servicioId !== ""
                                ? nombreComercio
                                : "Registra tu establecimiento"}
                        </h1>

                        <p>
                            Veterinarias, tiendas de mascotas y peluquerías
                            caninas y felinas. Una vez verificado, tu
                            establecimiento aparece en el directorio público
                            y en el mapa.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="servicio-back"
                        onClick={() => navigate("/panel")}
                    >
                        Volver al panel
                    </button>

                </header>


                {estadoVerificacion === "Pendiente_Verificacion" && (
                    <div className="servicio-estado servicio-estado-pendiente">
                        Pendiente de verificación
                    </div>
                )}

                {estadoVerificacion === "Verificado" && (
                    <div className="servicio-estado servicio-estado-verificado">
                        Establecimiento verificado
                    </div>
                )}

                {estadoVerificacion === "Rechazado" && (
                    <div className="servicio-estado servicio-estado-rechazado">

                        <strong>
                            Solicitud rechazada
                        </strong>

                        <span>
                            Motivo: {motivoRechazo}
                        </span>

                    </div>
                )}


                {mensaje !== "" && (
                    <div className="servicio-success">
                        {mensaje}
                    </div>
                )}


                <form
                    className="servicio-form"
                    onSubmit={manejarGuardar}
                >

                    <h2>
                        Información del establecimiento
                    </h2>

                    <div className="servicio-grid">

                        <div className="servicio-field">

                            <label htmlFor="categoria">
                                Categoría
                            </label>

                            <select
                                id="categoria"
                                value={categoria}
                                onChange={(evento) =>
                                    setCategoria(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una opción
                                </option>

                                {CATEGORIAS_SERVICIO.map((opcion) => (

                                    <option
                                        key={opcion}
                                        value={opcion}
                                    >
                                        {opcion}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="servicio-field">

                            <label htmlFor="nombre">
                                Nombre del establecimiento
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                value={nombreComercio}
                                onChange={(evento) =>
                                    setNombreComercio(evento.target.value)
                                }
                                maxLength="100"
                                placeholder="Ej. Veterinaria San Francisco"
                            />

                        </div>


                        <div className="servicio-field servicio-field-full">

                            <label htmlFor="descripcion">
                                Descripción
                            </label>

                            <textarea
                                id="descripcion"
                                rows="3"
                                value={descripcion}
                                onChange={(evento) =>
                                    setDescripcion(evento.target.value)
                                }
                                maxLength="600"
                                placeholder="Cuenta qué hace tu establecimiento y desde cuándo atiende."
                            />

                            <small>
                                Entre 20 y 600 caracteres.
                            </small>

                        </div>


                        <div className="servicio-field servicio-field-full">

                            <label htmlFor="ofrecidos">
                                Servicios que ofreces
                            </label>

                            <input
                                id="ofrecidos"
                                type="text"
                                value={serviciosOfrecidos}
                                onChange={(evento) =>
                                    setServiciosOfrecidos(evento.target.value)
                                }
                                maxLength="300"
                                placeholder="Consultas, vacunación, cirugía, laboratorio"
                            />

                            <small>
                                Sepáralos con comas.
                            </small>

                        </div>


                        <div className="servicio-field">

                            <label htmlFor="telefono">
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                type="tel"
                                value={telefono}
                                onChange={(evento) => {

                                    if (/^[0-9]*$/.test(evento.target.value)) {
                                        setTelefono(evento.target.value);
                                    }
                                }}
                                maxLength="8"
                                placeholder="Ej. 44123456"
                            />

                        </div>


                        <div className="servicio-field">

                            <label htmlFor="emergencias">
                                Teléfono de emergencias <span>(opcional)</span>
                            </label>

                            <input
                                id="emergencias"
                                type="tel"
                                value={telefonoEmergencias}
                                onChange={(evento) => {

                                    if (/^[0-9]*$/.test(evento.target.value)) {
                                        setTelefonoEmergencias(
                                            evento.target.value
                                        );
                                    }
                                }}
                                maxLength="8"
                                placeholder="Ej. 71234567"
                            />

                        </div>


                        <div className="servicio-field servicio-field-full">

                            <label htmlFor="horarios">
                                Horarios de atención
                            </label>

                            <input
                                id="horarios"
                                type="text"
                                value={horarioAtencion}
                                onChange={(evento) =>
                                    setHorarioAtencion(evento.target.value)
                                }
                                maxLength="150"
                                placeholder="Lunes a viernes de 9:00 a 19:00, sábados de 9:00 a 13:00"
                            />

                        </div>


                        <div className="servicio-field servicio-field-full">

                            <CampoImagen
                                id="foto-servicio"
                                etiqueta="Fotografía del establecimiento"
                                ayuda="Aparece en el directorio y al abrir tu marcador en el mapa. La fachada o el interior del local funcionan bien."
                                valor={fotoUrl}
                                alCambiar={setFotoUrl}
                            />

                        </div>

                    </div>


                    <h2>
                        Ubicación
                    </h2>

                    <div className="servicio-grid">

                        <div className="servicio-field">

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

                                {departamentos.map((departamento) => (

                                    <option
                                        key={departamento.id}
                                        value={departamento.id}
                                    >
                                        {departamento.nombre}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="servicio-field">

                            <label htmlFor="municipio">
                                Municipio
                            </label>

                            <select
                                id="municipio"
                                value={municipioId}
                                onChange={(evento) =>
                                    setMunicipioId(evento.target.value)
                                }
                                disabled={!departamentoId}
                            >
                                <option value="">
                                    Selecciona un municipio
                                </option>

                                {municipios.map((municipio) => (

                                    <option
                                        key={municipio.id}
                                        value={municipio.id}
                                    >
                                        {municipio.nombre}
                                    </option>

                                ))}
                            </select>

                        </div>


                        <div className="servicio-field servicio-field-full">

                            <label htmlFor="direccion">
                                Dirección
                            </label>

                            <input
                                id="direccion"
                                type="text"
                                value={direccion}
                                onChange={(evento) =>
                                    setDireccion(evento.target.value)
                                }
                                maxLength="200"
                                placeholder="Av. América esq. Pando n.º 1234"
                            />

                        </div>

                    </div>

                    <p className="servicio-mapa-info">
                        Haz clic sobre el mapa para marcar la ubicación exacta
                        de tu establecimiento.
                    </p>

                    <MapaUbicacion
                        posicion={posicion}
                        setPosicion={setPosicion}
                    />


                    {error !== "" && (
                        <div className="servicio-error">
                            {error}
                        </div>
                    )}


                    <div className="servicio-actions">

                        <button
                            type="submit"
                            className="servicio-save"
                            disabled={guardando}
                        >
                            {guardando
                                ? "Guardando..."
                                : "Guardar información"}
                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
}

export default MiServicio;
