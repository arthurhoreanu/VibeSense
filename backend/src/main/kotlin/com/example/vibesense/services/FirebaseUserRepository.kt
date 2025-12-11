package com.example.vibesense.services

import com.google.firebase.auth.FirebaseAuth

class FirebaseUserRepository : UserRepository {
    override fun getUsername(userId: String): String? {
        return try {
            val userRecord = FirebaseAuth.getInstance().getUser(userId)
            userRecord.displayName ?: userRecord.email?.split("@")?.firstOrNull()
        } catch (e: Exception) {
            null
        }
    }
}
