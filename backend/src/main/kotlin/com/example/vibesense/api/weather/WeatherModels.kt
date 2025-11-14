package com.example.vibesense.api.weather

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

@Serializable
data class WeatherApiResponse(
    @SerialName("current")
    val current: CurrentWeather,
    @SerialName("daily")
    val daily: DailyWeather
)

@Serializable
data class CurrentWeather(
    @SerialName("temperature_2m")
    val temperature: Double,
    @SerialName("is_day")
    val isDay: Int,
    @SerialName("rain")
    val rain: Double,
    @SerialName("showers")
    val showers: Double,
    @SerialName("snowfall")
    val snowfall: Double,
    @SerialName("weather_code")
    val weatherCode: Int
)

@Serializable
data class DailyWeather(
    @SerialName("sunrise")
    val sunrise: List<String>,
    @SerialName("sunset")
    val sunset: List<String>
)

@Serializable
data class FormattedWeatherResponse(
    val temperature: Double,
    val condition: String,
    val isDay: Boolean,
    val precipitation: Precipitation,
    val sunInfo: SunInfo
)

@Serializable
data class Precipitation(
    val hasRain: Boolean,
    val hasShowers: Boolean,
    val hasSnowfall: Boolean
)

@Serializable
data class SunInfo(
    val sunrise: String,
    val sunset: String
)
