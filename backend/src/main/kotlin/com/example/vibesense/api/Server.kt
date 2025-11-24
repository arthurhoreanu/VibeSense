package com.example.vibesense.api

import com.example.vibesense.api.spotify.spotifyRouting
import com.example.vibesense.api.weather.WeatherService
import com.example.vibesense.api.weather.weatherRouting
import com.example.vibesense.api.ambient.contextRouting
import com.example.vibesense.api.engine.MoodEngine
import com.example.vibesense.api.firebase.FirebaseAdmin
import com.example.vibesense.api.user.userRouting
import com.example.vibesense.notifications.NotificationScheduler
import com.example.vibesense.services.ExpoPushNotificationService
import com.example.vibesense.services.FirebaseUserRepository
import com.example.vibesense.services.InMemoryUserNotificationRepository
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
        val userNotificationRepository = InMemoryUserNotificationRepository()
        val pushNotificationService = ExpoPushNotificationService(client)
        val userRepository = FirebaseUserRepository()
        val notificationScheduler = NotificationScheduler(userNotificationRepository, pushNotificationService, userRepository)

        install(ServerContentNegotiation) {
            json()
        }

        routing {
            weatherRouting(weatherService)
            contextRouting(weatherService, moodEngine, notificationScheduler)
            spotifyRouting(client, moodEngine)
            userRouting(userRepository)
        }

    }.start(wait = true)
}
