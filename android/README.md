# Red Huella para Android

Aplicación Android nativa en Kotlin y Jetpack Compose para personas que quieren adoptar. Conserva la identidad visual de Red Huella y usa las mismas colecciones de Cloud Firestore que la web.

## Funciones

- Explorar mascotas disponibles y en proceso, ver sus fichas y fotos.
- Consultar refugios verificados.
- Crear e iniciar sesión únicamente con una cuenta de adoptante.
- Enviar una solicitud con los datos que revisa el sistema web.
- Consultar el estado y la respuesta del refugio en tiempo real, y cancelar una solicitud pendiente.
- No incluye alta de refugios, funciones administrativas ni pantallas de administración.

## Abrir y ejecutar

1. Descomprime `Red_Huella_Android.zip`.
2. En Android Studio, selecciona **Open** y abre la carpeta `RedHuellaAndroid`.
3. Acepta la instalación de Android SDK 36 si Android Studio la solicita y espera a que termine **Gradle Sync**.
4. Selecciona un emulador Android con Google Play o conecta un teléfono con depuración USB.
5. Pulsa **Run**. La app requiere conexión a Internet.

También puedes compilar el APK de depuración desde la carpeta del proyecto:

```bash
./gradlew assembleDebug
```

En Windows:

```powershell
.\gradlew.bat assembleDebug
```

El APK se genera en `app/build/outputs/apk/debug/app-debug.apk`.

## Firebase compartido con la web

La app está configurada para el proyecto que declara `src/services/firebase.js` en la web: `sistema-de-adopciones-e8cf4`. No usa el `google-services.json` que se había compartido anteriormente porque ese archivo pertenece a otro proyecto (`movil-34cec`); usarlo separaría las cuentas y solicitudes de la base de datos que consulta la página.

La inicialización se hace con `FirebaseOptions` y los valores públicos del proyecto web. Android Studio no necesita ese archivo para compilar este proyecto. La app lee `mascotas` y `albergues`, crea perfiles en `users` con el rol `Adoptante` y guarda solicitudes en `solicitudes_adopcion`, con los campos que consume la web.

Para una instalación Android registrada de forma canónica en Firebase, agrega el paquete `com.redhuella.android` como aplicación Android dentro del mismo proyecto `sistema-de-adopciones-e8cf4` y reemplaza `applicationId` de Firebase en `MainActivity.kt` por el `mobilesdk_app_id` que entregue Firebase. No uses para este propósito el archivo de `movil-34cec`.

En Firebase Console también deben estar activos el proveedor **Correo electrónico/Contraseña** de Authentication y las reglas actuales de Firestore del repositorio. La página web debe seguir usando el proyecto `sistema-de-adopciones-e8cf4`.

## Compatibilidad

- Paquete Android: `com.redhuella.android`
- Android mínimo: 6.0 / API 23
- SDK objetivo: API 36
- JDK: 17
- Firebase Authentication y Cloud Firestore
