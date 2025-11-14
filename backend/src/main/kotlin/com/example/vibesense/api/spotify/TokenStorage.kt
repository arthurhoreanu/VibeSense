package com.example.vibesense.api.spotify

/**
 * WARNING: This is a temporary, in-memory storage for demonstration purposes only.
 * In a real-world application, you MUST use a persistent and secure database
 * (e.g., PostgreSQL, MongoDB, Firebase Firestore) to store user tokens.
 */
object TokenStorage {
    private val userTokens = mutableMapOf<String, Pair<String, String>>()

    fun saveTokens(uid: String, accessToken: String, refreshToken: String) {
        userTokens[uid] = Pair(accessToken, refreshToken)
        println("Tokens saved for user $uid")
    }

    fun getAccessToken(uid: String): String? {
        return userTokens[uid]?.first
    }

    fun getRefreshToken(uid: String): String? {
        return userTokens[uid]?.second
    }
}
