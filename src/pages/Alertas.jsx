import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    publicarAlerta,
    obtenerAlertasActivas,
    marcarComoResuelta,
    filtrarAlertas,
    TIPOS_ALERTA
} from "../services/alertaService";

import { obtenerEspeciesActivas } from "../services/especieService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

import { validarUrlImagen } from "../services/storageService";

import "../styles/alertas.css";

const FORMULARIO_VACIO = {
    tipoAlerta: "",
    nombreMascota: "",
    especieId: "",
    descripcion: "",
    departamentoId: "",
    municipioId: "",
    zonaExtravio: "",
    fechaSuceso: "",
    telefonoContacto: "",
    fotoUrl: ""
};

function Alertas() {

    const navigate = useNavigate();

    const { usuarioFirebase, perfil } = useAuth();

    const [alertas, setAlertas] = useState([]);
    const [filtradas, setFiltradas] = useState([]);

    const [especies, setEspecies] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [texto, setTexto] = useState("");
    const [tipoAlerta, setTipoAlerta] = useState("");
    const [especieId, setEspecieId] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [municipioId, setMunicipioId] = useState("");

    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [municipiosFormulario, setMunicipiosFormulario] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargarDatos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            setAlertas(await obtenerAlertasActivas());
            setEspecies(await obtenerEspeciesActivas());
            setDepartamentos(await obtenerDepartamentos());

        } catch (error) {

            console.error(
                "Error al cargar las alertas:",
                error
            );

            setError("No fue posible cargar las alertas.");

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargarDatos();

    }, [cargarDatos]);


    useEffect(() => {

        async function cargarMunicipios() {

            if (!departamentoId) {

                setMunicipios([]);

                return;
            }

            setMunicipios(await obtenerMunicipios(departamentoId));
        }

        cargarMunicipios();

    }, [departamentoId]);


    useEffect(() => {

        setFiltradas(
            filtrarAlertas(alertas, {
                texto,
                tipoAlerta,
                especieId,
                departamentoId,
                municipioId
            })
        );

    }, [alertas, texto, tipoAlerta, especieId, departamentoId, municipioId]);


    function cambiarCampo(campo, valor) {

        setFormulario({
            ...formulario,
            [campo]: valor
        });

        setError("");
        setMensaje("");
    }


    async function cambiarDepartamentoFormulario(evento) {

        const nuevo = evento.target.value;

        setFormulario({
            ...formulario,
            departamentoId: nuevo,
            municipioId: ""
        });

        setMunicipiosFormulario(
            nuevo ? await obtenerMunicipios(nuevo) : []
        );
    }


    function abrirFormulario() {

        if (!usuarioFirebase) {

            navigate("/login");

            return;
        }

        setFormulario({
            ...FORMULARIO_VACIO,
            telefonoContacto: perfil?.telefono || ""
        });

        setMunicipiosFormulario([]);
        setMostrarFormulario(true);
        setError("");
        setMensaje("");
    }


    function validarFormulario() {

        if (formulario.tipoAlerta === "") {
            return "Indica si perdiste una mascota o encontraste una.";
        }

        if (formulario.especieId === "") {
            return "Selecciona la especie.";
        }

        if (formulario.descripcion.trim().length < 20) {
            return "La descripción debe tener al menos 20 caracteres.";
        }

        if (formulario.descripcion.trim().length > 600) {
            return "La descripción no puede superar los 600 caracteres.";
        }

        if (!formulario.departamentoId) {
            return "Selecciona el departamento.";
        }

        if (!formulario.municipioId) {
            return "Selecciona el municipio.";
        }

        if (formulario.zonaExtravio.trim().length < 5) {
            return "Indica la zona donde ocurrió.";
        }

        if (formulario.fechaSuceso === "") {
            return "Indica la fecha en que ocurrió.";
        }

        if (!/^[567]\d{7}$/.test(formulario.telefonoContacto.trim())) {
            return "El teléfono debe tener 8 dígitos y comenzar con 5, 6 o 7.";
        }

        const errorFoto = validarUrlImagen(formulario.fotoUrl);

        if (errorFoto !== "") {
            return errorFoto;
        }

        return "";
    }


    async function manejarPublicar(evento) {

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

        try {

            setGuardando(true);

            await publicarAlerta({
                userId: usuarioFirebase.uid,
                tipoAlerta: formulario.tipoAlerta,
                nombreMascota: formulario.nombreMascota.trim(),
                especieId: formulario.especieId,
                descripcion: formulario.descripcion.trim(),
                departamentoId: formulario.departamentoId,
                municipioId: formulario.municipioId,
                zonaExtravio: formulario.zonaExtravio.trim(),
                fechaSuceso: formulario.fechaSuceso,
                telefonoContacto: formulario.telefonoContacto.trim(),
                fotoUrl: formulario.fotoUrl.trim()
            });

            setMensaje("Tu alerta se publicó correctamente.");

            setMostrarFormulario(false);
            setFormulario(FORMULARIO_VACIO);

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al publicar la alerta:",
                error
            );

            setError(
                error.message ||
                "No se pudo publicar la alerta."
            );

        } finally {

            setGuardando(false);
        }
    }


    async function resolver(alerta) {

        setError("");
        setMensaje("");

        try {

            await marcarComoResuelta(alerta.id);

            setMensaje(
                "Alerta cerrada. Nos alegra que se haya resuelto."
            );

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al cerrar la alerta:",
                error
            );

            setError("No se pudo cerrar la alerta.");
        }
    }


    function nombreEspecie(id) {

        for (const especie of especies) {

            if (especie.id === id) {
                return especie.nombre;
            }
        }

        return "Mascota";
    }


    function formatearFecha(valor) {

        if (!valor) {
            return "";
        }

        const partes = valor.split("-");

        if (partes.length !== 3) {
            return valor;
        }

        return partes[2] + "/" + partes[1] + "/" + partes[0];
    }


    function limpiarFiltros() {

        setTexto("");
        setTipoAlerta("");
        setEspecieId("");
        setDepartamentoId("");
        setMunicipioId("");
    }


    return (
        <main className="alertas-page">

            <section className="alertas-hero">

                <span className="alertas-label">
                    RED HUELLA / COMUNIDAD
                </span>

                <h1>
                    Mascotas perdidas
                    <span> y encontradas.</span>
                </h1>

                <p>
                    Un muro comunitario para ayudar a que los animales
                    extraviados vuelvan a casa. Publica tu caso o revisa si
                    alguien encontró al tuyo.
                </p>

                <button
                    type="button"
                    className="alertas-publicar"
                    onClick={abrirFormulario}
                >
                    + Publicar una alerta
                </button>

            </section>


            <section className="alertas-content">

                {mensaje !== "" && (
                    <div className="alertas-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && !mostrarFormulario && (
                    <div className="alertas-error">
                        {error}
                    </div>
                )}


                {mostrarFormulario && (

                    <form
                        className="alertas-form"
                        onSubmit={manejarPublicar}
                    >

                        <h2>
                            Publicar una alerta
                        </h2>

                        <div className="alertas-grid">

                            <div className="alertas-field">

                                <label htmlFor="tipo">
                                    ¿Qué ocurrió?
                                </label>

                                <select
                                    id="tipo"
                                    value={formulario.tipoAlerta}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "tipoAlerta",
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Selecciona una opción
                                    </option>

                                    <option value="Perdida">
                                        Perdí a mi mascota
                                    </option>

                                    <option value="Encontrada">
                                        Encontré una mascota
                                    </option>
                                </select>

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="especie">
                                    Especie
                                </label>

                                <select
                                    id="especie"
                                    value={formulario.especieId}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "especieId",
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Selecciona una opción
                                    </option>

                                    {especies.map((especie) => (

                                        <option
                                            key={especie.id}
                                            value={especie.id}
                                        >
                                            {especie.nombre}
                                        </option>

                                    ))}
                                </select>

                            </div>


                            <div className="alertas-field alertas-field-full">

                                <label htmlFor="nombre-mascota">
                                    Nombre de la mascota <span>(si lo sabes)</span>
                                </label>

                                <input
                                    id="nombre-mascota"
                                    type="text"
                                    value={formulario.nombreMascota}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "nombreMascota",
                                            evento.target.value
                                        )
                                    }
                                    maxLength="50"
                                    placeholder="Ej. Lucas"
                                />

                            </div>


                            <div className="alertas-field alertas-field-full">

                                <label htmlFor="descripcion-alerta">
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion-alerta"
                                    rows="4"
                                    value={formulario.descripcion}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "descripcion",
                                            evento.target.value
                                        )
                                    }
                                    maxLength="600"
                                    placeholder="Describe su color, tamaño, collar, señas particulares y cualquier detalle que ayude a identificarla."
                                />

                                <small>
                                    Entre 20 y 600 caracteres.
                                </small>

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="departamento-alerta">
                                    Departamento
                                </label>

                                <select
                                    id="departamento-alerta"
                                    value={formulario.departamentoId}
                                    onChange={cambiarDepartamentoFormulario}
                                >
                                    <option value="">
                                        Selecciona una opción
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


                            <div className="alertas-field">

                                <label htmlFor="municipio-alerta">
                                    Municipio
                                </label>

                                <select
                                    id="municipio-alerta"
                                    value={formulario.municipioId}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "municipioId",
                                            evento.target.value
                                        )
                                    }
                                    disabled={!formulario.departamentoId}
                                >
                                    <option value="">
                                        Selecciona una opción
                                    </option>

                                    {municipiosFormulario.map((municipio) => (

                                        <option
                                            key={municipio.id}
                                            value={municipio.id}
                                        >
                                            {municipio.nombre}
                                        </option>

                                    ))}
                                </select>

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="zona">
                                    Zona
                                </label>

                                <input
                                    id="zona"
                                    type="text"
                                    value={formulario.zonaExtravio}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "zonaExtravio",
                                            evento.target.value
                                        )
                                    }
                                    maxLength="150"
                                    placeholder="Ej. Parque Lincoln, av. Pando"
                                />

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="fecha">
                                    Fecha
                                </label>

                                <input
                                    id="fecha"
                                    type="date"
                                    value={formulario.fechaSuceso}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "fechaSuceso",
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="telefono-alerta">
                                    Teléfono de contacto
                                </label>

                                <input
                                    id="telefono-alerta"
                                    type="tel"
                                    value={formulario.telefonoContacto}
                                    onChange={(evento) => {

                                        if (/^[0-9]*$/.test(evento.target.value)) {
                                            cambiarCampo(
                                                "telefonoContacto",
                                                evento.target.value
                                            );
                                        }
                                    }}
                                    maxLength="8"
                                    placeholder="Ej. 71234567"
                                />

                            </div>


                            <div className="alertas-field">

                                <label htmlFor="foto-alerta">
                                    Fotografía
                                </label>

                                <input
                                    id="foto-alerta"
                                    type="url"
                                    value={formulario.fotoUrl}
                                    onChange={(evento) =>
                                        cambiarCampo(
                                            "fotoUrl",
                                            evento.target.value
                                        )
                                    }
                                    maxLength="600"
                                    placeholder="https://ejemplo.com/foto.jpg"
                                />

                                <small>
                                    Pega el enlace de una imagen publicada.
                                </small>

                            </div>

                        </div>


                        {error !== "" && (
                            <div className="alertas-error">
                                {error}
                            </div>
                        )}


                        <div className="alertas-actions">

                            <button
                                type="submit"
                                className="alertas-save"
                                disabled={guardando}
                            >
                                {guardando
                                    ? "Publicando..."
                                    : "Publicar alerta"}
                            </button>

                            <button
                                type="button"
                                className="alertas-cancel"
                                onClick={() => setMostrarFormulario(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                        </div>

                    </form>
                )}


                <div className="alertas-filtros">

                    <div className="alertas-field">

                        <label htmlFor="buscar-alerta">
                            Buscar por nombre o zona
                        </label>

                        <input
                            id="buscar-alerta"
                            type="text"
                            value={texto}
                            onChange={(evento) =>
                                setTexto(evento.target.value)
                            }
                            maxLength="60"
                            placeholder="Ej. Lincoln"
                        />

                    </div>

                    <div className="alertas-field">

                        <label htmlFor="tipo-filtro">
                            Tipo
                        </label>

                        <select
                            id="tipo-filtro"
                            value={tipoAlerta}
                            onChange={(evento) =>
                                setTipoAlerta(evento.target.value)
                            }
                        >
                            <option value="">
                                Todas
                            </option>

                            {TIPOS_ALERTA.map((opcion) => (

                                <option
                                    key={opcion}
                                    value={opcion}
                                >
                                    {opcion === "Perdida"
                                        ? "Perdidas"
                                        : "Encontradas"}
                                </option>

                            ))}
                        </select>

                    </div>

                    <div className="alertas-field">

                        <label htmlFor="especie-filtro">
                            Especie
                        </label>

                        <select
                            id="especie-filtro"
                            value={especieId}
                            onChange={(evento) =>
                                setEspecieId(evento.target.value)
                            }
                        >
                            <option value="">
                                Todas
                            </option>

                            {especies.map((especie) => (

                                <option
                                    key={especie.id}
                                    value={especie.id}
                                >
                                    {especie.nombre}
                                </option>

                            ))}
                        </select>

                    </div>

                    <div className="alertas-field">

                        <label htmlFor="departamento-filtro-alerta">
                            Departamento
                        </label>

                        <select
                            id="departamento-filtro-alerta"
                            value={departamentoId}
                            onChange={(evento) => {

                                setDepartamentoId(evento.target.value);

                                setMunicipioId("");
                            }}
                        >
                            <option value="">
                                Todos
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

                    <div className="alertas-field">

                        <label htmlFor="municipio-filtro-alerta">
                            Municipio
                        </label>

                        <select
                            id="municipio-filtro-alerta"
                            value={municipioId}
                            onChange={(evento) =>
                                setMunicipioId(evento.target.value)
                            }
                            disabled={!departamentoId}
                        >
                            <option value="">
                                Todos
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

                    <button
                        type="button"
                        className="alertas-limpiar"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>

                </div>


                {cargando && (
                    <div className="alertas-empty">

                        <div className="loading-spinner"></div>

                        <p>
                            Cargando alertas...
                        </p>

                    </div>
                )}


                {!cargando && filtradas.length === 0 && (

                    <div className="alertas-empty">

                        <span className="alertas-empty-number">
                            00
                        </span>

                        <strong>
                            No hay alertas activas
                        </strong>

                        <p>
                            Cuando alguien publique una mascota perdida o
                            encontrada, aparecerá aquí.
                        </p>

                    </div>
                )}


                {filtradas.length > 0 && (

                    <div className="alertas-lista">

                        {filtradas.map((alerta) => (

                            <article
                                key={alerta.id}
                                className={
                                    alerta.tipoAlerta === "Perdida"
                                        ? "alerta-card alerta-card-perdida"
                                        : "alerta-card alerta-card-encontrada"
                                }
                            >

                                <div className="alerta-card-image">

                                    <img
                                        src={
                                            alerta.fotoUrl ||
                                            "/imagenes/hero-mascota.png"
                                        }
                                        alt={alerta.nombreMascota || "Mascota"}
                                    />

                                    <span className="alerta-tipo">
                                        {alerta.tipoAlerta === "Perdida"
                                            ? "Se perdió"
                                            : "Fue encontrada"}
                                    </span>

                                </div>

                                <div className="alerta-card-body">

                                    <div className="alerta-card-header">

                                        <h3>
                                            {alerta.nombreMascota ||
                                                nombreEspecie(alerta.especieId)}
                                        </h3>

                                        <span className="alerta-especie">
                                            {nombreEspecie(alerta.especieId)}
                                        </span>

                                    </div>

                                    <p className="alerta-descripcion">
                                        {alerta.descripcion}
                                    </p>

                                    <div className="alerta-datos">

                                        <div>
                                            <span>Zona</span>
                                            <strong>
                                                {alerta.zonaExtravio}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Fecha</span>
                                            <strong>
                                                {formatearFecha(
                                                    alerta.fechaSuceso
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Contacto</span>
                                            <strong>
                                                {alerta.telefonoContacto}
                                            </strong>
                                        </div>

                                    </div>

                                    {usuarioFirebase &&
                                        alerta.userId === usuarioFirebase.uid && (

                                        <button
                                            type="button"
                                            className="alerta-resolver"
                                            onClick={() => resolver(alerta)}
                                        >
                                            Marcar como resuelta
                                        </button>
                                    )}

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Alertas;
