import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
    obtenerPerfil,
    actualizarPerfil
} from "../services/userService";

import {
    obtenerDepartamentos,
    obtenerMunicipios
} from "../services/territorioService";

function Perfil() {
    const navigate = useNavigate();
    const { usuarioFirebase } = useAuth();

    const [nombreCompleto, setNombreCompleto] = useState("");
    const [telefono, setTelefono] = useState("");

    const [departamentos, setDepartamentos] = useState([]);
const [municipios, setMunicipios] = useState([]);

const [departamentoId, setDepartamentoId] = useState("");
const [municipioId, setMunicipioId] = useState("");

    const [email, setEmail] = useState("");
    const [rol, setRol] = useState("");
    const [estadoCuenta, setEstadoCuenta] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        async function cargarPerfil() {
            if (!usuarioFirebase) {
                navigate("/login");
                return;
            }

            try {
                const perfil = await obtenerPerfil(
                    usuarioFirebase.uid
                );

                setNombreCompleto(perfil.nombreCompleto || "");
                setTelefono(perfil.telefono || "");

                setEmail(perfil.email || "");
                setRol(perfil.rol || "");
                setEstadoCuenta(perfil.estadoCuenta || "");
                setDepartamentoId(perfil.departamentoId || "");
                setMunicipioId(perfil.municipioId || "");
            } catch (error) {
                console.error(
                    "Error al cargar el perfil:",
                    error
                );

                setError(
                    "No se pudo cargar tu información. Intenta nuevamente."
                );
            } finally {
                setCargando(false);
            }
        }

        cargarPerfil();
    }, [usuarioFirebase, navigate]);

    useEffect(() => {
    async function cargarDepartamentos() {
        try {
            const datos = await obtenerDepartamentos();

            setDepartamentos(datos);
        } catch (error) {
            console.error(
                "Error al cargar los departamentos:",
                error
            );

            setError(
                "No se pudieron cargar los departamentos."
            );
        }
    }

    cargarDepartamentos();
}, []);

    useEffect(() => {
    async function cargarMunicipios() {
        if (departamentoId === "") {
            setMunicipios([]);
            return;
        }

        try {
            const datos = await obtenerMunicipios(
                departamentoId
            );

            setMunicipios(datos);

            const municipioExiste = datos.some(
                (municipio) =>
                    municipio.id === municipioId
            );

            if (!municipioExiste) {
                setMunicipioId("");
            }
        } catch (error) {
            console.error(
                "Error al cargar los municipios:",
                error
            );

            setError(
                "No se pudieron cargar los municipios."
            );
        }
    }

    cargarMunicipios();
}, [departamentoId]);

    function validarFormulario() {
        const nombre = nombreCompleto.trim();
        const numero = telefono.trim();

        if (nombre === "") {
            return "El nombre completo es obligatorio.";
        }

        if (nombre.length < 3) {
            return "El nombre completo debe tener al menos 3 caracteres.";
        }

        if (nombre.length > 100) {
            return "El nombre completo no puede superar los 100 caracteres.";
        }

        const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (!nombreValido.test(nombre)) {
            return "El nombre solo puede contener letras y espacios.";
        }

        if (numero === "") {
            return "El número de teléfono es obligatorio.";
        }

        if (!/^[567][0-9]{7}$/.test(numero)) {
            return "El teléfono debe tener 8 dígitos y comenzar con 5, 6 o 7.";
        }

        if (departamentoId === "") {
    return "Debes seleccionar un departamento.";
}

if (municipioId === "") {
    return "Debes seleccionar un municipio.";
}

        return "";
    }

    async function manejarGuardar(event) {
        event.preventDefault();

        setError("");
        setMensaje("");

        const errorValidacion = validarFormulario();

        if (errorValidacion !== "") {
            setError(errorValidacion);
            return;
        }

        if (!usuarioFirebase) {
            setError("Tu sesión ya no está disponible.");
            return;
        }

        setGuardando(true);

        try {
            await actualizarPerfil(
              usuarioFirebase.uid,
              nombreCompleto.trim(),
              telefono.trim(),
              departamentoId,
              municipioId
          );

            setNombreCompleto(nombreCompleto.trim());
            setTelefono(telefono.trim());

            setMensaje("Tus datos se actualizaron correctamente.");
        } catch (error) {
            console.error(
                "Error al actualizar el perfil:",
                error
            );

            setError(
                "No se pudieron guardar los cambios. Intenta nuevamente."
            );
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Cargando tu perfil...</p>
            </div>
        );
    }

    return (
        <main className="profile-page">
            <section className="profile-card">

                <div className="profile-header">
                    <p className="profile-eyebrow">
                        MI CUENTA
                    </p>

                    <h1>Mi perfil</h1>

                    <p>
                        Consulta y actualiza tu información personal.
                    </p>
                </div>

                {error !== "" && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {mensaje !== "" && (
                    <div className="form-success">
                        {mensaje}
                    </div>
                )}

                <form onSubmit={manejarGuardar}>

                    <div className="form-group">
                        <label htmlFor="nombreCompleto">
                            Nombre completo
                        </label>

                        <input
                            id="nombreCompleto"
                            type="text"
                            value={nombreCompleto}
                            onChange={(event) =>
                                setNombreCompleto(
                                    event.target.value
                                )
                            }
                            maxLength="100"
                            disabled={guardando}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">
                            Teléfono
                        </label>

                        <input
                            id="telefono"
                            type="tel"
                            value={telefono}
                            onChange={(event) =>
                                setTelefono(
                                    event.target.value
                                )
                            }
                            maxLength="8"
                            disabled={guardando}
                        />
                    </div>
                    <div className="form-group">
    <label htmlFor="departamento">
        Departamento
    </label>

    <select
        id="departamento"
        value={departamentoId}
        onChange={(event) => {
            setDepartamentoId(event.target.value);
            setMunicipioId("");
        }}
        disabled={guardando}
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

<div className="form-group">
    <label htmlFor="municipio">
        Municipio
    </label>

    <select
        id="municipio"
        value={municipioId}
        onChange={(event) =>
            setMunicipioId(event.target.value)
        }
        disabled={
            guardando ||
            departamentoId === ""
        }
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
                    <div className="form-group">
                        <label htmlFor="email">
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                        />

                        <small>
                            El correo electrónico no se puede modificar desde este formulario.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol">
                            Tipo de cuenta
                        </label>

                        <input
                            id="rol"
                            type="text"
                            value={rol}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="estadoCuenta">
                            Estado de cuenta
                        </label>

                        <input
                            id="estadoCuenta"
                            type="text"
                            value={estadoCuenta}
                            disabled
                        />
                    </div>

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={guardando}
                    >
                        {guardando
                            ? "Guardando..."
                            : "Guardar cambios"}
                    </button>

                </form>

                <button
                    className="link-button"
                    type="button"
                    onClick={() => navigate("/panel")}
                    disabled={guardando}
                >
                    Volver al panel
                </button>

            </section>
        </main>
    );
  }

export default Perfil;