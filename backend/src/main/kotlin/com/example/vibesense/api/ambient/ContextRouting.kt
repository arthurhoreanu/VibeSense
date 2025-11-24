package com.example.vibesense.api.ambient

import com.example.vibesense.api.engine.MoodContext
import com.example.vibesense.api.engine.MoodEngine
import com.example.vibesense.api.weather.WeatherService
import com.example.vibesense.notifications.NotificationScheduler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Routing.contextRouting(weatherService: WeatherService, moodEngine: MoodEngine, notificationScheduler: NotificationScheduler) {

    post("/context") {
        try {
            val req = call.receive<ContextRequest>()
            
            // Handle notifications
            notificationScheduler.handleUserOnline(req.uid)
            notificationScheduler.scheduleDailyNotifications(req.uid)

            // 1. Get Weather
            val weather = weatherService.getWeatherData(req.lat, req.lon)
            val condition = weatherService.interpretWeatherCode(weather.current.weatherCode)

            // 2. Determine Time of Day
            val partOfDay = when (req.hour) {
                in 6..11 -> "morning"
                in 12..17 -> "day"
                in 18..22 -> "evening"
                else -> "night"
            }

            val moodTag = "${partOfDay}_${condition}_${req.activity}"
            
            // 3. Construct MoodContext for the Engine
            val moodContext = MoodContext(
                timeOfDay = partOfDay,
                weatherCondition = condition,
                activityType = req.activity
            )
            
            // 4. Trigger Mood Engine to Add Song
            val addedTrackUri = moodEngine.generateAndQueueTrack(req.uid, moodContext)

            val resp = ContextResponse(
                moodTag = moodTag,
                message = "Processed $condition, activity=${req.activity}. Track added: ${addedTrackUri ?: "None"}",
                trackAdded = addedTrackUri
            )

            call.respond(resp)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Invalid context request: ${e.message}")
        }
    }
}
