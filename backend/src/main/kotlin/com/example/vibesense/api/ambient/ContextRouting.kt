package com.example.vibesense.api.ambient

import com.example.vibesense.api.weather.WeatherService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Routing.contextRouting(weatherService: WeatherService) {

    post("/context") {
        try {
            val req = call.receive<ContextRequest>()

            val weather = weatherService.getWeatherData(req.lat, req.lon)
            val condition = weatherService.interpretWeatherCode(weather.current.weatherCode)

            val partOfDay = when (req.hour) {
                in 6..11 -> "morning"
                in 12..17 -> "day"
                in 18..22 -> "evening"
                else -> "night"
            }

            val moodTag = "${partOfDay}_${condition}_${req.activity}"

            val resp = ContextResponse(
                moodTag = moodTag,
                message = "Using $condition, activity=${req.activity}, hour=${req.hour}"
            )

            call.respond(resp)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Invalid context request: ${e.message}")
        }
    }
}
