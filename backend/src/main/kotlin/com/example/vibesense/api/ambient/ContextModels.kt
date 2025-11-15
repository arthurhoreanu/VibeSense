package com.example.vibesense.api.ambient

import kotlinx.serialization.Serializable

@Serializable
data class ContextRequest(
    val lat: Double,
    val lon: Double,
    val activity: String,   // "still" | "walking" | "running"
    val noiseLevel: String, // "quiet" | "noisy"
    val hour: Int           // 0..23
)

@Serializable
data class ContextResponse(
    val moodTag: String,
    val message: String
)
