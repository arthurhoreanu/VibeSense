package com.example.vibesense.services

import com.example.vibesense.notifications.UserNotificationRepository
import com.example.vibesense.notifications.UserNotificationState

class InMemoryUserNotificationRepository : UserNotificationRepository {
    private val userStates = mutableMapOf<String, UserNotificationState>()

    override fun getNotificationState(userId: String): UserNotificationState? {
        return userStates[userId]
    }

    override fun saveNotificationState(state: UserNotificationState) {
        userStates[state.userId] = state
    }
}