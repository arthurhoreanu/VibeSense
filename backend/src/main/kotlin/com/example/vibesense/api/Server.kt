package com.example.vibesense.api

import com.example.vibesense.api.weather.WeatherService
import com.example.vibesense.api.weather.weatherRouting
import com.example.vibesense.api.ambient.contextRouting
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {

        val weatherService = WeatherService()

        install(ContentNegotiation) {
            json()
        }

        routing {
            weatherRouting(weatherService)
            contextRouting(weatherService)
        }
    }.start(wait = true)
}
