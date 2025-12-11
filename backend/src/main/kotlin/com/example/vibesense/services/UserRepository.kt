package com.example.vibesense.services

interface UserRepository {
    fun getUsername(userId: String): String?
}