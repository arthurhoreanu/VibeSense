package com.example.vibesense.api.config

import java.io.File
import java.io.FileInputStream
import java.util.Properties

object ConfigLoader {
    private val properties = Properties()

    init {
        val propertiesFile = File("backend/local.properties")
        if (propertiesFile.exists()) {
            try {
                FileInputStream(propertiesFile).use { properties.load(it) }
            } catch (e: Exception) {
                println("ERROR: Could not load properties from backend/local.properties: ${e.message}")
            }
        } else {
            println("WARNING: backend/local.properties file not found. The app will likely fail without it.")
        }
    }

    fun getProperty(key: String): String {
        return properties.getProperty(key) ?: throw IllegalStateException("'$key' not found in backend/local.properties. Please ensure the file exists and contains this key.")
    }
}
