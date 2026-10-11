import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import {
    ESTADOS_ADOPCION,
    actualizarEstadoMascota,
    darDeBajaMascota
} from "../../services/mascotaService";

import { obtenerEspecies } from "../../services/especieService";

import { obtenerDatosDelSistema } from "../../services/reporteService";

import "../../styles/reportes.css";

// HU-26 (supervisión). El administrador no publica mascotas: eso es del
// albergue. Lo que necesita es ver todo el catálogo de un vistazo y poder
// intervenir cuando algo está mal publicado, por ejemplo tras resolver
// una denuncia. Por eso aquí solo hay corrección de estado y baja lógica.
function GestionMascotas() {

    const [mascotas, setMascotas] = useState([]);
    const [albergues, setAlbergues] = useState([]);
    const [especies, setEspecies] = useState([]);

    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroAlbergue, setFiltroAlbergue] = useState("");
    const [mostrarInactivas, setMostrarInactivas] = useState(false);

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");


    const cargar = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            const sistema = await obtenerDatosDelSistema();

            setMascotas(sistema.mascotas);
            setAlbergues(sistema.albergues);

            setEspecies(await obtenerEspecies());

        } catch (error) {

            console.error(
                "Error al cargar el catálogo:",
                error
            );

            setError("No se pudo cargar el catálogo de mascotas.");

        } finally {

            setCargando(false);
        }

    }, []);


    useEffect(() => {

        cargar();

    }, [cargar]);


    function nombreEspecie(especieId) {

        for (const especie of especies) {

            if (especie.id === especieId) {
                return especie.nombre;
            }
        }

        return "Sin especie";
    }


    function nombreRefugio(albergueId) {

        for (const albergue of albergues) {

            if (albergue.id === albergueId) {
                return albergue.nombreRefugio;
            }
        }

        return "Refugio no encontrado";
    }


    async function cambiarEstado(mascota, estado) {

        setError("");
        setMensaje("");

        try {

            await actualizarEstadoMascota(mascota.id, estado);

            setMensaje(
                "El estado de " + mascota.nombre +
                " se actualizó a " + estado + "."
            );

            await cargar();

        } catch (error) {

            console.error(
                "Error al cambiar el estado:",
                error
            );

            setError("No se pudo cambiar el estado de la mascota.");
        }
    }


    async function darDeBaja(mascota) {

        setError("");
        setMensaje("");

        try {

            await darDeBajaMascota(mascota.id);

            setMensaje(
                "La publicación de " + mascota.nombre +
                " se retiró del catálogo. El registro se conserva."
            );

            await cargar();

        } catch (error) {

            console.error(
                "Error al dar de baja la mascota:",
                error
            );

            setError("No se pudo retirar la publicación.");
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando el catálogo...
                </p>

            </main>
        );
    }


    // Embudo de filtros, el mismo patrón que usa el catálogo público.
    const filtradas = [];

    for (const mascota of mascotas) {

        if (!mostrarInactivas && mascota.activo === false) {
            continue;
        }

        if (
            filtroEstado !== "" &&
            mascota.estadoAdopcion !== filtroEstado
        ) {
            continue;
        }

        if (
            filtroAlbergue !== "" &&
            mascota.albergueId !== filtroAlbergue
        ) {
            continue;
        }

        filtradas.push(mascota);
    }

    filtradas.sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "")
    );


    return (
        <main className="reportes-page">

            <div className="reportes-container">

                <header className="reportes-header">

                    <div>

                        <span className="reportes-label">
                            RED HUELLA · ADMINISTRACIÓN
                        </span>

                        <h1>
                            Supervisión del catálogo
                        </h1>

                        <p>
                            Todas las mascotas publicadas por los refugios.
                            Desde aquí se corrige un estado mal cargado o se
                            retira una publicación que incumple las normas.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="reportes-actualizar"
                        onClick={cargar}
                    >
                        Actualizar
                    </button>

                </header>


                {mensaje !== "" && (
                    <div className="reportes-success">
                        {mensaje}
                    </div>
                )}

                {error !== "" && (
                    <div className="reportes-error">
                        {error}
                    </div>
                )}


                <section className="reportes-bloque">

                    <div className="reportes-bloque-header">

                        <div>

                            <h2>
                                {filtradas.length} mascotas
                            </h2>

                            <p>
                                De {mascotas.length} registros en total.
                            </p>

                        </div>

                        <div className="reportes-bloque-acciones">

                            <select
                                value={filtroEstado}
                                onChange={(evento) =>
                                    setFiltroEstado(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todos los estados
                                </option>

                                {ESTADOS_ADOPCION.map((estado) => (

                                    <option
                                        key={estado}
                                        value={estado}
                                    >
                                        {estado}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filtroAlbergue}
                                onChange={(evento) =>
                                    setFiltroAlbergue(evento.target.value)
                                }
                            >
                                <option value="">
                                    Todos los refugios
                                </option>

                                {albergues.map((albergue) => (

                                    <option
                                        key={albergue.id}
                                        value={albergue.id}
                                    >
                                        {albergue.nombreRefugio}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarInactivas(!mostrarInactivas)
                                }
                            >
                                {mostrarInactivas
                                    ? "Ocultar retiradas"
                                    : "Ver retiradas"}
                            </button>

                        </div>

                    </div>


                    {filtradas.length === 0 && (
                        <p className="reportes-vacio">
                            No hay mascotas que coincidan con los filtros.
                        </p>
                    )}


                    {filtradas.length > 0 && (

                        <table className="reportes-tabla">

                            <thead>

                                <tr>
                                    <th>
                                        Mascota
                                    </th>

                                    <th>
                                        Refugio
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acciones
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {filtradas.map((mascota) => (

                                    <tr key={mascota.id}>

                                        <td>

                                            <Link
                                                to={"/mascotas/" + mascota.id}
                                                className="gestion-enlace"
                                            >
                                                {mascota.nombre}
                                            </Link>

                                            <span className="gestion-detalle">
                                                {nombreEspecie(
                                                    mascota.especieId
                                                )}
                                                {" · "}
                                                {mascota.sexo}
                                                {" · "}
                                                {mascota.edadCategoria}
                                            </span>

                                        </td>

                                        <td>
                                            {nombreRefugio(
                                                mascota.albergueId
                                            )}
                                        </td>

                                        <td>

                                            {mascota.activo === false ? (

                                                <span className="gestion-retirada">
                                                    Retirada
                                                </span>

                                            ) : (

                                                <select
                                                    value={
                                                        mascota.estadoAdopcion
                                                    }
                                                    onChange={(evento) =>
                                                        cambiarEstado(
                                                            mascota,
                                                            evento.target.value
                                                        )
                                                    }
                                                    className="gestion-select"
                                                >
                                                    {ESTADOS_ADOPCION.map(
                                                        (estado) => (

                                                        <option
                                                            key={estado}
                                                            value={estado}
                                                        >
                                                            {estado}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                        </td>

                                        <td>

                                            {mascota.activo !== false && (

                                                <button
                                                    type="button"
                                                    className="gestion-retirar"
                                                    onClick={() =>
                                                        darDeBaja(mascota)
                                                    }
                                                >
                                                    Retirar publicación
                                                </button>
                                            )}

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    )}

                </section>

            </div>

        </main>
    );
}

export default GestionMascotas;
