package com.example.vibesense.api.user

import com.example.vibesense.services.UserRepository
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class TokenUpdateRequest(val uid: String, val token: String)

fun Routing.userRouting(userRepository: UserRepository) {
    post("/users/token") {
        try {
            val req = call.receive<TokenUpdateRequest>()
            userRepository.savePushToken(req.uid, req.token)
            call.respond(HttpStatusCode.OK, "Token saved successfully")
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Invalid request: ${e.message}")
        }
    }
}