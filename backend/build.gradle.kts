plugins {
    kotlin("jvm") version "2.0.21"
    application
    kotlin("plugin.serialization") version "2.0.21"
}

application {
    mainClass.set("com.example.vibesense.api.ServerKt")
}

//repositories {
//    mavenCentral()
//}

dependencies {
    // Ktor Server & Client
    val ktorVersion = "2.3.12"
    implementation("io.ktor:ktor-server-core-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-netty-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:$ktorVersion")
    implementation("io.ktor:ktor-client-cio-jvm:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation-jvm:$ktorVersion")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.4.14")
}