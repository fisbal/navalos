plugins {
    id("com.android.application")
}

val buildNumber = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "com.martinb.navalos"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.martinb.navalos"
        minSdk = 24
        targetSdk = 34
        // 1.1.N: the site shows "new app version" only to the old 1.0 app.
        versionCode = 100 + buildNumber
        versionName = "1.1.$buildNumber"
    }

    // Release key: the workflow decodes the NAVALOS_KEYSTORE_B64 secret into navalos.jks and passes the
    // password as an env var, so every new APK installs over the previous one. Never commit the key or its password.
    val keystore = file("navalos.jks")
    signingConfigs {
        create("release") {
            storeFile = keystore
            storePassword = System.getenv("NAVALOS_KEYSTORE_PASSWORD")
            keyAlias = "navalos"
            keyPassword = System.getenv("NAVALOS_KEYSTORE_PASSWORD")
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            // Pull requests build without the secret: they get the debug key and are never published.
            signingConfig = signingConfigs.getByName(if (keystore.exists()) "release" else "debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }
}
