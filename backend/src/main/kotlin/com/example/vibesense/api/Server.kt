package com.example.vibesense.api

import com.example.vibesense.api.spotify.spotifyRouting
import com.example.vibesense.api.weather.WeatherService
import com.example.vibesense.api.weather.weatherRouting
import com.example.vibesense.api.ambient.contextRouting
import com.example.vibesense.api.engine.MoodEngine
import com.example.vibesense.api.firebase.FirebaseAdmin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation as ClientContentNegotiation
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation as ServerContentNegotiation
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

fun main() {
    FirebaseAdmin.initialize()

    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {

        val client = HttpClient(CIO) {
            install(ClientContentNegotiation) {
                json(Json { 
                    ignoreUnknownKeys = true
                    isLenient = true
                })
            }
        }

        val weatherService = WeatherService()
        val moodEngine = MoodEngine(client, this)

        install(ServerContentNegotiation) {
            json()
        }

        routing {
            weatherRouting(weatherService)
            contextRouting(weatherService, moodEngine)
            spotifyRouting(client, moodEngine)
        }

    }.start(wait = true)
}
