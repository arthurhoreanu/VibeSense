package com.example.vibesense.api.ambient

import kotlinx.serialization.Serializable

@Serializable
data class ContextRequest(
    val uid: String,
    val lat: Double,
    val lon: Double,
    val activity: String,
    val hour: Int
)

@Serializable
data class ContextResponse(
    val moodTag: String,
    val message: String,
    val trackAdded: String? = null
)
