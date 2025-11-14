package com.example.vibesense.api.spotify

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TokenResponse(
    @SerialName("access_token")
    val accessToken: String,
    @SerialName("refresh_token")
    val refreshToken: String,
    @SerialName("expires_in")
    val expiresIn: Int,
    @SerialName("token_type")
    val tokenType: String,
    @SerialName("scope")
    val scope: String
)

@Serializable
data class QueueRequest(
    val uid: String,
    @SerialName("track_uri")
    val trackUri: String
)
