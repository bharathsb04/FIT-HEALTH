# Fit Health — The Ultimate Gym Fitness Companion for the Health Conscious

> **BCA Final Project Submission**  
> A complete, production-ready, full-stack mobile application that unifies gym discovery, 6-day split workout planning, nutrition tracking, vitals monitoring, bulking & cutting targets, supplement guidance, hydration tracking, sleep/recovery analysis, and wearable synchronization into one coherent platform.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Project Folder Structure](#project-folder-structure)
5. [Database Schema & Data Model](#database-schema--data-model)
6. [Complete REST API Documentation](#complete-rest-api-documentation)
7. [Installation & Setup Instructions](#installation--setup-instructions)
8. [Environment Variables](#environment-variables)
9. [Pre-Seeded Sample Test Data](#pre-seeded-sample-test-data)
10. [Step-by-Step Testing & Evaluation Rubric](#step-by-step-testing--evaluation-rubric)
11. [AI-Ready Architecture & Future Roadmap](#ai-ready-architecture--future-roadmap)
12. [Security & Error Handling Implementation](#security--error-handling-implementation)

---

## 1. Project Overview

Modern fitness enthusiasts are burdened by the need to navigate between multiple disjointed applications: Google Maps for gym discovery, MyFitnessPal for calories, Strong/Hevy for workouts, Apple Health/Fitbit for vitals, and notes for supplements and recovery.

**Fit Health** eliminates this friction by providing a unified, health-conscious companion designed with a modern, minimal, natural, and professional mobile interface.

### Core Modules:
- **Authentication & Onboarding**: Complete JWT auth, onboarding questionnaire calculating BMR, TDEE, and personalized macros.
- **Main Dashboard**: Real-time calorie & macro budget rings, today's workout preview, daily readiness score, steps, live heart rate, sleep duration, streak indicator.
- **GPS Gym Locator**: GPS proximity sorting (Haversine formula), filterable list & interactive map view, detailed amenities, peak hours, and instant digital day-pass booking.
- **6-Day Split Workout Planner**: Push-Pull-Legs and Arnold-split style 6-day cycle for Bulking, Cutting, Maintenance, and General Fitness. Live workout timer, set/rep/weight logging, skip exercise, add custom exercise, and volume tracking with celebratory confetti.
- **Nutrition Tracker**: Daily calorie/macro target rings (Protein, Carbs, Fats, Fiber), searchable 50+ item food database, meal categorization (Breakfast, Lunch, Dinner, Snacks), and instant manual logging.
- **Bulking & Cutting Management**: Phase-based surplus (+400 kcal) or deficit (-500 kcal) protocols, Target vs. Actual comparisons, weekly weight changes, and mandatory health disclaimers.
- **Vitals Monitoring & Wearable Sync**: Live heart rate waveform simulation, Google Fit and Apple Health cloud sync simulation with realistic connection states, cardio zone distribution, and 7-day vitals trends.
- **Supplement Guide**: Evidence-based dossiers on Whey Protein, Creatine Monohydrate, BCAAs, Omega-3 Fish Oil, Electrolytes, and Multivitamins (purpose, dosage, timing, considerations, and safety disclaimers).
- **Hydration Tracker**: 3.5L daily target, animated hydration ring, quick-add buttons (+250ml, +500ml, +750ml, +1L), daily timestamped drink logs, and friendly reminders.
- **Sleep & Recovery**: CNS recovery readiness gauge, 7-day sleep duration chart, 90-minute sleep cycle bedtime calculator, and guided stretching routines with an interactive countdown timer.
- **Progress Tracking**: Personal records (PRs) trophy showcase (Bench, Squat, Deadlift), body measurements (Chest, Arms, Waist, Thighs), and historical SVG bodyweight trend graph.
- **User Profile & Settings**: Biometrics configuration, goal switcher, metric/imperial units, dark/light theme toggle, and account session management.
- **Fit Health AI Coach**: Natural-language fitness advisor answering contextual questions ("Why am I feeling tired today?", "Give me a high-protein dinner", "Am I eating enough protein?", etc.).

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Architecture**: Component-based modular architecture, React Context API (`AuthContext`, `ThemeContext`, `FitnessContext`)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, Responsive Mobile Viewport + Interactive Desktop Mobile Simulator Frame (notch, dynamic island, clock, status bar)
- **Icons**: Lucide React
- **Maps**: Leaflet & GPS Geolocation
- **Animations / Visuals**: Pure SVG Macro Rings, ECG waveform, Canvas Confetti

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Architecture**: Modular Controller-Service-Route structure with centralized error handling and input validation
- **Security**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS middleware

### Database (Dual-Engine Mode)
- **Primary / Production**: MongoDB via Mongoose Schemas (`models/`)
- **Zero-Config Resilient Fallback**: Built-in Persistent JSON Storage Engine (`backend/data/dbStorage.js`). Automatically activates if local MongoDB is not running, ensuring 100% operational guarantee during evaluation with zero setup friction!

---

## 3. System Architecture

```
                                  [ Mobile Browser / Client ]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
             [ React + Vite Client ]                        [ Mobile Frame Shell ]
         (Tabs: Home, Workout, Nutrition,               (Dynamic Island, Status Bar,
              Gyms, Vitals, AI Coach)                       Dark/Light Toggle)
                        │
                        │ HTTP / JSON (REST API) with JWT Bearer Auth
                        ▼
             [ Express API Gateway ] (Port 5000)
            ├── authMiddleware (JWT Verification)
            ├── errorMiddleware (Centralized Error Handler)
            └── Route Controllers
                   ├── authController.js
                   ├── userController.js
                   ├── gymController.js
                   ├── workoutController.js
                   ├── nutritionController.js
                   ├── vitalsController.js
                   ├── hydrationController.js
                   ├── progressController.js
                   ├── recoveryController.js
                   └── aiController.js
                        │
                        ├──────────────────────────┐
                        ▼                          ▼
              [ MongoDB (Mongoose) ]      [ Persistent JSON Engine ]
              (When MONGODB_URI active)   (Instant zero-config fallback)
```

---

## 4. Project Folder Structure

```
BCA FINAL PROJECT/
├── backend/
│   ├── config/
│   │   └── db.js                    # Dual-mode database connector
│   ├── controllers/
│   │   ├── authController.js        # Register, login, forgot password, BMR calculations
│   │   ├── userController.js        # Profile management & biometric recomputation
│   │   ├── gymController.js         # Proximity search, filters, day pass booking
│   │   ├── workoutController.js     # 6-day split runner, custom exercises, history
│   │   ├── nutritionController.js   # Meals, macro budgets, food search
│   │   ├── vitalsController.js      # Heart rate, cardio zones, Google Fit sync
│   │   ├── hydrationController.js   # Water logs, quick-add presets, reminders
│   │   ├── progressController.js    # Weight graph, PRs, body measurements
│   │   ├── supplementController.js  # Supplement dossiers & safety notices
│   │   ├── recoveryController.js    # Readiness score, sleep calculator, stretches
│   │   └── aiController.js          # Fit Health AI contextual fitness coach
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT header validation & session decoding
│   │   └── errorMiddleware.js       # Centralized 404 & 500 handlers
│   ├── models/                      # Official Mongoose Schema definitions
│   │   ├── User.js
│   │   ├── Gym.js
│   │   ├── WorkoutPlan.js
│   │   ├── DietPlan.js
│   │   ├── VitalsLog.js
│   │   ├── Supplement.js
│   │   └── Progress.js
│   ├── data/
│   │   ├── seedData.js              # Rich initial seed data (gyms, foods, workouts)
│   │   └── dbStorage.js             # High-performance persistent JSON DB engine
│   ├── .env.example                 # Environment template
│   ├── .env                         # Active environment variables
│   ├── package.json                 # Backend dependencies & scripts
│   └── server.js                    # Express app entry point
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg              # Fit Health vector logo
│   │   └── manifest.json            # PWA mobile manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeviceFrame.jsx      # Mobile smartphone frame & view switcher
│   │   │   ├── BottomNav.jsx        # 5-tab fixed bottom navigation
│   │   │   ├── Header.jsx           # App header with greeting, streak & profile
│   │   │   ├── MacroRing.jsx        # Animated SVG circular progress rings
│   │   │   └── Toast.jsx            # Animated feedback notifications
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # Authentication & user state
│   │   │   ├── ThemeContext.jsx     # Dark/light theme & fullscreen toggle
│   │   │   └── FitnessContext.jsx   # Global navigation & reactive refresh triggers
│   │   ├── pages/
│   │   │   ├── SplashPage.jsx       # Brand introduction & quick login
│   │   │   ├── OnboardingPage.jsx   # 4-step fitness questionnaire
│   │   │   ├── LoginPage.jsx        # Sign in with 1-click Demo auto-fill
│   │   │   ├── ForgotPasswordPage.jsx # Password recovery
│   │   │   ├── DashboardPage.jsx    # Main health & fitness overview
│   │   │   ├── GymLocatorPage.jsx   # GPS gym discovery & day pass booking
│   │   │   ├── WorkoutPlannerPage.jsx # 6-day split runner & set logger
│   │   │   ├── NutritionTrackerPage.jsx # Food search, meal categories & macros
│   │   │   ├── BulkingCuttingPage.jsx # Phase management & Target vs Actual
│   │   │   ├── VitalsPage.jsx       # Heart rate, wearable sync & cardio zones
│   │   │   ├── SupplementGuidePage.jsx # Supplement guide & dosages
│   │   │   ├── HydrationPage.jsx    # Water intake ring & quick-add buttons
│   │   │   ├── SleepRecoveryPage.jsx # Sleep cycles, readiness score & stretches
│   │   │   ├── ProgressPage.jsx     # Weight SVG chart, PRs & measurements
│   │   │   ├── ProfilePage.jsx      # Profile biometrics, theme & settings
│   │   │   └── AIAssistantPage.jsx  # Fit Health AI conversational coach
│   │   ├── services/
│   │   │   └── api.js               # Centralized REST API client
│   │   ├── index.css                # CSS tokens, glassmorphism & responsive layout
│   │   ├── App.jsx                  # Main view router
│   │   └── main.jsx                 # React root DOM mount
│   ├── index.html                   # HTML entry point with fonts & meta tags
│   ├── vite.config.js               # Vite config with API proxy
│   └── package.json                 # Frontend dependencies
│
├── package.json                     # Root orchestration package
├── run.bat                          # 1-Click Windows Batch startup
├── start.ps1                        # 1-Click PowerShell startup
└── README.md                        # Comprehensive project report & guide
```

---

## 5. Database Schema & Data Model

The application models 7 core document structures with strict relationship integrity:

```
[ USER ] ──(1:1)──> [ WORKOUT_PLAN ] ──(1:N)──> [ Exercises & History ]
   │
   ├──(1:N)───────> [ DIET_PLAN ]    ──(1:N)──> [ Meals (Breakfast, Lunch, Dinner, Snacks) ]
   ├──(1:N)───────> [ VITALS_LOG ]   ──(1:1)──> [ Cardio Zones & Wearable Status ]
   ├──(1:N)───────> [ HYDRATION_LOG ]──(1:N)──> [ Timestamped Drink Logs ]
   ├──(1:N)───────> [ PROGRESS ]     ──(1:1)──> [ Measurements & Personal Records (PRs) ]
   └──(1:N)───────> [ DAY_PASS_BOOKINGS ] ────> [ GYM Record Reference ]
```

### Schema Summary Table:
| Collection / Model | Primary Fields | Relationships |
| :--- | :--- | :--- |
| **USER** | `id`, `name`, `email`, `password`, `age`, `gender`, `height`, `weight`, `targetWeight`, `fitnessLevel`, `primaryGoal`, `activityLevel`, `targetCalories`, `targetProtein`, `targetCarbs`, `targetFat`, `waterTargetLiters`, `sleepTargetHours`, `streak` | Root parent entity |
| **GYM** | `id`, `name`, `address`, `latitude`, `longitude`, `rating`, `reviewsCount`, `openingHours`, `equipment[]`, `vibe`, `crowdLevel`, `peakHours`, `facilities[]`, `dayPassPrice`, `currency`, `image` | Linked via DayPassBookings |
| **WORKOUT_PLAN** | `id`, `userId`, `goal`, `splitName`, `activeDayIndex`, `days[{dayNumber, dayName, focus, exercises[]}]`, `history[{date, dayName, durationMinutes, exercisesCompleted, totalVolumeKg}]` | Owned by `userId` |
| **DIET_PLAN** | `id`, `userId`, `date`, `meals[{id, category, name, calories, protein, carbs, fat, fiber, loggedAt}]` | Owned by `userId`, keyed by `date` |
| **VITALS_LOG** | `id`, `userId`, `date`, `heartRateBpm`, `restingHeartRate`, `maxHeartRate`, `steps`, `stepGoal`, `activeCaloriesBurned`, `sleepHours`, `recoveryScore`, `syncSource`, `isWearableConnected`, `cardioZones` | Owned by `userId` |
| **SUPPLEMENT** | `id`, `name`, `category`, `tagline`, `purpose`, `commonUsage`, `timing`, `considerations`, `safetyDisclaimer` | Global reference catalog |
| **PROGRESS** | `id`, `userId`, `date`, `weightKg`, `chestCm`, `armsCm`, `waistCm`, `thighsCm`, `benchPressKg`, `squatKg`, `deadliftKg`, `notes` | Owned by `userId` |

---

## 6. Complete REST API Documentation

All routes under `/api/...` validate JWT authentication via `Authorization: Bearer <token>` (except public auth and gym discovery).

### 6.1 Authentication (`/api/auth`)
- `POST /api/auth/register` — Create user account with onboarding biometrics and initialize customized 6-day split.
- `POST /api/auth/login` — Authenticate user and issue 30-day JWT token.
- `POST /api/auth/logout` — Invalidate user session.
- `POST /api/auth/forgot-password` — Generate secure password recovery token.
- `POST /api/auth/reset-password` — Update user password with recovery verification.

### 6.2 Users (`/api/users`)
- `GET /api/users/profile` — Retrieve current user biometrics, targets, and settings.
- `PUT /api/users/profile` — Update biometrics, goal, or settings (automatically recomputes BMR, TDEE, calories, and macros).

### 6.3 Gyms (`/api/gyms`)
- `GET /api/gyms` — List all verified gyms (supports `?search=`, `?vibe=`, `?crowdLevel=`, `?maxPrice=`).
- `GET /api/gyms/nearby` — GPS radius search (requires `?lat=` & `?lng=`, calculates Haversine distance in km).
- `GET /api/gyms/:id` — Retrieve full gym profile, equipment list, and photos.
- `POST /api/gyms/:id/book-pass` — Instant day pass booking with digital access voucher code generation.

### 6.4 Workout (`/api/workouts`)
- `GET /api/workouts` — Retrieve user's active 6-day split plan and historical sessions.
- `POST /api/workouts` — Add custom exercise to a specific split day.
- `PUT /api/workouts/:id` — Update exercise sets, reps, weight, or completion status.
- `DELETE /api/workouts/:id` — Remove an exercise from routine.
- `POST /api/workouts/complete` — Finish session, increment workout streak, and compute total volume lifted.
- `POST /api/workouts/reset-split` — Switch split plan (Bulking, Cutting, Maintenance).

### 6.5 Nutrition (`/api/nutrition`)
- `GET /api/nutrition` — Daily nutrition summary with consumed totals, targets, macro percentages, and categorized meals.
- `POST /api/nutrition/meal` — Log a meal (Breakfast, Lunch, Dinner, Snacks) with calories, protein, carbs, fat, fiber.
- `PUT /api/nutrition/meal/:id` — Edit an existing meal entry.
- `DELETE /api/nutrition/meal/:id` — Remove a meal entry.
- `GET /api/nutrition/foods/search` — Search 50+ item food nutrition database.

### 6.6 Vitals (`/api/vitals`)
- `GET /api/vitals` — Retrieve current vitals (heart rate BPM, resting HR, steps, active calories, sleep, cardio zones).
- `POST /api/vitals` — Record manual biometric readings.
- `POST /api/vitals/sync-wearable` — Connect/disconnect & synchronize with Google Fit or Apple Health.

### 6.7 Hydration (`/api/hydration`)
- `GET /api/hydration` — Daily water intake, remaining liters, progress percentage, and timestamped drink logs.
- `POST /api/hydration` — Add water (+250ml, +500ml, +750ml, +1L, custom) or reset daily log.

### 6.8 Progress (`/api/progress`)
- `GET /api/progress` — Bodyweight trend array, PRs (bench, squat, deadlift), and body measurements.
- `POST /api/progress` — Record new weight, measurements, or PRs.

### 6.9 Supplements (`/api/supplements`)
- `GET /api/supplements` — Retrieve full evidence-based supplement guide with dosage, timing, and disclaimers.

### 6.10 Recovery (`/api/recovery`)
- `GET /api/recovery` — Recovery readiness score (0-100), 7-day sleep duration chart, 90-min sleep cycle calculator, and stretching library.
- `POST /api/recovery/stretching-complete` — Toggle stretch completion status.

### 6.11 Fit Health AI Advisor (`/api/ai`)
- `POST /api/ai/assistant` — Contextual fitness coach answering natural language questions with safety notices.

---

## 7. Installation & Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm (version 9 or higher)
- Optional: MongoDB Community Server (if running local MongoDB; otherwise the persistent JSON storage engine runs automatically).

### Option A: 1-Click Launch (Recommended for Windows)
Double-click `run.bat` in the root directory.  
This automatically starts:
1. Backend REST API on `http://localhost:5000`
2. Frontend Mobile Client on `http://localhost:3000` (Local) and `http://192.168.31.69:3000` (Mobile Network)

*(Or execute `./start.ps1` in PowerShell).*

---

### Platform-Specific Launching Guide:

#### 1. Running on Windows Platform (Native Desktop Experience):
- **Standalone Windows Desktop Window**: Double-click `FitHealth-Windows.bat` (or run `npm run windows`).
  - Launches Fit Health as a dedicated standalone Windows desktop application window (size 440x920, frameless/app-mode, pinned to taskbar) with native performance and no browser address bar!
- **Electron Desktop**: Run `npm run electron` to launch via Electron.
- **Web Browser**: Navigate to `http://localhost:3000/` in Chrome or Edge.

#### 2. Running on Mobile Platform (Android & iOS):
- **Over Local Wi-Fi (Instant Phone Access)**:
  1. Ensure your smartphone is connected to the same Wi-Fi network as this PC.
  2. Open Chrome (on Android) or Safari (on iPhone) and navigate to:
     ```
     http://192.168.31.69:3000/
     ```
- **Install as a Native Full-Screen Mobile App (PWA)**:
  - **Android (Chrome)**: Tap the menu (three dots) -> tap **"Install App"** or **"Add to Home Screen"**.
  - **iPhone (Safari)**: Tap the Share button `[^]` -> tap **"Add to Home Screen"**.
  - Fit Health will install with its custom app icon directly onto your phone's home screen and open in true full-screen mobile mode without any browser URL bar!
- **Native Android Studio Project (Capacitor)**:
  - Run `npx cap sync` to sync web assets to the native Android folder.
  - Run `npx cap open android` to open in Android Studio and generate an APK.

---

### Option B: Manual Terminal Execution

#### 1. Start the Backend API
```powershell
cd backend
npm.cmd install
npm.cmd start
```
*Backend server will start on `http://localhost:5000`.*

#### 2. Start the Frontend Mobile Client (in a separate terminal)
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
*Frontend will launch at `http://localhost:3000` (Local) and `http://192.168.31.69:3000` (Mobile Network).*

---

## 8. Environment Variables

The backend uses a `.env` configuration file in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=fit_health_secret_jwt_bca_2026_key

# Optional: MongoDB URI (falls back automatically to persistent JSON engine if not running)
ENABLE_MONGODB=false
MONGODB_URI=mongodb://127.0.0.1:27017/fit_health_db
```

---

## 9. Pre-Seeded Sample Test Data

The system includes pre-seeded demo data for evaluation:

### Pre-Configured Demo Account:
- **Email**: `alex@fithealth.io`
- **Password**: `password123`
- **Profile**: Alex Mercer, 24 years old, Male, 178 cm, 78.5 kg
- **Active Goal**: Bulking Mode (2,850 kcal target, 165g Protein)
- **Streak**: 14-day unbroken consistency
- **Pre-Seeded Data**: Active 6-day split, today's logged meals (Oatmeal, Grilled chicken, Greek yogurt), hydration logs, and synced vitals.

*(You can also click the **"Auto-Fill"** button on the Login page to populate these credentials in 1 click).*

---

## 10. Step-by-Step Testing & Evaluation Rubric

Follow this quick guide to test all 14 core modules:

1. **Authentication & Splash Screen**:
   - Open `http://localhost:3000/`.
   - View the splash screen with health pulse branding.
   - Click *"I already have an account"* to access the Login page.
   - Click the green **"Auto-Fill"** button, then click **"Sign In to Fit Health"**.
2. **Main Dashboard**:
   - Observe the personalized greeting: *"Good morning, Alex"*.
   - Inspect the 4 animated macro rings (Calories, Protein, Carbs, Fats).
   - Click the **"+250ml"** button on the Hydration card to verify real-time fluid increment.
   - Verify Today's Workout preview card (*Day 1 — Chest + Triceps*).
3. **Workout Planner**:
   - Click the **"Workout"** tab in the bottom navigation.
   - Switch between split days (Day 1 through Day 7) in the top carousel.
   - Check off an exercise set checkbox to observe the completion strike-through.
   - Click **"Start Workout"** to launch the live session stopwatch timer.
   - Click **"Finish & Log"** to complete the workout and see celebratory confetti!
4. **Nutrition Tracker**:
   - Click the **"Nutrition"** tab in the bottom navigation.
   - Click **"Add"** under Breakfast or Lunch.
   - Type *"Chicken"* or *"Eggs"* in the search input to observe instant database suggestions.
   - Select an item or manually log a custom meal and see the macro totals update.
5. **GPS Gym Locator**:
   - Click the **"Gyms"** tab in the bottom navigation.
   - Toggle between **"List View"** and **"Interactive Map"**.
   - Test filter chips by selecting different vibes (*"Bodybuilding"*, *"Modern"*).
   - Click **"Day Pass ($15)"** on any gym to open the instant booking modal and generate an access voucher code.
   - Click **"Directions"** to verify the Google Maps navigation link.
6. **Vitals Monitoring**:
   - Click the **"Vitals"** tab in the bottom navigation.
   - Observe the live simulated heart rate BPM and animated ECG waveform.
   - Click **"+ Google Fit"** to simulate wearable cloud synchronization.
   - Observe the updated step count, resting heart rate, and cardio zone distribution.
7. **Bulking & Cutting Phase Hub**:
   - Tap the **"Bulking & Cutting"** pill on the Dashboard or in Profile.
   - Switch between *Bulking* and *Cutting* modes to view dynamic caloric recalculations and the Target vs. Actual table.
8. **Hydration Tracker**:
   - Tap the **"Hydration"** quick pill to inspect the large fluid gauge, quick-add presets (+250ml, +500ml, +750ml, +1L), and drink history.
9. **Sleep & Recovery**:
   - Tap the **"Sleep & Recovery"** quick pill.
   - Review the readiness score gauge, 7-day sleep history, and the 90-minute sleep cycle calculator.
   - Scroll down to the Stretching Guide and tap **"Timer"** to start the interactive 45-second countdown timer.
10. **Progress & PRs**:
    - Tap the **"Weight & PRs"** quick pill.
    - View the interactive SVG weight trend curve, Personal Records trophy cards, and body circumference stats.
11. **Fit Health AI Coach**:
    - Tap the **"AI Coach"** button in the top simulator bar or floating header.
    - Click prompt chips such as *"Why am I feeling tired today?"* or *"Am I eating enough protein?"* to receive context-aware coaching responses.
12. **Appearance & Device Simulator**:
    - Click the **"Light / Dark"** button in the top simulator toolbar to toggle theme modes.
    - Click **"Full Screen"** to toggle between the mobile smartphone simulator frame and full responsive desktop mode.

---

## 11. AI-Ready Architecture & Future Roadmap

The codebase includes an AI-ready layer in `backend/controllers/aiController.js` and `frontend/src/pages/AIAssistantPage.jsx`.

### Future Capabilities Prepared:
- **Vision Form Analysis**: Architecture ready for camera streaming to detect lumbar rounding during deadlifts or knee valgus on barbell squats.
- **Dynamic Deload Engine**: Automated adjustments to workout volume when wearable sleep and heart-rate variability (HRV) metrics fall below 60%.
- **Smart Gym IoT Integration**: Automated weight sensor capture directly from connected smart gym pin-loaded stacks.

---

## 12. Security & Error Handling Implementation

- **Password Hashing**: Salted BCrypt (10 rounds) ensures passwords are never stored in plain text.
- **JWT Authorization**: Token-based authorization with Bearer token authentication header checks.
- **Zero Raw Errors**: Centralized error middleware intercepts all unhandled rejections and outputs sanitized user-friendly JSON messages.
- **Input Validation**: Strict type-checking on biometric numerical inputs (weight, height, age, calories).
- **Network Resilience**: Full offline-friendly fallback handling if remote GPS or wearable connections are unavailable.

---

**Developed for BCA Final Project Examination**  
*Fit Health — The Ultimate Gym Fitness Companion for the Health Conscious*
