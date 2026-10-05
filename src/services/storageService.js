import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";

import { storage } from "./firebase";

const TIPOS_PERMITIDOS = [
    "image/jpeg",
    "image/jpg",
    "image/png"
];

const TAMANO_MAXIMO = 3 * 1024 * 1024;

export const MAXIMO_FOTOS_POR_MASCOTA = 5;

export function validarImagen(archivo) {

    if (!archivo) {
        return "No se seleccionó ninguna imagen.";
    }

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        return "Solo se permiten imágenes en formato JPG o PNG.";
    }

    if (archivo.size > TAMANO_MAXIMO) {
        return "Cada imagen debe pesar menos de 3 MB.";
    }

    return "";
}

function generarNombre(archivo) {

    const marca = Date.now();

    const aleatorio = Math.random()
        .toString(36)
        .slice(2, 8);

    const extension =
        archivo.type === "image/png"
            ? "png"
            : "jpg";

    return marca + "-" + aleatorio + "." + extension;
}

export async function subirFotoMascota(albergueId, archivo) {

    const errorArchivo = validarImagen(archivo);

    if (errorArchivo !== "") {
        throw new Error(errorArchivo);
    }

    const ruta =
        "mascotas/" +
        albergueId +
        "/" +
        generarNombre(archivo);

    const referencia = ref(storage, ruta);

    await uploadBytes(referencia, archivo);

    const url = await getDownloadURL(referencia);

    return url;
}

export async function subirFotosMascota(albergueId, archivos) {

    const urls = [];

    for (const archivo of archivos) {

        const url = await subirFotoMascota(
            albergueId,
            archivo
        );

        urls.push(url);
    }

    return urls;
}

export async function eliminarFotoPorUrl(url) {

    try {

        const referencia = ref(storage, url);

        await deleteObject(referencia);

    } catch (error) {

        // Si la imagen ya no existe en Storage no se interrumpe el flujo:
        // lo importante es que deje de estar referenciada en Firestore.
        console.error(
            "No se pudo eliminar la imagen de Storage:",
            error
        );
    }
}
