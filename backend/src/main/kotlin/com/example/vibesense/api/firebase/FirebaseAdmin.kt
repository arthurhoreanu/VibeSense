package com.example.vibesense.api.firebase

import com.example.vibesense.api.config.ConfigLoader
import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import java.io.File
import java.io.FileInputStream

object FirebaseAdmin {
    fun initialize() {
        try {
            if (FirebaseApp.getApps().isNotEmpty()) {
                println("Firebase Admin SDK is already initialized.")
                return
            }

            // 1. Determine path to JSON
            // Try local.properties first, then default to "backend/vibesense-firebase-adminsdk.json"
            var credentialsPath = try {
                ConfigLoader.getProperty("FIREBASE_CREDENTIALS_PATH")
            } catch (e: Exception) {
                "backend/vibesense-firebase-adminsdk.json"
            }

            var file = File(credentialsPath)

            // 2. Path Fallback Logic (Handle running from Root vs running from Backend folder)
            if (!file.exists()) {
                println("WARN: JSON not found at '$credentialsPath'. Trying alternatives...")
                
                // If path started with backend/, try without it (maybe we are IN the backend folder)
                if (credentialsPath.startsWith("backend/")) {
                    val altPath = credentialsPath.removePrefix("backend/")
                    val altFile = File(altPath)
                    if (altFile.exists()) {
                        file = altFile
                        credentialsPath = altPath
                    }
                } 
                // If path didn't have backend/, try adding it (maybe we are in ROOT)
                else {
                    val altPath = "backend/$credentialsPath"
                    val altFile = File(altPath)
                    if (altFile.exists()) {
                        file = altFile
                        credentialsPath = altPath
                    }
                }
            }

            // 3. CRITICAL CHECK
            if (!file.exists()) {
                val cwd = System.getProperty("user.dir")
                throw RuntimeException(
                    """
                    CRITICAL ERROR: Could not find Firebase Service Account JSON!
                    -------------------------------------------------------------
                    Current Working Directory: $cwd
                    Looking for file at:       ${file.absolutePath}
                    
                    ACTION REQUIRED:
                    1. Download 'vibesense-firebase-adminsdk.json' from Firebase Console.
                    2. Place it in the 'backend' folder of your project.
                    3. Ensure the name matches exactly.
                    -------------------------------------------------------------
                    """.trimIndent()
                )
            }

            println("FirebaseAdmin: Found credentials file at: ${file.absolutePath}")

            // 4. Initialize
            val serviceAccount = FileInputStream(file)
            
            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setProjectId("vibesense-b12ba") // Explicitly set Project ID just in case
                .build()

            FirebaseApp.initializeApp(options)
            println("Firebase Admin SDK initialized successfully!")

        } catch (e: Exception) {
            // Re-throw to crash the app so you can't miss it
            throw RuntimeException("Failed to initialize Firebase: ${e.message}", e)
        }
    }
}
