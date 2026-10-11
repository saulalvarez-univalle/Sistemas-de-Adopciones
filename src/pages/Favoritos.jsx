import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    obtenerIdsFavoritos,
    quitarFavorito
} from "../services/favoritoService";

import { obtenerMascotasPorIds } from "../services/mascotaService";
import { obtenerEspecies } from "../services/especieService";

import TarjetaMascota from "../components/TarjetaMascota";

import "../styles/mascotas.css";

function Favoritos() {

    const { usuarioFirebase } = useAuth();

    const [mascotas, setMascotas] = useState([]);
    const [especies, setEspecies] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargarFavoritos = useCallback(async () => {

        try {

            setCargando(true);
            setError("");

            if (!usuarioFirebase) {
                return;
            }

            const ids = await obtenerIdsFavoritos(
                usuarioFirebase.uid
            );

            const lista = await obtenerMascotasPorIds(ids);

            const listaEspecies = await obtenerEspecies();

            setMascotas(lista);
            setEspecies(listaEspecies);

        } catch (error) {

            console.error(
                "Error al cargar los favoritos:",
                error
            );

            setError("No se pudieron cargar tus favoritos.");

        } finally {

            setCargando(false);
        }

    }, [usuarioFirebase]);


    useEffect(() => {

        cargarFavoritos();

    }, [cargarFavoritos]);


    function obtenerNombreEspecie(id) {

        for (const especie of especies) {

            if (especie.id === id) {
                return especie.nombre;
            }
        }

        return "";
    }


    async function manejarQuitar(mascota) {

        try {

            await quitarFavorito(
                usuarioFirebase.uid,
                mascota.id
            );

            setMascotas(
                mascotas.filter(
                    (item) => item.id !== mascota.id
                )
            );

        } catch (error) {

            console.error(
                "Error al quitar de favoritos:",
                error
            );
        }
    }


    if (cargando) {

        return (
            <main className="loading-page">

                <div className="loading-spinner"></div>

                <p>
                    Cargando tus favoritos...
                </p>

            </main>
        );
    }


    return (
        <main className="mascotas-page">

            <section className="mascotas-content mascotas-content-simple">

                <div className="mascotas-heading">

                    <div>

                        <span className="mascotas-section-tag">
                            MI LISTA
                        </span>

                        <h2>
                            Mascotas
                            <span> favoritas.</span>
                        </h2>

                    </div>

                    <p>
                        Las mascotas que guardaste para seguir
                        su disponibilidad.
                    </p>

                </div>


                {error !== "" && (
                    <div className="mascotas-state mascotas-state-error">

                        <strong>
                            Ocurrió un problema
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>
                )}


                {error === "" && mascotas.length === 0 && (

                    <div className="mascotas-state mascotas-state-empty">

                        <span className="mascotas-empty-number">
                            00
                        </span>

                        <strong>
                            Todavía no guardaste ninguna mascota
                        </strong>

                        <p>
                            Explora el catálogo y toca el corazón
                            de las que te interesen.
                        </p>

                        <Link
                            to="/mascotas"
                            className="mascotas-clear-button"
                        >
                            Ir al catálogo
                        </Link>

                    </div>
                )}


                {mascotas.length > 0 && (

                    <div className="mascotas-grid">

                        {mascotas.map((mascota) => (

                            <TarjetaMascota
                                key={mascota.id}
                                mascota={mascota}
                                nombreEspecie={obtenerNombreEspecie(
                                    mascota.especieId
                                )}
                                nombreMunicipio=""
                                esFavorito={true}
                                onAlternarFavorito={manejarQuitar}
                            />

                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Favoritos;
