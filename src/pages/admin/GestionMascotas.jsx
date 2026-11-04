import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import {
    ESTADOS_ADOPCION,
    actualizarEstadoMascota,
    darDeBajaMascota,
    reactivarMascota
} from "../../services/mascotaService";

import { obtenerEspecies } from "../../services/especieService";

import { obtenerDatosDelSistema } from "../../services/reporteService";

import "../../styles/reportes.css";

import Cargando from "../../components/Cargando";

import BarraFiltros from "../../components/BarraFiltros";

// HU-26 (supervisión). El administrador no publica mascotas: eso es del
// albergue. Lo que necesita es ver todo el catálogo de un vistazo y poder
// intervenir cuando algo está mal publicado, por ejemplo tras resolver
// una denuncia. Por eso aquí solo hay corrección de estado y baja lógica.
function GestionMascotas() {

    const [mascotas, setMascotas] = useState([]);
    const [albergues, setAlbergues] = useState([]);
    const [especies, setEspecies] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroAlbergue, setFiltroAlbergue] = useState("");
    const [filtroEspecie, setFiltroEspecie] = useState("");
    const [filtroPublicacion, setFiltroPublicacion] = useState("activas");

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


    async function reactivar(mascota) {

        setError("");
        setMensaje("");

        try {

            await reactivarMascota(mascota.id);

            setMensaje(
                "La publicación de " + mascota.nombre +
                " volvió al catálogo como disponible."
            );

            await cargar();

        } catch (error) {

            console.error(
                "Error al reactivar la mascota:",
                error
            );

            setError("No se pudo reactivar la publicación.");
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
            <Cargando texto="Cargando el catálogo" />
        );
    }


    // Embudo de filtros, el mismo patrón que usa el catálogo público.
    const texto = busqueda.trim().toLowerCase();

    const filtradas = [];

    for (const mascota of mascotas) {

        const retirada = mascota.activo === false;

        if (filtroPublicacion === "activas" && retirada) {
            continue;
        }

        if (filtroPublicacion === "retiradas" && !retirada) {
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

        if (
            filtroEspecie !== "" &&
            mascota.especieId !== filtroEspecie
        ) {
            continue;
        }

        if (texto !== "") {

            const campos = [
                mascota.nombre,
                mascota.raza,
                mascota.descripcion,
                nombreRefugio(mascota.albergueId)
            ];

            const coincide = campos.some(
                (campo) => (campo || "").toLowerCase().includes(texto)
            );

            if (!coincide) {
                continue;
            }
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


                <BarraFiltros
                    busqueda={busqueda}
                    alBuscar={setBusqueda}
                    marcador="Buscar por nombre, raza o refugio"
                    campos={[
                        {
                            id: "publicacion",
                            etiqueta: "Publicación",
                            valor: filtroPublicacion,
                            alCambiar: setFiltroPublicacion,
                            opciones: [
                                { valor: "activas", texto: "Publicadas" },
                                { valor: "retiradas", texto: "Retiradas" },
                                { valor: "", texto: "Todas" }
                            ]
                        },
                        {
                            id: "estado",
                            etiqueta: "Estado",
                            valor: filtroEstado,
                            alCambiar: setFiltroEstado,
                            opciones: [
                                { valor: "", texto: "Todos los estados" },
                                ...ESTADOS_ADOPCION.map((estado) => ({
                                    valor: estado,
                                    texto: estado
                                }))
                            ]
                        },
                        {
                            id: "especie",
                            etiqueta: "Especie",
                            valor: filtroEspecie,
                            alCambiar: setFiltroEspecie,
                            opciones: [
                                { valor: "", texto: "Todas las especies" },
                                ...especies.map((especie) => ({
                                    valor: especie.id,
                                    texto: especie.nombre
                                }))
                            ]
                        },
                        {
                            id: "refugio",
                            etiqueta: "Refugio",
                            valor: filtroAlbergue,
                            alCambiar: setFiltroAlbergue,
                            opciones: [
                                { valor: "", texto: "Todos los refugios" },
                                ...albergues.map((albergue) => ({
                                    valor: albergue.id,
                                    texto: albergue.nombreRefugio
                                }))
                            ]
                        }
                    ]}
                    total={mascotas.length}
                    mostrados={filtradas.length}
                    sustantivo="mascotas"
                />


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

                                            {mascota.activo !== false ? (

                                                <button
                                                    type="button"
                                                    className="gestion-retirar"
                                                    onClick={() =>
                                                        darDeBaja(mascota)
                                                    }
                                                >
                                                    Retirar publicación
                                                </button>

                                            ) : (

                                                <button
                                                    type="button"
                                                    className="gestion-reactivar"
                                                    onClick={() =>
                                                        reactivar(mascota)
                                                    }
                                                >
                                                    Reactivar
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
