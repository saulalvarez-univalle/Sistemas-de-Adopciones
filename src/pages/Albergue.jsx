import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
    obtenerAlberguePorUsuario,
    registrarAlbergue,
    actualizarAlbergue
} from "../services/albergueService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import MapaUbicacion from "../components/MapaUbicacion";


function Albergue() {

    const { usuarioFirebase, perfil } = useAuth();

    const [albergueId, setAlbergueId] = useState("");

    const [nombreRefugio, setNombreRefugio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");
    const [direccion, setDireccion] = useState("");
    const [telefonoContacto, setTelefonoContacto] = useState("");
    const [horariosAtencion, setHorariosAtencion] = useState("");

    const [posicion, setPosicion] = useState(null);

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {

        try {

            const listaDepartamentos = await obtenerDepartamentos();

            setDepartamentos(listaDepartamentos);

            if (usuarioFirebase) {

                const datosAlbergue =
                    await obtenerAlberguePorUsuario(usuarioFirebase.uid);

                if (datosAlbergue) {

                    setAlbergueId(datosAlbergue.id);
                    setNombreRefugio(datosAlbergue.nombreRefugio || "");
                    setDescripcion(datosAlbergue.descripcion || "");
                    setDepartamentoId(datosAlbergue.departamentoId || "");
                    setMunicipioId(datosAlbergue.municipioId || "");
                    setDireccion(datosAlbergue.direccion || "");
                    setHorariosAtencion(datosAlbergue.horariosAtencion || "");

                    if (datosAlbergue.telefonoContacto) {
                        setTelefonoContacto(
                            datosAlbergue.telefonoContacto
                        );
                    }

                    if (
                        datosAlbergue.latitud !== undefined &&
                        datosAlbergue.longitud !== undefined
                    ) {
                        setPosicion([
                            datosAlbergue.latitud,
                            datosAlbergue.longitud
                        ]);
                    }

                    if (datosAlbergue.departamentoId) {

                        const listaMunicipios =
                            await obtenerMunicipios(
                                datosAlbergue.departamentoId
                            );

                        setMunicipios(listaMunicipios);
                    }
                }
            }

        } catch (error) {

            console.error(error);

            setMensaje(
                "No se pudieron cargar los datos del albergue."
            );

        } finally {

            setCargando(false);
        }
    }

    async function cambiarDepartamento(evento) {

        const nuevoDepartamentoId = evento.target.value;

        setDepartamentoId(nuevoDepartamentoId);
        setMunicipioId("");

        if (nuevoDepartamentoId !== "") {

            const listaMunicipios =
                await obtenerMunicipios(nuevoDepartamentoId);

            setMunicipios(listaMunicipios);

        } else {

            setMunicipios([]);
        }
    }

    function limpiarError(campo) {

        setErrores({
            ...errores,
            [campo]: ""
        });

        setMensaje("");
    }

    async function guardar(evento) {

        evento.preventDefault();

        const nuevosErrores = {};

        const nombreLimpio = nombreRefugio.trim();
        const descripcionLimpia = descripcion.trim();
        const direccionLimpia = direccion.trim();
        const telefonoLimpio = telefonoContacto.trim();
        const horariosLimpios = horariosAtencion.trim();

        if (nombreLimpio === "") {
            nuevosErrores.nombreRefugio =
                "Ingresa el nombre del refugio.";
        } else if (nombreLimpio.length < 3) {
            nuevosErrores.nombreRefugio =
                "El nombre debe tener al menos 3 caracteres.";
        } else if (nombreLimpio.length > 100) {
            nuevosErrores.nombreRefugio =
                "El nombre no puede superar los 100 caracteres.";
        }

        if (descripcionLimpia === "") {
            nuevosErrores.descripcion =
                "Ingresa una descripción del refugio.";
        } else if (descripcionLimpia.length < 10) {
            nuevosErrores.descripcion =
                "La descripción debe tener al menos 10 caracteres.";
        } else if (descripcionLimpia.length > 500) {
            nuevosErrores.descripcion =
                "La descripción no puede superar los 500 caracteres.";
        }

        if (departamentoId === "") {
            nuevosErrores.departamentoId =
                "Selecciona un departamento.";
        }

        if (municipioId === "") {
            nuevosErrores.municipioId =
                "Selecciona un municipio.";
        }

        if (direccionLimpia === "") {
            nuevosErrores.direccion =
                "Ingresa la dirección.";
        } else if (direccionLimpia.length < 5) {
            nuevosErrores.direccion =
                "Ingresa una dirección válida.";
        } else if (direccionLimpia.length > 200) {
            nuevosErrores.direccion =
                "La dirección no puede superar los 200 caracteres.";
        }

        if (telefonoLimpio === "") {
            nuevosErrores.telefonoContacto =
                "Ingresa un teléfono de contacto.";
        } else if (!/^[0-9]{8}$/.test(telefonoLimpio)) {
            nuevosErrores.telefonoContacto =
                "El teléfono debe contener exactamente 8 números.";
        }

        if (horariosLimpios === "") {
            nuevosErrores.horariosAtencion =
                "Ingresa los horarios de atención.";
        } else if (horariosLimpios.length < 5) {
            nuevosErrores.horariosAtencion =
                "Ingresa un horario de atención válido.";
        } else if (horariosLimpios.length > 200) {
            nuevosErrores.horariosAtencion =
                "El horario no puede superar los 200 caracteres.";
        }

        if (posicion === null) {
            nuevosErrores.posicion =
                "Selecciona la ubicación del refugio en el mapa.";
        } else {

            if (
                typeof posicion[0] !== "number" ||
                posicion[0] < -90 ||
                posicion[0] > 90
            ) {
                nuevosErrores.posicion =
                    "La latitud de la ubicación no es válida.";
            }

            if (
                typeof posicion[1] !== "number" ||
                posicion[1] < -180 ||
                posicion[1] > 180
            ) {
                nuevosErrores.posicion =
                    "La longitud de la ubicación no es válida.";
            }
        }

        setErrores(nuevosErrores);
        setMensaje("");

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        setGuardando(true);

        try {

            const datos = {
                userId: usuarioFirebase.uid,
                nombreRefugio: nombreLimpio,
                descripcion: descripcionLimpia,
                departamentoId: departamentoId,
                municipioId: municipioId,
                direccion: direccionLimpia,
                latitud: posicion[0],
                longitud: posicion[1],
                telefonoContacto: telefonoLimpio,
                horariosAtencion: horariosLimpios
            };

            if (albergueId === "") {

                const nuevoId =
                    await registrarAlbergue(datos);

                setAlbergueId(nuevoId);

                setMensaje(
                    "Los datos del albergue fueron registrados correctamente. Quedan pendientes de verificación."
                );

            } else {

                await actualizarAlbergue(
                    albergueId,
                    datos
                );

                setMensaje(
                    "Los datos del albergue fueron actualizados correctamente."
                );
            }

        } catch (error) {

            console.error(
                "ERROR AL GUARDAR ALBERGUE:",
                error
            );

            setMensaje(
                "No se pudieron guardar los datos del albergue. Intenta nuevamente."
            );

        } finally {

            setGuardando(false);
        }
    }

    if (cargando) {
        return <p>Cargando información del albergue...</p>;
    }

    if (
        perfil &&
        perfil.rol !== "Albergue/Refugio" &&
        perfil.rol !== "Admin" &&
        perfil.rol !== "Superusuario"
    ) {
        return (
            <div>
                <h1>Acceso no permitido</h1>

                <p>
                    Tu tipo de cuenta no puede registrar un albergue o refugio.
                </p>
            </div>
        );
    }

    return (
        <div>

            <h1>Datos del albergue o refugio</h1>

            <p>
                Completa la información de tu refugio para que pueda
                ser verificado por un administrador.
            </p>

            {mensaje && (
                <p>
                    {mensaje}
                </p>
            )}

            <form onSubmit={guardar}>

                <div>
                    <label>Nombre del refugio</label>

                    <input
                        type="text"
                        value={nombreRefugio}
                        onChange={(evento) => {
                            setNombreRefugio(evento.target.value);
                            limpiarError("nombreRefugio");
                        }}
                    />

                    {errores.nombreRefugio && (
                        <p>
                            {errores.nombreRefugio}
                        </p>
                    )}
                </div>

                <div>
                    <label>Descripción</label>

                    <textarea
                        value={descripcion}
                        onChange={(evento) => {
                            setDescripcion(evento.target.value);
                            limpiarError("descripcion");
                        }}
                    />

                    {errores.descripcion && (
                        <p>
                            {errores.descripcion}
                        </p>
                    )}
                </div>

                <div>
                    <label>Departamento</label>

                    <select
                        value={departamentoId}
                        onChange={(evento) => {
                            cambiarDepartamento(evento);
                            limpiarError("departamentoId");
                            limpiarError("municipioId");
                        }}
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

                    {errores.departamentoId && (
                        <p>
                            {errores.departamentoId}
                        </p>
                    )}
                </div>

                <div>
                    <label>Municipio</label>

                    <select
                        value={municipioId}
                        onChange={(evento) => {
                            setMunicipioId(evento.target.value);
                            limpiarError("municipioId");
                        }}
                        disabled={departamentoId === ""}
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

                    {errores.municipioId && (
                        <p>
                            {errores.municipioId}
                        </p>
                    )}
                </div>

                <div>
                    <label>Dirección</label>

                    <input
                        type="text"
                        value={direccion}
                        onChange={(evento) => {
                            setDireccion(evento.target.value);
                            limpiarError("direccion");
                        }}
                    />

                    {errores.direccion && (
                        <p>
                            {errores.direccion}
                        </p>
                    )}
                </div>

                <div>
                    <label>Teléfono de contacto</label>

                    <input
                        type="text"
                        value={telefonoContacto}
                        onChange={(evento) => {
                            setTelefonoContacto(evento.target.value);
                            limpiarError("telefonoContacto");
                        }}
                    />

                    {errores.telefonoContacto && (
                        <p>
                            {errores.telefonoContacto}
                        </p>
                    )}
                </div>

                <div>
                    <label>Horarios de atención</label>

                    <input
                        type="text"
                        placeholder="Ej.: Lunes a viernes de 08:00 a 17:00"
                        value={horariosAtencion}
                        onChange={(evento) => {
                            setHorariosAtencion(evento.target.value);
                            limpiarError("horariosAtencion");
                        }}
                    />

                    {errores.horariosAtencion && (
                        <p>
                            {errores.horariosAtencion}
                        </p>
                    )}
                </div>

                <div>

                    <h2>Ubicación del refugio</h2>

                    <p>
                        Haz clic en el mapa para colocar la ubicación exacta
                        del refugio.
                    </p>

                    <MapaUbicacion
                        posicion={posicion}
                        setPosicion={(nuevaPosicion) => {
                            setPosicion(nuevaPosicion);
                            limpiarError("posicion");
                        }}
                    />

                    {posicion && (
                        <p>
                            Ubicación seleccionada:
                            <br />
                            Latitud: {posicion[0]}
                            <br />
                            Longitud: {posicion[1]}
                        </p>
                    )}

                    {errores.posicion && (
                        <p>
                            {errores.posicion}
                        </p>
                    )}

                </div>

                <button
                    type="submit"
                    disabled={guardando}
                >
                    {guardando
                        ? "Guardando..."
                        : "Guardar datos del refugio"}
                </button>

            </form>

        </div>
    );
}

export default Albergue;
