package com.example.vibesense.services

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

class FirebaseUserRepository : UserRepository {
    override fun getUsername(userId: String): String? {
        return try {
            val userRecord = FirebaseAuth.getInstance().getUser(userId)
            userRecord.displayName ?: userRecord.email?.split("@")?.firstOrNull()
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun getPushToken(userId: String): String? = suspendCoroutine { continuation ->
        val db = FirebaseDatabase.getInstance()
        val ref = db.getReference("user_tokens").child(userId)
        ref.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val token = snapshot.getValue(String::class.java)
                continuation.resume(token)
            }

            override fun onCancelled(databaseError: DatabaseError) {
                continuation.resume(null)
            }
        })
    }

    override fun savePushToken(userId: String, token: String) {
        val db = FirebaseDatabase.getInstance()
        val ref = db.getReference("user_tokens")
        ref.child(userId).setValueAsync(token)
    }
}
