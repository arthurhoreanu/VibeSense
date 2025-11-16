package com.example.vibesense.api.spotify

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import java.net.URLEncoder
import java.util.Base64

@Serializable
data class SpotifyStatusResponse(val isConnected: Boolean)

@Serializable
data class PlaybackRequest(val uid: String)

private suspend fun addToQueue(uid: String, trackUri: String, client: HttpClient, application: Application): Pair<HttpStatusCode, String> {
    val accessToken = TokenStorage.getAccessToken(uid)
    if (accessToken == null) {
        return HttpStatusCode.Unauthorized to "User not authenticated or token expired. Please log in again."
    }

    return try {
        val response: HttpResponse = client.post("https://api.spotify.com/v1/me/player/queue") {
            bearerAuth(accessToken)
            url {
                parameters.append("uri", trackUri)
            }
        }

        if (response.status.isSuccess()) {
            application.log.info("Successfully added track $trackUri to queue for user $uid.")
            HttpStatusCode.OK to "Song added to queue successfully."
        } else {
            val errorBody = response.bodyAsText()
            application.log.warn("Failed to add to queue for user $uid. Spotify responded with ${response.status}: $errorBody")
            response.status to "Error from Spotify: $errorBody"
        }
    } catch (e: Exception) {
        application.log.error("Exception while adding to queue for user $uid", e)
        HttpStatusCode.InternalServerError to "An internal error occurred."
    }
}

fun Routing.spotifyRouting(client: HttpClient) {

    /**
     * Step 1: Redirect user to Spotify's authorization page.
     */
    get("/spotify/login") {
        val uid = call.parameters["uid"] ?: return@get call.respondText("Missing user ID", status = HttpStatusCode.BadRequest)
        val state = uid

        val scopes = listOf(
            "user-modify-playback-state",
            "user-read-playback-state",
            "user-read-currently-playing"
        ).joinToString(" ")

        val authorizationUrl = "https://accounts.spotify.com/authorize?" +
            "response_type=code" +
            "&client_id=${SpotifyConfig.CLIENT_ID}" +
            "&scope=${URLEncoder.encode(scopes, "UTF-8")}" +
            "&redirect_uri=${URLEncoder.encode(SpotifyConfig.REDIRECT_URI, "UTF-8")}" +
            "&state=$state"

        application.log.info("Redirecting to Spotify with URL: $authorizationUrl")

        call.respondRedirect(authorizationUrl)
    }

    /**
     * Step 2: Spotify redirects back. Exchange authorization code for tokens.
     */
    get("/callback") {
        val code = call.parameters["code"]
        val state = call.parameters["state"]

        if (code == null || state == null) {
            return@get call.respondRedirect("vibesense://spotify-connected?status=error&message=Invalid-callback")
        }

        val uid = state

        try {
            val tokenResponse: TokenResponse = client.post("https://accounts.spotify.com/api/token") {
                val authHeader = "Basic " + Base64.getEncoder().encodeToString("${SpotifyConfig.CLIENT_ID}:${SpotifyConfig.CLIENT_SECRET}".toByteArray())
                header(HttpHeaders.Authorization, authHeader)
                setBody(FormDataContent(Parameters.build {
                    append("grant_type", "authorization_code")
                    append("code", code)
                    append("redirect_uri", SpotifyConfig.REDIRECT_URI)
                }))
            }.body()

            TokenStorage.saveTokens(uid, tokenResponse.accessToken, tokenResponse.refreshToken)
            application.log.info("Successfully received and stored tokens for user $uid.")

            // Add a song to the queue for testing purposes
            val (status, message) = addToQueue(uid, "spotify:track:4cOdK2wGLETKBW3PvgPWqT", client, application)
            if (status != HttpStatusCode.OK) {
                application.log.warn("Could not add initial song to queue for user $uid: $message")
                // Don't fail the whole login for this. Just log it.
            }

            call.respondRedirect("vibesense://spotify-connected?status=success&uid=$uid")

        } catch (e: Exception) {
            application.log.error("Failed to exchange token for user $uid", e)
            val errorMessage = URLEncoder.encode(e.message ?: "Unknown error", "UTF-8")
            call.respondRedirect("vibesense://spotify-connected?status=error&message=$errorMessage")
        }
    }

    /**
     * Check if a user has valid Spotify tokens.
     */
    get("/spotify/status") {
        val uid = call.parameters["uid"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing user ID")

        val hasToken = TokenStorage.getAccessToken(uid) != null

        call.respond(SpotifyStatusResponse(isConnected = hasToken))
    }

    /**
     * Get the user's currently playing track.
     */
    get("/spotify/now-playing") {
        val uid = call.parameters["uid"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing user ID")

        val accessToken = TokenStorage.getAccessToken(uid)
        if (accessToken == null) {
            return@get call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired.")
        }

        try {
            val response: HttpResponse = client.get("https://api.spotify.com/v1/me/player/currently-playing") {
                bearerAuth(accessToken)
            }

            if (response.status == HttpStatusCode.NoContent) {
                return@get call.respond(NowPlayingResponse(isPlaying = false, null, null, null, null, null, null))
            }

            if (response.status.isSuccess()) {
                val spotifyResponse = response.body<SpotifyCurrentlyPlaying>()
                val track = spotifyResponse.item
                val nowPlaying = NowPlayingResponse(
                    isPlaying = spotifyResponse.isPlaying,
                    trackName = track?.name,
                    artistName = track?.artists?.joinToString { it.name },
                    albumName = track?.album?.name,
                    durationMs = track?.durationMs,
                    progressMs = spotifyResponse.progressMs,
                    albumImageUrl = track?.album?.images?.firstOrNull()?.url
                )
                call.respond(nowPlaying)
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Could not get 'now playing' for user $uid. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }
        } catch (e: Exception) {
            application.log.error("Exception while getting 'now playing' for user $uid", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }

    /**
     * Add a song to the user's Spotify queue.
     */
    post("/spotify/queue") {
        val request = try {
            call.receive<QueueRequest>()
        } catch (e: Exception) {
            return@post call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val (status, message) = addToQueue(request.uid, request.trackUri, client, application)
        call.respond(status, message)
    }

    put("/spotify/play") {
        val request = try {
            call.receive<PlaybackRequest>()
        } catch (e: Exception) {
            return@put call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val accessToken = TokenStorage.getAccessToken(request.uid)
        if (accessToken == null) {
            return@put call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired. Please log in again.")
        }

        try {
            val response: HttpResponse = client.put("https://api.spotify.com/v1/me/player/play") {
                bearerAuth(accessToken)
            }

            if (response.status.isSuccess()) {
                call.respond(HttpStatusCode.OK, "Playback resumed.")
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Failed to resume playback for user ${request.uid}. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }
        } catch (e: Exception) {
            application.log.error("Exception while resuming playback for user ${request.uid}", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }

    put("/spotify/pause") {
        val request = try {
            call.receive<PlaybackRequest>()
        } catch (e: Exception) {
            return@put call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val accessToken = TokenStorage.getAccessToken(request.uid)
        if (accessToken == null) {
            return@put call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired. Please log in again.")
        }

        try {
            val response: HttpResponse = client.put("https://api.spotify.com/v1/me/player/pause") {
                bearerAuth(accessToken)
            }

            if (response.status.isSuccess()) {
                call.respond(HttpStatusCode.OK, "Playback paused.")
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Failed to pause playback for user ${request.uid}. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }
        } catch (e: Exception) {
            application.log.error("Exception while pausing playback for user ${request.uid}", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }
    
    post("/spotify/next") {
        val request = try {
            call.receive<PlaybackRequest>()
        } catch (e: Exception) {
            return@post call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val accessToken = TokenStorage.getAccessToken(request.uid)
        if (accessToken == null) {
            return@post call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired. Please log in again.")
        }

        try {
            val response: HttpResponse = client.post("https://api.spotify.com/v1/me/player/next") {
                bearerAuth(accessToken)
            }

            if (response.status.isSuccess()) {
                call.respond(HttpStatusCode.OK, "Skipped to next track.")
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Failed to skip to next for user ${request.uid}. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }
        } catch (e: Exception) {
            application.log.error("Exception while skipping to next for user ${request.uid}", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }

    post("/spotify/previous") {
        val request = try {
            call.receive<PlaybackRequest>()
        } catch (e: Exception) {
            return@post call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val accessToken = TokenStorage.getAccessToken(request.uid)
        if (accessToken == null) {
            return@post call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired. Please log in again.")
        }

        try {
            val response: HttpResponse = client.post("https://api.spotify.com/v1/me/player/previous") {
                bearerAuth(accessToken)
            }

            if (response.status.isSuccess()) {
                call.respond(HttpStatusCode.OK, "Skipped to previous track.")
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Failed to skip to previous for user ${request.uid}. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }
        } catch (e: Exception) {
            application.log.error("Exception while skipping to previous for user ${request.uid}", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }
}
