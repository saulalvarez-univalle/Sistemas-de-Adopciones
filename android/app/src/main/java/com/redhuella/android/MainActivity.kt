package com.redhuella.android

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.redhuella.android.data.AdoptionRequest
import com.redhuella.android.data.FirebaseRepository
import com.redhuella.android.data.Pet
import com.redhuella.android.data.Shelter
import com.redhuella.android.data.UserProfile
import com.redhuella.android.ui.HuellaBlue
import com.redhuella.android.ui.HuellaCanvas
import com.redhuella.android.ui.HuellaGreen
import com.redhuella.android.ui.HuellaMuted
import com.redhuella.android.ui.RedHuellaTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (FirebaseApp.getApps(this).isEmpty()) {
            val options = FirebaseOptions.Builder()
                .setApiKey("AIzaSyCOsu67-4BO7HbRh2rjeSLUgbiafP6ChYI")
                .setApplicationId("1:401599702322:web:14f3fa61c5ff03a479e32b")
                .setProjectId("sistema-de-adopciones-e8cf4")
                .setGcmSenderId("401599702322")
                .setStorageBucket("sistema-de-adopciones-e8cf4.firebasestorage.app")
                .build()
            FirebaseApp.initializeApp(this, options)
        }
        setContent {
            RedHuellaTheme {
                RedHuellaApp()
            }
        }
    }
}

private enum class MainTab(val title: String) {
    MASCOTAS("Mascotas"),
    REFUGIOS("Refugios"),
    SOLICITUDES("Solicitudes"),
    PERFIL("Mi cuenta")
}

private enum class AuthMode { LOGIN, REGISTER }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RedHuellaApp() {
    var signedIn by remember { mutableStateOf(FirebaseRepository.currentUid() != null) }
    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var tab by remember { mutableStateOf(MainTab.MASCOTAS) }
    var authMode by remember { mutableStateOf<AuthMode?>(null) }
    var authMessage by remember { mutableStateOf("") }
    var selectedPet by remember { mutableStateOf<Pet?>(null) }
    var requestPet by remember { mutableStateOf<Pet?>(null) }

    LaunchedEffect(signedIn) {
        if (!signedIn) {
            profile = null
        } else if (profile == null) {
            val uid = FirebaseRepository.currentUid()
            if (uid != null) {
                runCatching { FirebaseRepository.loadProfile(uid) }
                    .onSuccess { loaded ->
                        if (loaded.rol == "Adoptante" && loaded.estadoCuenta == "Activo") {
                            profile = loaded
                        } else {
                            FirebaseRepository.signOut()
                            signedIn = false
                            authMode = AuthMode.LOGIN
                            authMessage = "La app móvil está disponible solo para cuentas adoptantes activas."
                        }
                    }
                    .onFailure {
                        FirebaseRepository.signOut()
                        signedIn = false
                        authMode = AuthMode.LOGIN
                        authMessage = "No pudimos cargar tu perfil. Vuelve a iniciar sesión."
                    }
            }
        }
    }

    when {
        authMode != null -> AuthScreen(
            initialMode = authMode!!,
            message = authMessage,
            onBack = { authMode = null; authMessage = "" },
            onSignedIn = { user ->
                profile = user
                signedIn = true
                authMode = null
                authMessage = ""
                tab = MainTab.MASCOTAS
            }
        )

        requestPet != null -> AdoptionFormScreen(
            pet = requestPet!!,
            profile = profile,
            onBack = { requestPet = null },
            onSubmitted = {
                requestPet = null
                tab = MainTab.SOLICITUDES
            }
        )

        selectedPet != null -> PetDetailScreen(
            pet = selectedPet!!,
            onBack = { selectedPet = null },
            onRequest = {
                if (profile?.rol == "Adoptante") {
                    requestPet = selectedPet
                } else {
                    authMessage = "Inicia sesión o crea una cuenta de adoptante para solicitar la adopción."
                    authMode = AuthMode.LOGIN
                }
            }
        )

        else -> Scaffold(
            containerColor = HuellaCanvas,
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🐾", fontSize = 22.sp)
                            Spacer(Modifier.width(8.dp))
                            Text("Red Huella", fontWeight = FontWeight.Bold, color = HuellaBlue)
                        }
                    },
                    actions = {
                        if (signedIn) {
                            TextButton(onClick = { tab = MainTab.PERFIL }) {
                                Text(profile?.nombreCompleto?.substringBefore(" ") ?: "Cuenta")
                            }
                        } else {
                            TextButton(onClick = { authMode = AuthMode.LOGIN }) {
                                Text("Ingresar")
                            }
                        }
                    }
                )
            },
            bottomBar = {
                NavigationBar {
                    val tabs = if (signedIn) MainTab.entries else listOf(MainTab.MASCOTAS, MainTab.REFUGIOS, MainTab.PERFIL)
                    tabs.forEach { item ->
                        NavigationBarItem(
                            selected = tab == item,
                            onClick = {
                                if (item == MainTab.PERFIL && !signedIn) {
                                    authMode = AuthMode.LOGIN
                                } else {
                                    tab = item
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = when (item) {
                                        MainTab.MASCOTAS -> Icons.Filled.Pets
                                        MainTab.REFUGIOS -> Icons.Filled.Store
                                        MainTab.SOLICITUDES -> Icons.Filled.Assignment
                                        MainTab.PERFIL -> Icons.Filled.Person
                                    },
                                    contentDescription = item.title
                                )
                            },
                            label = { Text(item.title) }
                        )
                    }
                }
            }
        ) { padding ->
            when (tab) {
                MainTab.MASCOTAS -> CatalogScreen(
                    modifier = Modifier.padding(padding),
                    onPetSelected = { selectedPet = it }
                )
                MainTab.REFUGIOS -> SheltersScreen(Modifier.padding(padding))
                MainTab.SOLICITUDES -> if (profile != null) {
                    MyRequestsScreen(Modifier.padding(padding), profile!!.uid)
                } else {
                    InfoScreen(
                        modifier = Modifier.padding(padding),
                        title = "Tus solicitudes",
                        message = "Inicia sesión para enviar solicitudes y consultar sus respuestas.",
                        action = "Iniciar sesión",
                        onAction = { authMode = AuthMode.LOGIN }
                    )
                }
                MainTab.PERFIL -> if (profile != null) {
                    ProfileScreen(
                        modifier = Modifier.padding(padding),
                        profile = profile!!,
                        onSignOut = {
                            FirebaseRepository.signOut()
                            signedIn = false
                            tab = MainTab.MASCOTAS
                        }
                    )
                } else {
                    InfoScreen(
                        modifier = Modifier.padding(padding),
                        title = "Bienvenido a Red Huella",
                        message = "Crea tu cuenta de adoptante para solicitar una mascota y seguir el estado de tu solicitud.",
                        action = "Crear cuenta",
                        onAction = { authMode = AuthMode.REGISTER }
                    )
                }
            }
        }
    }
}

@Composable
private fun CatalogScreen(modifier: Modifier, onPetSelected: (Pet) -> Unit) {
    var pets by remember { mutableStateOf<List<Pet>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }
    var search by remember { mutableStateOf("") }
    var reload by remember { mutableStateOf(0) }

    LaunchedEffect(reload) {
        loading = true
        error = ""
        runCatching { FirebaseRepository.loadPets() }
            .onSuccess { pets = it }
            .onFailure { error = readableError(it, "No se pudo cargar el catálogo.") }
        loading = false
    }

    val visiblePets = remember(pets, search) {
        val term = search.trim().lowercase()
        if (term.isBlank()) pets else pets.filter {
            it.nombre.lowercase().contains(term) ||
                it.especieId.lowercase().contains(term) ||
                it.raza.lowercase().contains(term)
        }
    }

    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("RED HUELLA / ADOPCIÓN", color = HuellaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Encuentra a tu\ncompañero ideal", style = MaterialTheme.typography.headlineMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
        Text("Conoce mascotas de refugios verificados y encuentra la compañía que mejor se adapta a tu hogar.", color = HuellaMuted)
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Buscar por nombre o especie") },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) }
        )
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("${visiblePets.size} mascotas", fontWeight = FontWeight.SemiBold, color = HuellaBlue)
            IconButton(onClick = { reload++ }) { Icon(Icons.Filled.Refresh, contentDescription = "Actualizar catálogo") }
        }
        if (loading) LoadingPanel("Cargando mascotas…")
        if (error.isNotBlank()) ErrorPanel(error, onRetry = { reload++ })
        if (!loading && error.isBlank() && visiblePets.isEmpty()) {
            EmptyPanel(if (pets.isEmpty()) "Todavía no hay mascotas publicadas." else "No encontramos mascotas con esa búsqueda.")
        }
        visiblePets.forEach { pet -> PetCard(pet = pet, onClick = { onPetSelected(pet) }) }
    }
}

@Composable
private fun PetCard(pet: Pet, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            RemotePhoto(pet.fotosUrls.firstOrNull(), Modifier.fillMaxWidth().height(190.dp))
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text(pet.nombre, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = HuellaBlue)
                    StatusPill(pet.estadoAdopcion)
                }
                Text(listOf(pet.especieId, pet.edadCategoria, pet.sexo).filter(String::isNotBlank).joinToString(" · "), color = HuellaMuted)
                if (pet.descripcion.isNotBlank()) Text(pet.descripcion, maxLines = 2, color = MaterialTheme.colorScheme.onSurface)
                Text("Ver perfil y requisitos  →", color = HuellaGreen, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun PetDetailScreen(pet: Pet, onBack: () -> Unit, onRequest: () -> Unit) {
    Column(Modifier.fillMaxSize().background(HuellaCanvas)) {
        Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, contentDescription = "Volver") }
            Text("Ficha de mascota", color = HuellaBlue, fontWeight = FontWeight.SemiBold)
        }
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            RemotePhoto(pet.fotosUrls.firstOrNull(), Modifier.fillMaxWidth().height(250.dp).clip(RoundedCornerShape(22.dp)))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(pet.nombre, style = MaterialTheme.typography.headlineMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
                StatusPill(pet.estadoAdopcion)
            }
            Text(listOf(pet.especieId, pet.raza, pet.edadAproximada, pet.tamano, pet.sexo).filter(String::isNotBlank).joinToString(" · "), color = HuellaMuted)
            if (pet.descripcion.isNotBlank()) {
                Text("Sobre ${pet.nombre}", style = MaterialTheme.typography.titleMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
                Text(pet.descripcion)
            }
            Text("Refugio responsable", style = MaterialTheme.typography.titleMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
            Text("Publicada por un refugio verificado de Red Huella.", color = HuellaMuted)
            Spacer(Modifier.height(8.dp))
        }
        Surface(shadowElevation = 8.dp, color = Color.White) {
            Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onRequest,
                    enabled = pet.estadoAdopcion == "Disponible",
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text(if (pet.estadoAdopcion == "Disponible") "Solicitar adopción" else "Adopción en proceso")
                }
                Text("El refugio revisará tus respuestas antes de aceptar la solicitud.", color = HuellaMuted, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun SheltersScreen(modifier: Modifier) {
    var shelters by remember { mutableStateOf<List<Shelter>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }
    var reload by remember { mutableStateOf(0) }
    LaunchedEffect(reload) {
        loading = true
        error = ""
        runCatching { FirebaseRepository.loadShelters() }
            .onSuccess { shelters = it }
            .onFailure { error = readableError(it, "No se pudieron cargar los refugios.") }
        loading = false
    }
    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("RED HUELLA / REFUGIOS", color = HuellaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Refugios verificados", style = MaterialTheme.typography.headlineMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
        Text("Conoce a las organizaciones que cuidan a las mascotas publicadas en la plataforma.", color = HuellaMuted)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            IconButton(onClick = { reload++ }) { Icon(Icons.Filled.Refresh, contentDescription = "Actualizar refugios") }
        }
        if (loading) LoadingPanel("Cargando refugios…")
        if (error.isNotBlank()) ErrorPanel(error, onRetry = { reload++ })
        if (!loading && error.isBlank() && shelters.isEmpty()) EmptyPanel("Todavía no hay refugios verificados.")
        shelters.forEach { ShelterCard(it) }
    }
}

@Composable
private fun ShelterCard(shelter: Shelter) {
    Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(shelter.nombre.ifBlank { "Refugio Red Huella" }, style = MaterialTheme.typography.titleLarge, color = HuellaBlue, fontWeight = FontWeight.Bold)
            if (shelter.descripcion.isNotBlank()) Text(shelter.descripcion)
            if (shelter.direccion.isNotBlank()) Text("Dirección: ${shelter.direccion}", color = HuellaMuted)
            if (shelter.horarios.isNotBlank()) Text("Atención: ${shelter.horarios}", color = HuellaMuted)
            if (shelter.telefono.isNotBlank()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.Call, contentDescription = null, tint = HuellaGreen, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(7.dp))
                    Text(shelter.telefono, color = HuellaGreen, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
private fun AdoptionFormScreen(
    pet: Pet,
    profile: UserProfile?,
    onBack: () -> Unit,
    onSubmitted: () -> Unit
) {
    var vivienda by remember { mutableStateOf("") }
    var espacioExterior by remember { mutableStateOf("") }
    var otrasMascotas by remember { mutableStateOf("") }
    var personas by remember { mutableStateOf("") }
    var experiencia by remember { mutableStateOf("") }
    var motivacion by remember { mutableStateOf("") }
    var aceptaCompromiso by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().background(HuellaCanvas)) {
        Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, contentDescription = "Volver") }
            Text("Solicitud de adopción", color = HuellaBlue, fontWeight = FontWeight.SemiBold)
        }
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp)
        ) {
            Text("Quiero adoptar a ${pet.nombre}", style = MaterialTheme.typography.headlineSmall, color = HuellaBlue, fontWeight = FontWeight.Bold)
            Text("El refugio responsable leerá esta información para evaluar tu solicitud. Responde con honestidad.", color = HuellaMuted)
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text(profile?.nombreCompleto.orEmpty(), fontWeight = FontWeight.Bold, color = HuellaBlue)
                    Text(profile?.email.orEmpty(), color = HuellaMuted)
                    Text(profile?.telefono.orEmpty(), color = HuellaMuted)
                }
            }
            RadioGroup("¿En qué tipo de vivienda vives?", vivienda, listOf("Casa", "Departamento", "Alquiler", "Otro")) { vivienda = it }
            RadioGroup("¿Tienes patio o espacio exterior?", espacioExterior, listOf("Sí", "No")) { espacioExterior = it }
            RadioGroup("¿Tienes otras mascotas en casa?", otrasMascotas, listOf("Sí", "No")) { otrasMascotas = it }
            OutlinedTextField(
                value = personas,
                onValueChange = { input -> personas = input.filter(Char::isDigit).take(2) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Personas que viven en tu hogar") },
                supportingText = { Text("Indica un número entre 1 y 20.") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            RadioGroup("¿Qué experiencia tienes con mascotas?", experiencia, listOf("Sería mi primera mascota", "He cuidado mascotas", "Tengo experiencia amplia")) { experiencia = it }
            OutlinedTextField(
                value = motivacion,
                onValueChange = { if (it.length <= 600) motivacion = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("¿Por qué quieres adoptar a ${pet.nombre}?") },
                supportingText = { Text("${motivacion.length}/600 caracteres (mínimo 30).") },
                minLines = 4
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = aceptaCompromiso, onCheckedChange = { aceptaCompromiso = it })
                Text("Me comprometo a brindar cuidado, tiempo, atención veterinaria y un hogar seguro.", fontSize = 14.sp)
            }
            if (error.isNotBlank()) ErrorText(error)
            Button(
                onClick = {
                    error = validateAdoptionForm(vivienda, espacioExterior, otrasMascotas, personas, experiencia, motivacion, aceptaCompromiso)
                    val currentProfile = profile
                    if (error.isBlank() && currentProfile != null) {
                        scope.launch {
                            sending = true
                            runCatching {
                                FirebaseRepository.submitAdoptionRequest(
                                    currentProfile, pet, vivienda, espacioExterior, otrasMascotas,
                                    personas.toInt(), experiencia, motivacion
                                )
                            }.onSuccess { onSubmitted() }
                                .onFailure { error = readableError(it, "No se pudo enviar tu solicitud. Inténtalo de nuevo.") }
                            sending = false
                        }
                    }
                },
                enabled = !sending,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                if (sending) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = Color.White)
                else Text("Enviar solicitud")
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun RadioGroup(title: String, selected: String, choices: List<String>, onSelect: (String) -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            Text(title, fontWeight = FontWeight.SemiBold, color = HuellaBlue)
            choices.forEach { choice ->
                Row(
                    modifier = Modifier.fillMaxWidth().clickable { onSelect(choice) }.padding(vertical = 1.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(selected = selected == choice, onClick = { onSelect(choice) })
                    Text(choice)
                }
            }
        }
    }
}

private fun validateAdoptionForm(
    vivienda: String,
    exterior: String,
    otrasMascotas: String,
    personas: String,
    experiencia: String,
    motivacion: String,
    acepta: Boolean
): String {
    if (vivienda.isBlank()) return "Indica en qué tipo de vivienda vives."
    if (exterior.isBlank()) return "Indica si tienes espacio exterior."
    if (otrasMascotas.isBlank()) return "Indica si tienes otras mascotas."
    val people = personas.toIntOrNull()
    if (people == null || people !in 1..20) return "Indica entre 1 y 20 personas en tu hogar."
    if (experiencia.isBlank()) return "Selecciona tu experiencia con mascotas."
    if (motivacion.trim().length < 30) return "Cuéntanos tu motivación en al menos 30 caracteres."
    if (!acepta) return "Debes aceptar el compromiso de tenencia responsable."
    return ""
}

@Composable
private fun MyRequestsScreen(modifier: Modifier, uid: String) {
    var requests by remember { mutableStateOf<List<AdoptionRequest>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch {
            loading = true
            runCatching { FirebaseRepository.loadMyRequests(uid) }
                .onSuccess { requests = it; error = "" }
                .onFailure { error = readableError(it, "No se pudieron cargar tus solicitudes.") }
            loading = false
        }
    }

    DisposableEffect(uid) {
        val listener = FirebaseRepository.observeMyRequests(uid) { refresh() }
        refresh()
        onDispose { listener.remove() }
    }

    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Column {
                Text("RED HUELLA / MI CUENTA", color = HuellaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("Mis solicitudes", style = MaterialTheme.typography.headlineMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
            }
            IconButton(onClick = { refresh() }) { Icon(Icons.Filled.Refresh, contentDescription = "Actualizar solicitudes") }
        }
        Text("Las respuestas del refugio aparecerán aquí automáticamente.", color = HuellaMuted)
        if (loading && requests.isEmpty()) LoadingPanel("Cargando solicitudes…")
        if (error.isNotBlank()) ErrorText(error)
        if (!loading && requests.isEmpty() && error.isBlank()) EmptyPanel("Todavía no enviaste solicitudes de adopción.")
        requests.forEach { request -> RequestCard(request) {
            scope.launch {
                runCatching { FirebaseRepository.cancelRequest(request.id) }
                    .onFailure { error = readableError(it, "No se pudo cancelar la solicitud.") }
            }
        } }
    }
}

@Composable
private fun RequestCard(request: AdoptionRequest, onCancel: () -> Unit) {
    Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(request.pet?.nombre ?: "Mascota", style = MaterialTheme.typography.titleLarge, color = HuellaBlue, fontWeight = FontWeight.Bold)
                StatusPill(request.estado)
            }
            if (request.fechaMillis > 0L) {
                Text("Enviada el ${SimpleDateFormat("dd/MM/yyyy", Locale("es", "BO")).format(Date(request.fechaMillis))}", color = HuellaMuted)
            }
            if (request.observaciones.isNotBlank()) {
                HorizontalDivider()
                Text("Respuesta del refugio", fontWeight = FontWeight.SemiBold, color = HuellaBlue)
                Text(request.observaciones)
            }
            if (request.estado == "Pendiente") {
                OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) { Text("Cancelar solicitud") }
            }
        }
    }
}

@Composable
private fun ProfileScreen(modifier: Modifier, profile: UserProfile, onSignOut: () -> Unit) {
    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("RED HUELLA / MI CUENTA", color = HuellaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Tu perfil", style = MaterialTheme.typography.headlineMedium, color = HuellaBlue, fontWeight = FontWeight.Bold)
        Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(profile.nombreCompleto, style = MaterialTheme.typography.titleLarge, color = HuellaBlue, fontWeight = FontWeight.Bold)
                Text(profile.email)
                Text(profile.telefono)
                HorizontalDivider()
                Text("Cuenta de adoptante", color = HuellaGreen, fontWeight = FontWeight.SemiBold)
            }
        }
        Text("Desde aquí puedes consultar tus solicitudes y las respuestas de los refugios.", color = HuellaMuted)
        OutlinedButton(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.Logout, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Cerrar sesión")
        }
    }
}

@Composable
private fun AuthScreen(
    initialMode: AuthMode,
    message: String,
    onBack: () -> Unit,
    onSignedIn: (UserProfile) -> Unit
) {
    var mode by remember(initialMode) { mutableStateOf(initialMode) }
    var nombre by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var telefono by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmar by remember { mutableStateOf("") }
    var acepta by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf(message) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().background(HuellaCanvas)) {
        Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, contentDescription = "Volver") }
            Text("Red Huella", color = HuellaBlue, fontWeight = FontWeight.Bold)
        }
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("🐾 RED HUELLA", color = HuellaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(if (mode == AuthMode.LOGIN) "Qué bueno tenerte de vuelta" else "Crea tu cuenta de adoptante", style = MaterialTheme.typography.headlineSmall, color = HuellaBlue, fontWeight = FontWeight.Bold)
            Text(if (mode == AuthMode.LOGIN) "Ingresa para consultar tus solicitudes y adoptar." else "Regístrate para solicitar adoptar mascotas de refugios verificados.", color = HuellaMuted)
            if (mode == AuthMode.REGISTER) {
                OutlinedTextField(nombre, { nombre = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Nombre completo") }, singleLine = true)
            }
            OutlinedTextField(email, { email = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Correo electrónico") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
            if (mode == AuthMode.REGISTER) {
                OutlinedTextField(telefono, { value -> telefono = value.filter(Char::isDigit).take(8) }, modifier = Modifier.fillMaxWidth(), label = { Text("Celular boliviano") }, supportingText = { Text("8 dígitos; comienza con 5, 6 o 7.") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone))
            }
            OutlinedTextField(password, { password = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Contraseña") }, singleLine = true, visualTransformation = PasswordVisualTransformation())
            if (mode == AuthMode.REGISTER) {
                OutlinedTextField(confirmar, { confirmar = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Confirmar contraseña") }, singleLine = true, visualTransformation = PasswordVisualTransformation())
                Text("La contraseña debe tener 8 caracteres e incluir mayúscula, minúscula, número y símbolo.", color = HuellaMuted, fontSize = 12.sp)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = acepta, onCheckedChange = { acepta = it })
                    Text("Acepto los términos y el compromiso de adopción responsable.", fontSize = 14.sp)
                }
            }
            if (error.isNotBlank()) ErrorText(error)
            Button(
                onClick = {
                    error = validateAuthForm(mode, nombre, email, telefono, password, confirmar, acepta)
                    if (error.isBlank()) {
                        scope.launch {
                            loading = true
                            runCatching {
                                if (mode == AuthMode.REGISTER) {
                                    FirebaseRepository.register(nombre.trim(), email.trim().lowercase(), telefono, password)
                                } else {
                                    FirebaseRepository.signIn(email.trim().lowercase(), password)
                                }
                            }.onSuccess(onSignedIn)
                                .onFailure { error = readableError(it, "No se pudo completar el acceso.") }
                            loading = false
                        }
                    }
                },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                if (loading) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = Color.White)
                else Text(if (mode == AuthMode.LOGIN) "Iniciar sesión" else "Crear cuenta de adoptante")
            }
            TextButton(onClick = { mode = if (mode == AuthMode.LOGIN) AuthMode.REGISTER else AuthMode.LOGIN; error = "" }, modifier = Modifier.fillMaxWidth()) {
                Text(if (mode == AuthMode.LOGIN) "¿No tienes cuenta? Regístrate" else "Ya tengo una cuenta. Iniciar sesión")
            }
            Text("La app móvil no permite crear ni administrar cuentas de refugio o administrador.", color = HuellaMuted, fontSize = 12.sp)
            Spacer(Modifier.height(16.dp))
        }
    }
}

private fun validateAuthForm(
    mode: AuthMode,
    nombre: String,
    email: String,
    telefono: String,
    password: String,
    confirmar: String,
    acepta: Boolean
): String {
    if (mode == AuthMode.REGISTER) {
        val cleanName = nombre.trim()
        if (cleanName.length < 3 || cleanName.length > 100) return "El nombre debe tener entre 3 y 100 caracteres."
        if (!cleanName.matches(Regex("[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+"))) return "El nombre solo puede contener letras y espacios."
        if (!telefono.matches(Regex("[567][0-9]{7}"))) return "El celular debe tener 8 dígitos y comenzar con 5, 6 o 7."
    }
    if (!email.trim().matches(Regex("^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$"))) return "Ingresa un correo electrónico válido."
    if (password.isBlank()) return "Escribe tu contraseña."
    if (mode == AuthMode.REGISTER) {
        if (password.length < 8 || !password.any(Char::isUpperCase) || !password.any(Char::isLowerCase) || !password.any(Char::isDigit) || !password.any { !it.isLetterOrDigit() }) {
            return "La contraseña debe incluir 8 caracteres, mayúscula, minúscula, número y símbolo."
        }
        if (password != confirmar) return "Las contraseñas no coinciden."
        if (!acepta) return "Debes aceptar los términos para crear tu cuenta."
    }
    return ""
}

@Composable
private fun InfoScreen(modifier: Modifier, title: String, message: String, action: String, onAction: () -> Unit) {
    Column(
        modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("🐾", fontSize = 44.sp)
        Spacer(Modifier.height(10.dp))
        Text(title, style = MaterialTheme.typography.headlineSmall, color = HuellaBlue, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(message, color = HuellaMuted)
        Spacer(Modifier.height(18.dp))
        Button(onClick = onAction) { Text(action) }
    }
}

@Composable
private fun StatusPill(status: String) {
    val color = when (status) {
        "Disponible", "Aprobada", "Concretada" -> HuellaGreen
        "Pendiente", "En proceso" -> Color(0xFFB56A00)
        "Rechazada", "Cancelada" -> Color(0xFF9D3D36)
        else -> HuellaMuted
    }
    Surface(color = color.copy(alpha = 0.12f), shape = RoundedCornerShape(50)) {
        Text(status, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp), color = color, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun RemotePhoto(url: String?, modifier: Modifier = Modifier) {
    val bitmap by produceState<Bitmap?>(initialValue = null, key1 = url) {
        value = if (url.isNullOrBlank()) null else withContext(Dispatchers.IO) {
            runCatching {
                val connection = URL(url).openConnection().apply {
                    connectTimeout = 8_000
                    readTimeout = 8_000
                }
                connection.getInputStream().use { stream -> BitmapFactory.decodeStream(stream) }
            }.getOrNull()
        }
    }
    if (bitmap != null) {
        Image(bitmap = bitmap!!.asImageBitmap(), contentDescription = "Fotografía de mascota", modifier = modifier, contentScale = ContentScale.Crop)
    } else {
        Box(modifier.background(Color(0xFFE5EEF0)), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Filled.Pets, contentDescription = null, tint = HuellaGreen, modifier = Modifier.size(42.dp))
                Text("Red Huella", color = HuellaBlue, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun LoadingPanel(message: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 22.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
        CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
        Spacer(Modifier.width(10.dp))
        Text(message, color = HuellaMuted)
    }
}

@Composable
private fun EmptyPanel(message: String) {
    Surface(shape = RoundedCornerShape(16.dp), color = Color.White, modifier = Modifier.fillMaxWidth()) {
        Text(message, modifier = Modifier.padding(18.dp), color = HuellaMuted)
    }
}

@Composable
private fun ErrorPanel(message: String, onRetry: () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFFFFEBE9), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            ErrorText(message)
            TextButton(onClick = onRetry) { Text("Intentar nuevamente") }
        }
    }
}

@Composable
private fun ErrorText(message: String) {
    Text(message, color = MaterialTheme.colorScheme.error, fontSize = 14.sp)
}

private fun readableError(throwable: Throwable, fallback: String): String {
    val raw = throwable.message.orEmpty()
    return when {
        raw.contains("PERMISSION_DENIED", ignoreCase = true) -> "Firebase rechazó esta operación. Revisa que las reglas de Firestore estén publicadas en el proyecto de Red Huella."
        raw.contains("network", ignoreCase = true) -> "No hay conexión con Firebase. Revisa Internet e inténtalo de nuevo."
        raw.contains("email address is already in use", ignoreCase = true) -> "Ese correo ya tiene una cuenta. Inicia sesión."
        raw.contains("badly formatted", ignoreCase = true) -> "El correo electrónico no tiene un formato válido."
        raw.contains("password is invalid", ignoreCase = true) || raw.contains("no user record", ignoreCase = true) -> "Correo o contraseña incorrectos."
        raw.isNotBlank() -> raw
        else -> fallback
    }
}
