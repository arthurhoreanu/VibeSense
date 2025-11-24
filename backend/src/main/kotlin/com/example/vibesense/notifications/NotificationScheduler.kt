package com.example.vibesense.notifications

import com.example.vibesense.services.UserRepository
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

// Assuming this repository exists
interface UserNotificationRepository {
    fun getNotificationState(userId: String): UserNotificationState?
    fun saveNotificationState(state: UserNotificationState)
}

// Placeholder for the actual notification service (e.g., Firebase Cloud Messaging)
interface PushNotificationService {
    suspend fun sendNotification(userId: String, title: String, message: String, token: String)
}

data class UserNotificationState(
    val userId: String,
    var lastMorningNotification: LocalDateTime? = null,
    var lastDayNotification: LocalDateTime? = null,
    var lastEveningNotification: LocalDateTime? = null,
    var lastNightNotification: LocalDateTime? = null
)

class NotificationScheduler(
    private val notificationRepository: UserNotificationRepository,
    private val pushService: PushNotificationService,
    private val userRepository: UserRepository
) {

    companion object {
        val MORNING_START: LocalTime = LocalTime.of(7, 0)
        val MORNING_END: LocalTime = LocalTime.of(11, 0)

        val DAY_START: LocalTime = LocalTime.of(12, 0)
        val DAY_END: LocalTime = LocalTime.of(16, 0)

        val EVENING_START: LocalTime = LocalTime.of(18, 0)
        val EVENING_END: LocalTime = LocalTime.of(22, 0)

        val NIGHT_START: LocalTime = LocalTime.of(22, 0)
        val NIGHT_END: LocalTime = LocalTime.of(23, 59, 59)

        val DO_NOT_DISTURB_START: LocalTime = LocalTime.of(0, 0)
        val DO_NOT_DISTURB_END: LocalTime = LocalTime.of(7, 0)

        private val MORNING_MESSAGES = listOf(
            "Hey, {Username}! Ready to start the day? Let's set the vibe right.",
            "Morning, {Username}! Today’s soundtrack is waiting for you 🎧",
            "Rise and shine! Your vibe is calling 🌞",
            "New day, new mood. Want some fresh tunes?",
            "Hey, {Username}! Let's kickstart the day with good energy."
        )

        private val DAY_MESSAGES = listOf(
            "Hey, {Username}! Mid-day vibes check — need a mood boost?",
            "Quick break? I’ve got the perfect soundtrack 🍔🎶",
            "Feeling the midday slump? Music can help 👀",
            "Hey! Wanna switch up the vibe for the afternoon?",
            "Your day’s not over — let's keep the energy going!"
        )

        private val EVENING_MESSAGES = listOf(
            "Hey, {Username}! Time to unwind!",
            "Evening mode activated 🌙 Ready for some tunes?",
            "Long day? Let’s slow it down together.",
            "How are you feeling tonight? I’ve got music for that.",
            "Ready to switch to evening vibes?"
        )

        private val NIGHT_MESSAGES = listOf(
            "Hey, {Username}! Calm night, calm vibe.",
            "Late night thoughts need late night music 🌌",
            "Can’t sleep? I’ve got the perfect soundscape.",
            "Night mode on — want something mellow?",
            "Slow down, breathe, and vibe ✨"
        )

        private val PLAYFUL_MESSAGES = listOf(
            "Hey, {Username}! Your vibe called — it needs attention 👀",
            "Breaking news: You deserve good music today 📰🎶",
            "Guess what? It's vibe o’clock.",
            "Scientifically proven: music makes everything 23% better 🤓",
            "Friendly reminder: main character energy activated."
        )
    }

    private fun getRandomMessage(specificMessages: List<String>, username: String): String {
        val allMessages = specificMessages + PLAYFUL_MESSAGES
        return allMessages.random().replace("{Username}", username)
    }

    private fun getUsername(userId: String): String {
        return userRepository.getUsername(userId) ?: "acolo"
    }

    suspend fun handleUserOnline(userId: String) {
        val now = LocalDateTime.now()
        val currentTime = now.toLocalTime()
        val token = userRepository.getPushToken(userId) ?: return

        if (currentTime.isAfter(MORNING_START) && currentTime.isBefore(MORNING_END)) {
            val state = notificationRepository.getNotificationState(userId) ?: UserNotificationState(userId)
            if (state.lastMorningNotification == null || state.lastMorningNotification?.toLocalDate()?.isBefore(now.toLocalDate()) == true) {
                val username = getUsername(userId)
                val message = getRandomMessage(MORNING_MESSAGES, username)
                pushService.sendNotification(userId, "VibeSense", message, token)
                state.lastMorningNotification = now
                notificationRepository.saveNotificationState(state)
            }
        }
    }

    suspend fun scheduleDailyNotifications(userId: String) {
        val now = LocalDateTime.now()
        val currentTime = now.toLocalTime()
        val token = userRepository.getPushToken(userId) ?: return

        // Do not send notifications during "do not disturb" hours
        if (currentTime.isAfter(DO_NOT_DISTURB_START) && currentTime.isBefore(DO_NOT_DISTURB_END)) {
            return
        }

        val state = notificationRepository.getNotificationState(userId) ?: UserNotificationState(userId)
        val username = getUsername(userId)

        // Check for day interval
        if (currentTime.isAfter(DAY_START) && currentTime.isBefore(DAY_END)) {
            if (state.lastDayNotification == null || state.lastDayNotification?.toLocalDate()?.isBefore(now.toLocalDate()) == true) {
                val message = getRandomMessage(DAY_MESSAGES, username)
                pushService.sendNotification(userId, "VibeSense", message, token)
                state.lastDayNotification = now
                notificationRepository.saveNotificationState(state)
            }
        }

        // Check for evening interval
        else if (currentTime.isAfter(EVENING_START) && currentTime.isBefore(EVENING_END)) {
            if (state.lastEveningNotification == null || state.lastEveningNotification?.toLocalDate()?.isBefore(now.toLocalDate()) == true) {
                val message = getRandomMessage(EVENING_MESSAGES, username)
                pushService.sendNotification(userId, "VibeSense", message, token)
                state.lastEveningNotification = now
                notificationRepository.saveNotificationState(state)
            }
        }
        
        // Check for night interval
        else if (currentTime.isAfter(NIGHT_START) && currentTime.isBefore(NIGHT_END)) {
            if (state.lastNightNotification == null || state.lastNightNotification?.toLocalDate()?.isBefore(now.toLocalDate()) == true) {
                val message = getRandomMessage(NIGHT_MESSAGES, username)
                pushService.sendNotification(userId, "VibeSense", message, token)
                state.lastNightNotification = now
                notificationRepository.saveNotificationState(state)
            }
        }
    }
}
