// Service worker de Red Huella.
//
// Hace dos cosas y ninguna más:
//
// 1. Guarda el "cascarón" de la aplicación (el HTML inicial y los iconos)
//    para que al abrirla desde el ícono instalado aparezca de inmediato,
//    incluso con mala señal.
//
// 2. Guarda una copia de los archivos estáticos que ya se descargaron.
//
// Lo que NO hace, a propósito: cachear las respuestas de Firestore. Los
// datos de mascotas, solicitudes y notificaciones tienen que estar al día.
// Mostrar una mascota como disponible cuando ya fue adoptada sería peor que
// no mostrar nada.

const VERSION = "red-huella-v1";

const CASCARON = [
    "/",
    "/manifest.webmanifest",
    "/iconos/icono-192.png",
    "/iconos/icono-512.png",
    "/imagenes/logo.png"
];

self.addEventListener("install", (evento) => {

    evento.waitUntil(
        caches.open(VERSION)
            .then((cache) => cache.addAll(CASCARON))
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error("No se pudo preparar el caché:", error);
            })
    );
});

// Al activarse una versión nueva se borran los cachés de versiones
// anteriores, para que una corrección no quede tapada por el archivo viejo.
self.addEventListener("activate", (evento) => {

    evento.waitUntil(
        caches.keys()
            .then((nombres) => Promise.all(
                nombres
                    .filter((nombre) => nombre !== VERSION)
                    .map((nombre) => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (evento) => {

    const peticion = evento.request;

    if (peticion.method !== "GET") {
        return;
    }

    const url = new URL(peticion.url);

    // Solo se interviene lo que sirve nuestro propio dominio. Firestore,
    // Firebase Authentication y los tiles del mapa pasan de largo.
    if (url.origin !== self.location.origin) {
        return;
    }

    // La navegación va primero a la red: así una versión nueva del sitio
    // se ve apenas se despliega. Si no hay conexión, se entrega el
    // cascarón guardado y la aplicación arranca igual.
    if (peticion.mode === "navigate") {

        evento.respondWith(
            fetch(peticion)
                .then((respuesta) => {

                    const copia = respuesta.clone();

                    caches.open(VERSION).then(
                        (cache) => cache.put("/", copia)
                    );

                    return respuesta;
                })
                .catch(() => caches.match("/"))
        );

        return;
    }

    // Para el resto (scripts, estilos, imágenes) se responde con la copia
    // guardada si existe, y en paralelo se baja la versión nueva para la
    // próxima vez.
    evento.respondWith(
        caches.match(peticion).then((guardada) => {

            const desdeLaRed = fetch(peticion)
                .then((respuesta) => {

                    if (respuesta && respuesta.status === 200) {

                        const copia = respuesta.clone();

                        caches.open(VERSION).then(
                            (cache) => cache.put(peticion, copia)
                        );
                    }

                    return respuesta;
                })
                .catch(() => guardada);

            return guardada || desdeLaRed;
        })
    );
});
