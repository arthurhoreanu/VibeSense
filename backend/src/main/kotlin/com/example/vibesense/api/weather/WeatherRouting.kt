package com.example.vibesense.api.weather

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Routing.weatherRouting(weatherService: WeatherService) {

    get("/weather") {
        try {
            val lat = call.request.queryParameters["lat"]?.toDoubleOrNull()
            val lon = call.request.queryParameters["lon"]?.toDoubleOrNull()

            if (lat == null || lon == null) {
                call.respondText("Invalid latitude or longitude")
                return@get
            }

            val rawData = weatherService.getWeatherData(lat, lon)

            val weatherCondition = weatherService.interpretWeatherCode(rawData.current.weatherCode)
            
            val precipitation = Precipitation(
                hasRain = rawData.current.rain > 0.0,
                hasShowers = rawData.current.showers > 0.0,
                hasSnowfall = rawData.current.snowfall > 0.0
            )

            val sunInfo = SunInfo(
                sunrise = rawData.daily.sunrise.first(),
                sunset = rawData.daily.sunset.first()
            )

            val formattedResponse = FormattedWeatherResponse(
                temperature = rawData.current.temperature,
                condition = weatherCondition,
                isDay = rawData.current.isDay == 1,
                precipitation = precipitation,
                sunInfo = sunInfo
            )

            call.respond(formattedResponse)

        } catch (e: Exception) {
            call.respondText("Error fetching or processing weather data: ${e.message}")
        }
    }
}
