import "../styles/barra-filtros.css";

// Barra de búsqueda y filtros, común a todas las pantallas que listan
// algo. Antes cada listado se resolvía distinto o directamente no
// filtraba, y con pocos registros no se notaba; con un refugio que
// acumula cien solicitudes, sí.
//
// Recibe los campos como datos en lugar de maquetarlos cada vez, así
// todas las pantallas se ven y se usan igual.
function BarraFiltros({
    busqueda,
    alBuscar,
    marcador,
    campos,
    total,
    mostrados,
    sustantivo,
    alLimpiar
}) {

    const listaCampos = campos || [];

    const hayFiltro =
        (busqueda || "").trim() !== "" ||
        listaCampos.some((campo) => campo.valor !== "");

    // El contador solo aparece cuando hay algo filtrado: repetir
    // "12 de 12" en una pantalla sin filtrar no informa nada.
    const mostrarConteo =
        hayFiltro && typeof mostrados === "number";


    function limpiar() {

        if (alBuscar) {
            alBuscar("");
        }

        for (const campo of listaCampos) {
            campo.alCambiar("");
        }

        if (alLimpiar) {
            alLimpiar();
        }
    }


    return (
        <div className="barra-filtros">

            <div className="barra-filtros-campos">

                {alBuscar && (

                    <div className="barra-filtros-busqueda">

                        <span aria-hidden="true">
                            ⌕
                        </span>

                        <input
                            type="search"
                            value={busqueda}
                            onChange={(evento) =>
                                alBuscar(evento.target.value)
                            }
                            placeholder={marcador || "Buscar"}
                            aria-label={marcador || "Buscar"}
                        />

                    </div>
                )}

                {listaCampos.map((campo) => (

                    <label
                        key={campo.id}
                        className="barra-filtros-campo"
                        htmlFor={"filtro-" + campo.id}
                    >

                        <span>
                            {campo.etiqueta}
                        </span>

                        <select
                            id={"filtro-" + campo.id}
                            value={campo.valor}
                            onChange={(evento) =>
                                campo.alCambiar(evento.target.value)
                            }
                        >
                            {campo.opciones.map((opcion) => (

                                <option
                                    key={opcion.valor}
                                    value={opcion.valor}
                                >
                                    {opcion.texto}
                                </option>
                            ))}
                        </select>

                    </label>
                ))}

                {hayFiltro && (

                    <button
                        type="button"
                        className="barra-filtros-limpiar"
                        onClick={limpiar}
                    >
                        Limpiar
                    </button>
                )}

            </div>

            {mostrarConteo && (

                <p className="barra-filtros-conteo">
                    Mostrando <strong>{mostrados}</strong> de {total}
                    {sustantivo ? " " + sustantivo : ""}.
                </p>
            )}

        </div>
    );
}

export default BarraFiltros;
