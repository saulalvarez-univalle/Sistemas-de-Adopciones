package com.redhuella.android.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.tasks.await

data class UserProfile(
    val uid: String,
    val nombreCompleto: String,
    val email: String,
    val telefono: String,
    val rol: String,
    val estadoCuenta: String,
    val departamentoId: String = "",
    val municipioId: String = ""
)

data class Pet(
    val id: String,
    val nombre: String,
    val descripcion: String,
    val especieId: String,
    val raza: String,
    val edadAproximada: String,
    val edadCategoria: String,
    val tamano: String,
    val sexo: String,
    val fotosUrls: List<String>,
    val departamentoId: String,
    val municipioId: String,
    val albergueId: String,
    val estadoAdopcion: String
)

data class Shelter(
    val id: String,
    val nombre: String,
    val descripcion: String,
    val direccion: String,
    val telefono: String,
    val horarios: String,
    val departamentoId: String,
    val municipioId: String
)

data class AdoptionRequest(
    val id: String,
    val pet: Pet?,
    val estado: String,
    val observaciones: String,
    val fechaMillis: Long
)

object FirebaseRepository {
    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    private val db: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    fun currentUid(): String? = auth.currentUser?.uid

    suspend fun register(
        nombreCompleto: String,
        email: String,
        telefono: String,
        password: String
    ): UserProfile {
        val result = auth.createUserWithEmailAndPassword(email, password).await()
        val user = result.user ?: error("Firebase no devolvió la cuenta creada.")
        val profile = hashMapOf(
            "uid" to user.uid,
            "nombreCompleto" to nombreCompleto,
            "email" to email,
            "telefono" to telefono,
            "rol" to "Adoptante",
            "departamentoId" to "",
            "municipioId" to "",
            "fechaRegistro" to FieldValue.serverTimestamp(),
            "estadoCuenta" to "Activo"
        )

        try {
            db.collection("users").document(user.uid).set(profile).await()
        } catch (exception: Exception) {
            runCatching { user.delete().await() }
            auth.signOut()
            throw exception
        }

        return UserProfile(user.uid, nombreCompleto, email, telefono, "Adoptante", "Activo")
    }

    suspend fun signIn(email: String, password: String): UserProfile {
        val user = auth.signInWithEmailAndPassword(email, password).await().user
            ?: error("No se encontró la cuenta.")
        val document = db.collection("users").document(user.uid).get().await()
        if (!document.exists()) {
            auth.signOut()
            error("Tu cuenta no tiene un perfil en Red Huella.")
        }
        val profile = document.toUserProfile()
        if (profile.rol != "Adoptante") {
            auth.signOut()
            error("La aplicación móvil está habilitada solo para adoptantes. Ingresa desde la página web para administrar tu cuenta.")
        }
        if (profile.estadoCuenta != "Activo") {
            auth.signOut()
            error("Esta cuenta no está activa. Comunícate con la administración de Red Huella.")
        }
        return profile
    }

    suspend fun loadProfile(uid: String): UserProfile =
        db.collection("users").document(uid).get().await().toUserProfile()

    fun signOut() {
        auth.signOut()
    }

    suspend fun loadPets(): List<Pet> {
        return db.collection("mascotas").get().await().documents
            .mapNotNull { it.toPet() }
            .filter { it.estadoAdopcion in setOf("Disponible", "En proceso") }
            .sortedBy { it.nombre.lowercase() }
    }

    suspend fun loadShelters(): List<Shelter> {
        return db.collection("albergues")
            .whereEqualTo("estadoVerificacion", "Verificado")
            .get().await().documents
            .map { document ->
                Shelter(
                    id = document.id,
                    nombre = document.string("nombreRefugio"),
                    descripcion = document.string("descripcion"),
                    direccion = document.string("direccion"),
                    telefono = document.string("telefonoContacto"),
                    horarios = document.string("horariosAtencion"),
                    departamentoId = document.string("departamentoId"),
                    municipioId = document.string("municipioId")
                )
            }
            .sortedBy { it.nombre.lowercase() }
    }

    suspend fun submitAdoptionRequest(
        profile: UserProfile,
        pet: Pet,
        tipoVivienda: String,
        tieneEspacioExterior: String,
        otrasMascotas: String,
        personasEnCasa: Int,
        experiencia: String,
        motivacion: String
    ) {
        val existing = db.collection("solicitudes_adopcion")
            .whereEqualTo("adoptanteUserId", profile.uid)
            .get().await().documents
        val hasActiveRequest = existing.any { document ->
            document.string("mascotaId") == pet.id &&
                document.string("estado") in setOf("Pendiente", "Aprobada")
        }
        check(!hasActiveRequest) { "Ya tienes una solicitud activa para esta mascota." }
        check(pet.estadoAdopcion == "Disponible") { "Esta mascota ya no está recibiendo solicitudes." }

        val applicant = hashMapOf(
            "nombreCompleto" to profile.nombreCompleto,
            "telefono" to profile.telefono,
            "email" to profile.email,
            "departamentoId" to profile.departamentoId,
            "municipioId" to profile.municipioId,
            "tipoVivienda" to tipoVivienda,
            "tieneEspacioExterior" to tieneEspacioExterior,
            "otrasMascotas" to otrasMascotas,
            "personasEnCasa" to personasEnCasa,
            "experiencia" to experiencia,
            "motivacion" to motivacion.trim()
        )
        db.collection("solicitudes_adopcion").add(
            hashMapOf(
                "adoptanteUserId" to profile.uid,
                "mascotaId" to pet.id,
                "albergueId" to pet.albergueId,
                "datosSolicitante" to applicant,
                "estado" to "Pendiente",
                "observacionesAlbergue" to "",
                "fechaSolicitud" to FieldValue.serverTimestamp()
            )
        ).await()
    }

    suspend fun loadMyRequests(uid: String): List<AdoptionRequest> {
        val documents = db.collection("solicitudes_adopcion")
            .whereEqualTo("adoptanteUserId", uid)
            .get().await().documents
            .sortedByDescending { it.getTimestamp("fechaSolicitud")?.toDate()?.time ?: 0L }

        return documents.map { document ->
            val petId = document.string("mascotaId")
            val pet = if (petId.isBlank()) null else runCatching { loadPet(petId) }.getOrNull()
            AdoptionRequest(
                id = document.id,
                pet = pet,
                estado = document.string("estado"),
                observaciones = document.string("observacionesAlbergue"),
                fechaMillis = document.getTimestamp("fechaSolicitud")?.toDate()?.time ?: 0L
            )
        }
    }

    fun observeMyRequests(uid: String, onChanged: () -> Unit): ListenerRegistration =
        db.collection("solicitudes_adopcion")
            .whereEqualTo("adoptanteUserId", uid)
            .addSnapshotListener { _, error -> if (error == null) onChanged() }

    suspend fun cancelRequest(requestId: String) {
        db.collection("solicitudes_adopcion").document(requestId)
            .update("estado", "Cancelada").await()
    }

    private suspend fun loadPet(id: String): Pet? =
        db.collection("mascotas").document(id).get().await().toPet()

    private fun DocumentSnapshot.toUserProfile(): UserProfile {
        if (!exists()) error("No se encontró el perfil del usuario.")
        return UserProfile(
            uid = string("uid").ifBlank { id },
            nombreCompleto = string("nombreCompleto"),
            email = string("email"),
            telefono = string("telefono"),
            rol = string("rol"),
            estadoCuenta = string("estadoCuenta"),
            departamentoId = string("departamentoId"),
            municipioId = string("municipioId")
        )
    }

    private fun DocumentSnapshot.toPet(): Pet? {
        if (!exists() || getBoolean("activo") == false) return null
        val photos = (get("fotosUrls") as? List<*>)
            ?.mapNotNull { it?.toString()?.takeIf(String::isNotBlank) }
            .orEmpty()
        return Pet(
            id = id,
            nombre = string("nombre").ifBlank { "Mascota" },
            descripcion = string("descripcion"),
            especieId = string("especieId"),
            raza = string("raza"),
            edadAproximada = value("edadAproximada"),
            edadCategoria = string("edadCategoria"),
            tamano = string("tamano"),
            sexo = string("sexo"),
            fotosUrls = photos,
            departamentoId = string("departamentoId"),
            municipioId = string("municipioId"),
            albergueId = string("albergueId"),
            estadoAdopcion = string("estadoAdopcion")
        )
    }

    private fun DocumentSnapshot.string(field: String): String = getString(field).orEmpty()
    private fun DocumentSnapshot.value(field: String): String = get(field)?.toString().orEmpty()
}
