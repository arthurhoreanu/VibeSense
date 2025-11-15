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

            call.respondRedirect("vibesense://spotify-connected?status=success&uid=$uid")

        } catch (e: Exception) {
            application.log.error("Failed to exchange token for user $uid", e)
            val errorMessage = URLEncoder.encode(e.message ?: "Unknown error", "UTF-8")
            call.respondRedirect("vibesense://spotify-connected?status=error&message=$errorMessage")
        }
    }

    /**
     * NEW: Check if a user has valid Spotify tokens.
     */
    get("/spotify/status") {
        val uid = call.parameters["uid"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing user ID")
        
        val hasToken = TokenStorage.getAccessToken(uid) != null
        
        call.respond(SpotifyStatusResponse(isConnected = hasToken))
    }
    
    /**
     * Step 3: Add a song to the user's Spotify queue.
     */
    post("/spotify/queue") {
        val request = try {
            call.receive<QueueRequest>()
        } catch (e: Exception) {
            return@post call.respond(HttpStatusCode.BadRequest, "Invalid request body")
        }

        val accessToken = TokenStorage.getAccessToken(request.uid)
        if (accessToken == null) {
            return@post call.respond(HttpStatusCode.Unauthorized, "User not authenticated or token expired. Please log in again.")
        }

        try {
            val response: HttpResponse = client.post("https://api.spotify.com/v1/me/player/queue") {
                bearerAuth(accessToken)
                url {
                    parameters.append("uri", request.trackUri)
                }
            }

            if (response.status.isSuccess()) {
                call.respond(HttpStatusCode.OK, "Song added to queue successfully.")
            } else {
                val errorBody = response.bodyAsText()
                application.log.warn("Failed to add to queue for user ${request.uid}. Spotify responded with ${response.status}: $errorBody")
                call.respond(response.status, "Error from Spotify: $errorBody")
            }

        } catch (e: Exception) {
            application.log.error("Exception while adding to queue for user ${request.uid}", e)
            call.respond(HttpStatusCode.InternalServerError, "An internal error occurred.")
        }
    }
}
