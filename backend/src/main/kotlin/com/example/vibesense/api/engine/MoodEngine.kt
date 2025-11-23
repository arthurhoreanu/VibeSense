package com.example.vibesense.api.engine

import com.example.vibesense.api.spotify.TokenStorage
import com.google.firebase.cloud.FirestoreClient
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

// --- INPUT MODELS (Sensor Data) ---

@Serializable
data class MoodContext(
    val timeOfDay: String,
    val weatherCondition: String,
    val activityType: String
)

// --- DATABASE TARGET MODEL ---

data class DatabaseKeys(
    val bpm: String,
    val genre: String,
    val niche: String
)

// --- ENGINE CLASS ---

class MoodEngine(private val client: HttpClient, private val application: Application) {

    suspend fun generateAndQueueTrack(uid: String, context: MoodContext): String? {
        val trackInfo = generateTrackUri(uid, context)

        if (trackInfo != null) {
            val success = addTrackToQueue(uid, trackInfo.first)
            if (success) {
                application.log.info("MoodEngine: [FINAL] Track '${trackInfo.second}' added to queue successfully.")
                return trackInfo.first
            }
        }
        return null
    }

    // Returns Pair<URI, TrackName>
    suspend fun generateTrackUri(uid: String, context: MoodContext): Pair<String, String>? {
        val accessToken = TokenStorage.getAccessToken(uid)
        if (accessToken == null) {
            application.log.warn("No access token for user $uid")
            return null
        }

        // 0. Get Currently Playing Track (to avoid duplicates)
        val currentUri = getCurrentlyPlayingUri(accessToken)
        if (currentUri != null) {
            application.log.info("MoodEngine: [FILTER] Currently playing: $currentUri. Will exclude from selection.")
        }

        // 1. Determine Database Keys based on Sensors
        val keys = analyzeSensors(context)

        application.log.info("==================================================")
        application.log.info("MoodEngine: [DECISION] Context: $context")
        application.log.info("MoodEngine: [DB KEYS] Niche='${keys.niche}' | Genre='${keys.genre}' | BPM='${keys.bpm}'")
        application.log.info("==================================================")

        // 2. Fetch Content IDs from Firestore (Randomized Strategy)
        val contentIds = fetchContentWithFallback(keys)

        if (contentIds.isEmpty()) {
            application.log.warn("MoodEngine: No content IDs found in DB for keys: $keys")
            return null
        }

        // 3. Get Random Track (Excluding current track)
        return getTrackFromContentId(accessToken, contentIds, excludeUri = currentUri)
    }

    /**
     * THE MATRIX: Maps Sensor Data to Database Keys (BPM, Genre, Niche)
     */
    private fun analyzeSensors(context: MoodContext): DatabaseKeys {
        val c = context.weatherCondition
        val t = context.timeOfDay
        val a = context.activityType
        
        // --- WEATHER GROUPS ---
        val isRainy = c.contains("Rain") || c.contains("Drizzle") || c.contains("Thunderstorm") || c.contains("Showers") || c.contains("Hail")
        val isSnowy = c.contains("Snow") || c.contains("Ice") || c.contains("Freezing")
        val isClear = c.contains("Clear") || c.contains("Mainly clear") || c.contains("Sunny")
        val isCloudy = c.contains("Overcast") || c.contains("Fog") || c.contains("Clouds") || c.contains("Partly cloudy")

        // --- TIME GROUPS ---
        val isNight = t.equals("night", ignoreCase = true) || t.equals("Late Night", ignoreCase = true)
        val isEvening = t.equals("evening", ignoreCase = true)
        val isMorning = t.equals("morning", ignoreCase = true)
        val isDay = t.equals("day", ignoreCase = true) || t.equals("Daytime", ignoreCase = true)

        fun logLogic(msg: String) {
            application.log.info("MoodEngine: [LOGIC] $msg")
        }

        return when (a.lowercase()) {
            "running" -> {
                // BPM 150-200
                when {
                    // Night/Evening -> House, New-wave, Hip-hop
                    isNight || isEvening -> {
                        logLogic("Running at Night/Evening.")
                        DatabaseKeys(
                            bpm = listOf("150", "160", "170").random(),
                            genre = listOf("house", "new-wave", "hip-hop").random(),
                            niche = listOf("late-night", "german", "arcane").random()
                        )
                    }
                    // Sunny/Clear -> Pop-rock, K-pop, Electro-pop
                    isClear -> {
                        logLogic("Running in Sun.")
                        DatabaseKeys(
                            bpm = listOf("160", "170", "180", "190").random(),
                            genre = listOf("pop-rock", "k-pop", "electro-pop").random(),
                            niche = listOf("tumblr", "arcane").random()
                        )
                    }
                    // Rain/Snow -> Alternative-rock, EDM
                    isRainy || isSnowy -> {
                        logLogic("Running in Rain/Snow.")
                        DatabaseKeys(
                            bpm = listOf("150", "160", "180").random(),
                            genre = listOf("alternative-rock", "edm").random(),
                            niche = listOf("german", "arcane").random()
                        )
                    }
                    // Default/Morning -> EDM, Hip-Hop
                    else -> {
                        logLogic("Running Default/Morning.")
                        DatabaseKeys(
                            bpm = listOf("150", "160", "170", "180", "200").random(),
                            genre = listOf("edm", "hip-hop", "electro-pop").random(),
                            niche = listOf("tumblr", "arcane").random()
                        )
                    }
                }
            }
            "walking" -> {
                // BPM 90-140
                when {
                    // Sunny/Clear -> Surf-rock, Latin, Reggae, Psychedelic-rock, Pop
                    (isClear || isDay) && !isRainy -> {
                         logLogic("Walking in Sun/Day.")
                         DatabaseKeys(
                             bpm = listOf("100", "110", "120", "130").random(),
                             genre = listOf("surf-rock", "latin", "reggae", "psychedelic-rock", "pop").random(),
                             niche = listOf("cottagecore", "tumblr").random()
                         )
                    }
                    // Night/Evening -> Synth-pop, Alt-pop, R&B
                    isNight || isEvening -> {
                        logLogic("Walking at Night/Evening.")
                        DatabaseKeys(
                            bpm = listOf("90", "100", "110", "120").random(),
                            genre = listOf("synth-pop", "alternative-pop", "r&b").random(),
                            niche = listOf("stranger_things", "late-night", "nordic").random()
                        )
                    }
                    // Rain/Snow -> Folk-rock, Country, Soul
                    isRainy || isSnowy -> {
                        logLogic("Walking in Rain/Snow.")
                        DatabaseKeys(
                            bpm = listOf("90", "100", "110", "140").random(),
                            genre = listOf("folk-rock", "country", "soul").random(),
                            niche = listOf("dark-academia", "nordic").random()
                        )
                    }
                    // Default/Cloudy -> Baroque-pop, Pop, Country, R&B
                    else -> {
                        logLogic("Walking Default/Cloudy.")
                        DatabaseKeys(
                            bpm = listOf("100", "110", "120", "130").random(),
                            genre = listOf("baroque-pop", "pop", "country", "r&b").random(),
                            niche = listOf("tumblr", "dark-academia").random()
                        )
                    }
                }
            }
            "still" -> {
                // BPM 50-80
                when {
                    // Night/Evening -> Jazz, Gothic, Soundtrack
                    isNight || isEvening -> {
                         logLogic("Still at Night/Evening.")
                         DatabaseKeys(
                             bpm = listOf("50", "60", "70").random(),
                             genre = listOf("jazz", "gothic", "soundtrack").random(),
                             niche = listOf("late-night", "wednesday", "nordic", "stranger_things").random()
                         )
                    }
                    // Morning -> Classical, Disney
                    isMorning -> {
                         logLogic("Still Morning.")
                         DatabaseKeys(
                             bpm = listOf("60", "70", "80").random(),
                             genre = listOf("classical", "disney").random(),
                             niche = listOf("cottagecore", "dark-academia").random()
                         )
                    }
                    // Rain/Snow -> Emo, Soul, Soundtrack
                    isRainy || isSnowy -> {
                         logLogic("Still in Rain/Snow.")
                         DatabaseKeys(
                             bpm = listOf("50", "60", "70", "80").random(),
                             genre = listOf("emo", "soul", "soundtrack").random(),
                             niche = listOf("wednesday", "nordic").random()
                         )
                    }
                    // Day/Default -> Soul, Disney, Classical
                    else -> {
                        logLogic("Still Day/Default.")
                        DatabaseKeys(
                            bpm = listOf("60", "70", "80").random(),
                            genre = listOf("soul", "disney", "classical").random(),
                            niche = listOf("cottagecore", "dark-academia").random()
                        )
                    }
                }
            }
            else -> {
                logLogic("Unknown activity, defaulting.")
                DatabaseKeys("120", "pop", "daily_mix")
            }
        }
    }

    /**
     * DATABASE LAYER (Randomized Strategy)
     */
    private suspend fun fetchContentWithFallback(keys: DatabaseKeys): List<String> {
        val strategies = listOf<suspend () -> List<String>>(
            {
                val ids = fetchFromFirestore("niche", keys.niche)
                if (ids.isNotEmpty()) application.log.info("MoodEngine: [DB] Random Strategy: 'NICHE' -> Found '${keys.niche}'")
                ids
            },
            {
                val ids = fetchFromFirestore("genre", keys.genre)
                if (ids.isNotEmpty()) application.log.info("MoodEngine: [DB] Random Strategy: 'GENRE' -> Found '${keys.genre}'")
                ids
            },
            {
                val ids = fetchFromFirestore("bpm", keys.bpm)
                if (ids.isNotEmpty()) application.log.info("MoodEngine: [DB] Random Strategy: 'BPM' -> Found '${keys.bpm}'")
                ids
            }
        )

        val shuffledStrategies = strategies.shuffled()

        for (strategy in shuffledStrategies) {
            val result = strategy()
            if (result.isNotEmpty()) return result
        }

        return emptyList()
    }

    private suspend fun fetchFromFirestore(collectionName: String, keyName: String): List<String> {
        return try {
            withContext(Dispatchers.IO) {
                val db = FirestoreClient.getFirestore()
                
                val querySnapshot = db.collection(collectionName)
                    .whereEqualTo("name", keyName)
                    .get()
                    .get()

                val allIds = mutableListOf<String>()

                for (document in querySnapshot.documents) {
                    val data = document.data
                    val playlistField = data["playlist"]

                    if (playlistField is Map<*, *>) {
                        playlistField.values.forEach { value ->
                            if (value is String) allIds.add(value)
                        }
                    } else if (playlistField is List<*>) {
                        playlistField.forEach { value ->
                            if (value is String) allIds.add(value)
                        }
                    } else if (playlistField is String) {
                        allIds.add(playlistField)
                    }
                }
                allIds
            }
        } catch (e: Exception) {
            application.log.error("MoodEngine: Firestore Error on $collectionName / $keyName.", e)
            emptyList()
        }
    }

    /**
     * SPOTIFY FETCH (Handles Playlist OR Album)
     */
    private suspend fun getTrackFromContentId(token: String, contentIds: List<String>, excludeUri: String?): Pair<String, String>? {
        val shuffledIds = contentIds.shuffled()
        
        for (id in shuffledIds) {
            application.log.info("MoodEngine: Trying Content ID: $id")

            // ATTEMPT 1: Try as Playlist
            var tracksHref = getTracksLink(token, id, type = "playlists")
            var contextName = "Playlist"

            // ATTEMPT 2: If not a playlist, try as Album
            if (tracksHref == null) {
                application.log.info("MoodEngine: ID $id is not a Playlist (or 404). Trying as Album...")
                tracksHref = getTracksLink(token, id, type = "albums")
                contextName = "Album"
            }

            if (tracksHref == null) {
                application.log.warn("MoodEngine: ID $id is neither a valid Playlist nor Album.")
                continue
            }

            // FETCH TRACKS (Pass excludeUri to avoid duplicates)
            val track = fetchRandomTrack(token, tracksHref, excludeUri)
            if (track != null) {
                application.log.info("MoodEngine: Selected track '${track.second}' from $contextName ($id)")
                return track
            }
        }

        return null
    }

    private suspend fun getTracksLink(token: String, id: String, type: String): String? {
        val response = client.get("https://api.spotify.com/v1/$type/$id") {
            bearerAuth(token)
            url { parameters.append("market", "US") }
        }

        if (!response.status.isSuccess()) return null
        val json = response.body<JsonObject>()
        return json["tracks"]?.jsonObject?.get("href")?.jsonPrimitive?.content
    }

    private suspend fun fetchRandomTrack(token: String, tracksHref: String, excludeUri: String?): Pair<String, String>? {
        val response = client.get(tracksHref) {
            bearerAuth(token)
            url { 
                parameters.append("limit", "50")
                parameters.append("market", "US")
            }
        }

        if (!response.status.isSuccess()) return null

        val json = response.body<JsonObject>()
        val items = json["items"]?.jsonArray ?: return null
        
        // Extract tracks
        val validTracks = items.mapNotNull { item ->
            val itemObj = item as? JsonObject
            if (itemObj?.containsKey("track") == true) {
                 itemObj["track"] as? JsonObject
            } else {
                itemObj
            }
        }

        // FILTER: Exclude the currently playing track
        val candidates = if (excludeUri != null) {
            validTracks.filter { 
                val uri = it["uri"]?.jsonPrimitive?.content
                uri != excludeUri 
            }
        } else {
            validTracks
        }

        if (candidates.isEmpty()) {
            if (validTracks.isNotEmpty()) application.log.info("MoodEngine: [FILTER] All tracks in this fetch matched the current track. Skipping.")
            return null
        }

        val selected = candidates.random()
        val uri = selected["uri"]?.jsonPrimitive?.content
        val name = selected["name"]?.jsonPrimitive?.content ?: "Unknown"
        
        val artists = selected["artists"] as? JsonArray
        val artistName = artists?.firstOrNull()?.jsonObject?.get("name")?.jsonPrimitive?.content ?: "Unknown Artist"

        return if (uri != null) Pair(uri, "$name by $artistName") else null
    }

    // --- HELPER: Get Current Playing URI ---
    private suspend fun getCurrentlyPlayingUri(token: String): String? {
        try {
            val response = client.get("https://api.spotify.com/v1/me/player/currently-playing") {
                bearerAuth(token)
            }
            if (response.status == HttpStatusCode.NoContent) return null // Nothing playing
            
            if (response.status.isSuccess()) {
                val json = response.body<JsonObject>()
                // Navigate safely: item -> uri
                return json["item"]?.jsonObject?.get("uri")?.jsonPrimitive?.content
            }
        } catch (e: Exception) {
            application.log.warn("MoodEngine: Could not check currently playing track: ${e.message}")
        }
        return null
    }

    private suspend fun addTrackToQueue(uid: String, trackUri: String): Boolean {
        val accessToken = TokenStorage.getAccessToken(uid) ?: return false
        return try {
            val response = client.post("https://api.spotify.com/v1/me/player/queue") {
                bearerAuth(accessToken)
                url { parameters.append("uri", trackUri) }
            }
            if (!response.status.isSuccess()) {
                application.log.warn("MoodEngine: Queue Error: ${response.bodyAsText()}")
                false
            } else true
        } catch (e: Exception) {
            application.log.error("MoodEngine: Queue Exception", e)
            false
        }
    }
}
