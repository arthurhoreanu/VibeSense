package com.example.vibesense.api.spotify

import com.example.vibesense.api.config.ConfigLoader

object SpotifyConfig {
    val CLIENT_ID: String = ConfigLoader.getProperty("spotify.clientId")
    val CLIENT_SECRET: String = ConfigLoader.getProperty("spotify.clientSecret")
    val REDIRECT_URI: String = ConfigLoader.getProperty("spotify.redirectUri")
}
