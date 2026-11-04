// Firestore devuelve las fechas de tres formas distintas según cómo se
// escribieron: un Timestamp (serverTimestamp), un Date (new Date()) o una
// cadena. Esta función normaliza las tres para que las pantallas no tengan
// que repetir la misma comprobación.
export function formatearFecha(valor) {

    if (!valor) {
        return "Sin registrar";
    }

    let fecha;

    if (typeof valor.toDate === "function") {

        fecha = valor.toDate();

    } else if (valor.seconds) {

        fecha = new Date(valor.seconds * 1000);

    } else {

        fecha = new Date(valor);
    }

    if (isNaN(fecha.getTime())) {
        return "Sin registrar";
    }

    return fecha.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}
