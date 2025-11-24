package com.example.vibesense.services

interface UserRepository {
    fun getUsername(userId: String): String?
    suspend fun getPushToken(userId: String): String?
    fun savePushToken(userId: String, token: String)
}