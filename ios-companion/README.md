# Fit Health Sync — Apple Health (HealthKit) iOS Companion App

Native **Swift / SwiftUI** companion application that reads telemetry from **Apple Health (HealthKit)** and synchronizes live health data with the **Fit Health Web App** via `POST /api/biometrics/sync`.

---

## 🏗️ Architecture

```
┌────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│      Apple Watch       │ ───► │     Apple HealthKit      │ ───► │     Fit Health Sync     │
│   (Heart Rate / Rings) │      │   (iOS Health Framework) │      │     (Swift / SwiftUI)   │
└────────────────────────┘      └──────────────────────────┘      └────────────┬────────────┘
                                                                               │
                                                                   HTTPS Batch Ingestion
                                                                   (JWT Auth & Deduplication)
                                                                               ▼
┌────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│   Fit Health Web App   │ ◄─── │    JSON / Firebase DB    │ ◄─── │   Fit Health Backend    │
│  (Multi-App Dashboard) │      │    (AES-256 At Rest)     │      │   (Express REST API)    │
└────────────────────────┘      └──────────────────────────┘      └─────────────────────────┘
```

---

## 📋 Supported HealthKit Data Types

- **Steps**: `HKQuantityTypeIdentifier.stepCount`
- **Heart Rate**: `HKQuantityTypeIdentifier.heartRate`
- **Resting Heart Rate**: `HKQuantityTypeIdentifier.restingHeartRate`
- **Active Energy Burned**: `HKQuantityTypeIdentifier.activeEnergyBurned`
- **Distance**: `HKQuantityTypeIdentifier.distanceWalkingRunning`
- **Body Mass**: `HKQuantityTypeIdentifier.bodyMass`
- **Body Fat Percentage**: `HKQuantityTypeIdentifier.bodyFatPercentage`
- **Oxygen Saturation (SpO2)**: `HKQuantityTypeIdentifier.oxygenSaturation`
- **Blood Pressure**: `HKCorrelationTypeIdentifier.bloodPressure`
- **Sleep Analysis**: `HKCategoryTypeIdentifier.sleepAnalysis`
- **VO2 Max**: `HKQuantityTypeIdentifier.vo2Max`
- **Workouts**: `HKWorkoutType.workoutType()`

---

## 🚀 Setup & Build Instructions (Xcode)

1. Open **Xcode** (15+ recommended) on macOS.
2. Select **Create New Project** → **App** (Swift / SwiftUI) named `FitHealthSync`.
3. Add the files from `ios-companion/FitHealthSync/`.
4. Go to **Signing & Capabilities** → **+ Capability** → Add **HealthKit**.
5. In `Info.plist`, ensure `NSHealthShareUsageDescription` is present (already configured in file).
6. Build and run on a physical iPhone or simulator with iOS 16+.
7. Sign in using your Fit Health account (`alex@fithealth.io` / `password123`) and enter your server IP (e.g. `http://192.168.1.15:5000`).
8. Tap **"Allow HealthKit Permissions"** and tap **"Sync Now"** to stream your Apple Watch data to the web app.

