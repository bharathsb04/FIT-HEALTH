# Fit Health Companion — Android Health Connect Bridge

Android companion bridge application written in **Kotlin** and **Jetpack Compose** that connects **Samsung Health** with the **Fit Health Gym Companion Web App** via **Google Health Connect** (`androidx.health.connect:connect-client`).

---

## 🏗️ Architecture

```
┌────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│     Samsung Health     │ ───► │  Android Health Connect  │ ───► │   Fit Health Companion  │
│  (Galaxy Watch / Ring) │      │  (System Health Datastore)│     │   (Kotlin / Compose)    │
└────────────────────────┘      └──────────────────────────┘      └────────────┬────────────┘
                                                                               │
                                                                   HTTPS Batch Ingestion
                                                                   (JWT Auth & Deduplication)
                                                                               ▼
┌────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│   Gym Admin Portal     │ ◄─── │    JSON / Firebase DB    │ ◄─── │    Fit Health Backend   │
│ (Consenting Biometrics)│      │    (AES-256 At Rest)     │      │   (Express REST API)    │
└────────────────────────┘      └──────────────────────────┘      └─────────────────────────┘
```

---

## 📋 13 Supported Biometric Data Types

| Record Type | Health Connect Class | Units | Description |
|---|---|---|---|
| **Steps** | `StepsRecord` | count | Daily step count & goal pacing |
| **Heart Rate** | `HeartRateRecord` | bpm | Live sensor beats per minute & ECG waveform |
| **Resting Heart Rate** | `RestingHeartRateRecord` | bpm | Cardio baseline during rest & sleep |
| **Weight** | `WeightRecord` | kg | Body weight telemetry |
| **Height** | `HeightRecord` | cm | Body height for BMI computation |
| **Body Fat** | `BodyFatRecord` | % | Bioimpedance body fat percentage |
| **Sleep Session** | `SleepSessionRecord` | hours | Restorative sleep duration & quality |
| **Active Calories** | `ActiveCaloriesBurnedRecord` | kcal | Calories burned during exercise |
| **Total Calories** | `TotalCaloriesBurnedRecord` | kcal | Total daily energy expenditure (TDEE) |
| **Distance** | `DistanceRecord` | meters | Distance walked, run, or cycled |
| **Blood Oxygen (SpO2)** | `OxygenSaturationRecord` | % | Peripheral capillary oxygen saturation |
| **Blood Pressure** | `BloodPressureRecord` | mmHg | Systolic & diastolic arterial pressure |
| **Exercise Session** | `ExerciseSessionRecord` | workout | Activity workout tracking sessions |

---

## 🚀 Setup & Build Instructions

### 1. Prerequisites
- **Android Studio** (Hedgehog 2023.1.1 or Ladybug 2024.2+ recommended)
- **JDK 17** (bundled with Android Studio)
- **Android Device or Emulator** running **Android 9.0 (API 28)** or higher.
  - On **Android 14+**, Health Connect is built directly into Android System Settings.
  - On **Android 9 to 13**, install **Health Connect by Google** from the Google Play Store.

### 2. Opening & Building in Android Studio
1. Open Android Studio.
2. Select **Open** and choose the `android-companion` folder.
3. Allow Gradle to sync dependencies (`androidx.health.connect`, `androidx.work`, Room, Retrofit).
4. Run the app on an Android device or emulator with Google Play Services (`Shift + F10`).

### 3. Server URL Configuration
- **Android Emulator**: Uses `http://10.0.2.2:5000` (maps directly to host localhost:5000).
- **Physical Android Phone**: Ensure phone and computer are on the same Wi-Fi network, and enter your computer's local IP (e.g. `http://192.168.1.15:5000`), or your Cloudflare Tunnel URL.

### 4. Member Authentication
- Log in using the same Fit Health credentials as the web application:
  - **Demo Email**: `alex@fithealth.io`
  - **Demo Password**: `password123`
- The app stores the JWT token securely and links all telemetry to that member's ID.

---

## 🧪 Testing with Health Connect Toolbox

If you do not have a physical Galaxy Watch or Samsung device handy, Google provides the **Health Connect Toolbox** to generate test data:

1. Install **Health Connect Toolbox** from the Google Play Store (or GitHub: `android/health-connect-samples`).
2. Open **Health Connect Toolbox** and tap **Insert Data**.
3. Insert sample data for:
   - Steps (e.g. `8,500 steps`)
   - Heart Rate (e.g. `72 bpm`)
   - Blood Pressure (e.g. `118 / 76 mmHg`)
   - Sleep (e.g. `7.5 hours`)
   - Oxygen Saturation (e.g. `98.5%`)
4. Open **Fit Health Companion** and tap **"Sync Now to Fit Health Web App"**.
5. Refresh the **Fit Health Web App** (`http://localhost:3000` or `http://localhost:5000`) under **Vitals & Biometrics** to view live cards and charts!

