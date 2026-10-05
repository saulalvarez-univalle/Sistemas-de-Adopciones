# Red Huella — Sistema de Adopción de Mascotas

Plataforma web que centraliza, a nivel nacional, la oferta de mascotas en adopción de albergues y
refugios verificados, organizada por departamento y municipio de Bolivia.

Proyecto de Sistemas I · Universidad Privada del Valle · Grupo 6
Docente: Ing. Christian Max Montaño Salvatierra

---

## Cómo levantar el proyecto

Requisito previo: Node.js 20 o superior.

```bash
git clone https://github.com/saulalvarez-univalle/Sistemas-de-Adopciones.git
cd Sistemas-de-Adopciones
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

No es necesario crear ningún archivo de configuración: la conexión con Firebase viene resuelta por
defecto en `src/services/firebase.js`. Si se quiere apuntar a otro proyecto de Firebase, se puede
copiar `.env.example` como `.env` y completar los valores; las variables de entorno tienen prioridad
sobre los valores por defecto.

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión compilada |
| `npm run lint` | Ejecuta el analizador estático ESLint |

---

## Tecnologías

| Componente | Tecnología |
|---|---|
| Interfaz | React 19 + Vite |
| Enrutamiento | React Router 7 |
| Autenticación | Firebase Authentication |
| Base de datos | Cloud Firestore (NoSQL) |
| Imágenes | Firebase Storage |
| Mapas | Leaflet + react-leaflet sobre OpenStreetMap |
| Calidad de código | ESLint |

---

## Estructura del proyecto

```
src/
├── pages/        Pantallas de la aplicación
├── components/   Piezas reutilizables (navbar, mapa, guardias de ruta)
├── context/      Estado global de la sesión (AuthContext)
├── services/     Única capa que conversa con Firebase
├── styles/       Hojas de estilo por pantalla
└── data/         Datos estáticos de referencia
```

Ninguna pantalla accede a Firebase directamente: todo pasa por `src/services/`. Cambiar de proveedor
de base de datos implicaría reescribir esa carpeta sin tocar las pantallas.

### Servicios

| Archivo | Responsabilidad |
|---|---|
| `firebase.js` | Inicializa la aplicación y exporta `auth`, `db` y `storage` |
| `authService.js` | Registro, inicio y cierre de sesión |
| `userService.js` | Lectura y actualización del perfil |
| `territorioService.js` | Departamentos y municipios |
| `albergueService.js` | Alta, edición y verificación de albergues |
| `especieService.js` | Parametrización de especies |
| `mascotaService.js` | Alta, edición, estados y filtros de mascotas |
| `solicitudService.js` | Emisión, seguimiento y evaluación de solicitudes |
| `favoritoService.js` | Lista personal de favoritos |
| `storageService.js` | Subida y validación de imágenes |

---

## Roles del sistema

| Rol | Cómo se obtiene | Alcance |
|---|---|---|
| Visitante | Sin cuenta | Catálogo público, refugios verificados |
| Adoptante | Registro | Perfil, favoritos, solicitudes de adopción |
| Albergue/Refugio | Registro + verificación | Gestión de su refugio y de sus mascotas |
| Servicio | Registro | Perfil (módulo propio previsto para el Sprint 3) |
| Admin / Superusuario | Asignación manual en Firestore | Verificación, parametrización, moderación |

Para crear el primer administrador hay que editar el documento del usuario en la colección `users`
desde la consola de Firebase y cambiar el campo `rol` a `"Admin"`.

---

## Base de datos

El modelo contempla doce colecciones en Cloud Firestore. Las operativas al cierre del Sprint 2 son:

| Colección | Contenido |
|---|---|
| `users` | Perfil de cada cuenta. No almacena contraseñas. |
| `departamentos` | Los nueve departamentos de Bolivia |
| `municipios` | Municipios, con su `departamentoId` |
| `especies` | Catálogo parametrizable de especies |
| `albergues` | Refugios, con su estado de verificación |
| `mascotas` | Animales publicados por los albergues verificados |
| `solicitudes_adopcion` | Solicitudes emitidas por los adoptantes |
| `favoritos` | Lista personal de cada adoptante |

Previstas para el Sprint 3: `servicios`, `alertas_perdidas`, `notificaciones` y `denuncias`.

### Carga inicial de catálogos

Las colecciones `departamentos`, `municipios` y `especies` deben existir para que los formularios
muestren opciones. La carpeta `datos-semilla/` contiene los datos y el script `cargar-datos.js`
con las instrucciones de uso.

### Reglas de seguridad

`firestore.rules` y `storage.rules` contienen las reglas de acceso. La base de datos no es pública:
solo se exponen en lectura abierta los albergues, las mascotas publicadas, las especies y la
división territorial. Para desplegarlas:

```bash
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

---

## Flujo de trabajo con Git

Una rama por integrante y por funcionalidad. La integración a `main` se realiza mediante Pull
Request con revisión obligatoria antes de la fusión, según la Definición de Terminado del equipo.

| Rama | Contenido |
|---|---|
| `main` | Rama principal, integrada por Pull Request |
| `dev` | Rama de integración |
| `saul` | Capa de datos, reglas de seguridad e infraestructura |
| `yubidsa` | Pantallas, componentes y hojas de estilo |
