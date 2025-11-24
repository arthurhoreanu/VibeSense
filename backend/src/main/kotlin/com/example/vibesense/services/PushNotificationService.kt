package com.example.vibesense.services

import com.example.vibesense.notifications.PushNotificationService
import io.ktor.client.* 
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.serialization.Serializable

@Serializable
data class ExpoPushMessage(
    val to: String,
    val title: String,
    val body: String
)

class ExpoPushNotificationService(private val client: HttpClient) : PushNotificationService {
    private val expoPushUrl = "https://exp.host/--/api/v2/push/send"

    override suspend fun sendNotification(userId: String, title: String, message: String, token: String) {
        val expoMessage = ExpoPushMessage(to = token, title = title, body = message)
        try {
            client.post(expoPushUrl) {
                contentType(ContentType.Application.Json)
                setBody(expoMessage)
            }
            println("Successfully sent push notification to $userId")
        } catch (e: Exception) {
            println("Error sending push notification: ${e.message}")
        }
    }
}