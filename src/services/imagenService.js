import { validarImagen } from "./storageService";

// Subida de imágenes a Cloudinary.
//
// Por qué Cloudinary y no Firebase Storage: Storage exige el plan de pago
// de Firebase, que pide tarjeta de crédito. Cloudinary tiene un plan
// gratuito sin tarjeta, suficiente de sobra para el volumen de fotos de
// este sistema, y entrega las imágenes por CDN.
//
// La subida es "sin firmar" (unsigned): el navegador envía el archivo
// directamente a Cloudinary usando un preset que el administrador de la
// cuenta habilitó para eso. No hay secretos en el código. El nombre de la
// nube y el nombre del preset son valores públicos, igual que la apiKey
// de Firebase: no autorizan nada que el preset no permita.
//
// Si estos dos valores no están configurados, la aplicación sigue
// funcionando: el formulario simplemente ofrece solo el campo de enlace.

export const CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

export const UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

export function subidaDisponible() {
    return CLOUD_NAME !== "" && UPLOAD_PRESET !== "";
}

export async function subirImagen(archivo) {

    if (!subidaDisponible()) {
        throw new Error(
            "La subida de imágenes no está configurada. " +
            "Pega el enlace de la imagen."
        );
    }

    // Se reutiliza la validación que ya existía para Storage: mismos
    // formatos y mismo tamaño máximo, para que la regla sea una sola.
    const errorArchivo = validarImagen(archivo);

    if (errorArchivo !== "") {
        throw new Error(errorArchivo);
    }

    const formulario = new FormData();

    formulario.append("file", archivo);
    formulario.append("upload_preset", UPLOAD_PRESET);

    const respuesta = await fetch(
        "https://api.cloudinary.com/v1_1/" +
        CLOUD_NAME +
        "/image/upload",
        {
            method: "POST",
            body: formulario
        }
    );

    if (!respuesta.ok) {

        let detalle = "";

        try {

            const cuerpo = await respuesta.json();

            detalle = cuerpo?.error?.message || "";

        } catch {
            detalle = "";
        }

        throw new Error(
            detalle !== ""
                ? "Cloudinary rechazó la imagen: " + detalle
                : "No se pudo subir la imagen. Revisa tu conexión."
        );
    }

    const datos = await respuesta.json();

    if (!datos.secure_url) {
        throw new Error("Cloudinary no devolvió la dirección de la imagen.");
    }

    // Se guarda siempre la versión https. El modelo de datos no cambia:
    // el campo sigue almacenando una URL, venga de donde venga.
    return datos.secure_url;
}
