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

@Serializable
data class NowPlayingResponse(
    val isPlaying: Boolean,
    val trackName: String?,
    val artistName: String?,
    val albumName: String?,
    val durationMs: Int?,
    val progressMs: Int?,
    val albumImageUrl: String?
)

@Serializable
data class SpotifyCurrentlyPlaying(
    @SerialName("is_playing") val isPlaying: Boolean,
    @SerialName("progress_ms") val progressMs: Int?,
    val item: SpotifyTrack?
)

@Serializable
data class SpotifyTrack(
    val name: String,
    @SerialName("duration_ms") val durationMs: Int,
    val album: SpotifyAlbum,
    val artists: List<SpotifyArtist>
)

@Serializable
data class SpotifyAlbum(
    val name: String,
    val images: List<SpotifyImage>
)

@Serializable
data class SpotifyArtist(
    val name: String
)

@Serializable
data class SpotifyImage(
    val url: String,
    val height: Int,
    val width: Int
)

@Serializable
data class SpotifyHistoryResponse(
    val items: List<SpotifyHistoryItem>
)

@Serializable
data class SpotifyHistoryItem(
    val track: SpotifyTrack,
    @SerialName("played_at") val playedAt: String
)

@Serializable
data class HistoryTrack(
    val trackName: String,
    val artistName: String,
    val playedAt: String, // ISO string
    val albumImageUrl: String?
)
