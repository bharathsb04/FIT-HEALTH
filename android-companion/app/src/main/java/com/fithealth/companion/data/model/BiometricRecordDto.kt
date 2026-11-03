package com.fithealth.companion.data.model

import com.google.gson.annotations.SerializedName

/**
 * BiometricRecordDto
 * Universal JSON schema matching Fit Health backend ingestion endpoint: POST /api/biometrics/sync
 */
data class BiometricRecordDto(
    @SerializedName("recordId")
    val recordId: String,

    @SerializedName("type")
    val type: String, // steps, heart_rate, resting_heart_rate, weight, height, body_fat, sleep, active_calories, total_calories, distance, oxygen_saturation, blood_pressure, exercise

    @SerializedName("value")
    val value: Any, // Number (Double/Long) or Object (e.g. { systolic: 120, diastolic: 80 })

    @SerializedName("unit")
    val unit: String,

    @SerializedName("startTime")
    val startTime: String, // ISO 8601

    @SerializedName("endTime")
    val endTime: String, // ISO 8601

    @SerializedName("sourceApp")
    val sourceApp: String = "Samsung Health (Health Connect)"
)

