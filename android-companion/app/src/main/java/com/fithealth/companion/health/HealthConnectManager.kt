package com.fithealth.companion.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ChangesTokenRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.fithealth.companion.data.model.BiometricRecordDto
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.reflect.KClass

class HealthConnectManager(private val context: Context) {

    val healthConnectClient: HealthConnectClient? by lazy {
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(context)
        } else {
            null
        }
    }

    // Set of 13 record types required for Fit Health
    val recordTypes: Set<KClass<out Record>> = setOf(
        StepsRecord::class,
        HeartRateRecord::class,
        RestingHeartRateRecord::class,
        WeightRecord::class,
        HeightRecord::class,
        BodyFatRecord::class,
        SleepSessionRecord::class,
        ActiveCaloriesBurnedRecord::class,
        TotalCaloriesBurnedRecord::class,
        DistanceRecord::class,
        OxygenSaturationRecord::class,
        BloodPressureRecord::class,
        ExerciseSessionRecord::class
    )

    // Complete permissions array for activity contract
    val permissions: Set<String> = recordTypes.map {
        HealthPermission.getReadPermission(it)
    }.toSet()

    suspend fun hasAllPermissions(): Boolean {
        val client = healthConnectClient ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return granted.containsAll(permissions)
    }

    suspend fun getGrantedPermissions(): Set<String> {
        val client = healthConnectClient ?: return emptySet()
        return client.permissionController.getGrantedPermissions()
    }

    /**
     * Reads the last 30 days of data across all 13 records (Initial Sync)
     */
    suspend fun readInitialSync30Days(): List<BiometricRecordDto> {
        val client = healthConnectClient ?: return emptyList()
        val endTime = Instant.now()
        val startTime = endTime.minus(30, ChronoUnit.DAYS)
        val timeFilter = TimeRangeFilter.between(startTime, endTime)

        val output = mutableListOf<BiometricRecordDto>()

        // 1. Steps
        try {
            val res = client.readRecords(ReadRecordsRequest(StepsRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "steps",
                        value = r.count,
                        unit = "steps",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 2. Heart Rate
        try {
            val res = client.readRecords(ReadRecordsRequest(HeartRateRecord::class, timeFilter))
            for (r in res.records) {
                for (s in r.samples) {
                    output.add(
                        BiometricRecordDto(
                            recordId = "${r.metadata.id}_${s.time.toEpochMilli()}",
                            type = "heart_rate",
                            value = s.beatsPerMinute,
                            unit = "bpm",
                            startTime = s.time.toString(),
                            endTime = s.time.toString()
                        )
                    )
                }
            }
        } catch (_: Exception) {}

        // 3. Resting Heart Rate
        try {
            val res = client.readRecords(ReadRecordsRequest(RestingHeartRateRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "resting_heart_rate",
                        value = r.beatsPerMinute,
                        unit = "bpm",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 4. Weight
        try {
            val res = client.readRecords(ReadRecordsRequest(WeightRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "weight",
                        value = Math.round(r.weight.inKilograms * 100.0) / 100.0,
                        unit = "kg",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 5. Height
        try {
            val res = client.readRecords(ReadRecordsRequest(HeightRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "height",
                        value = Math.round(r.height.inMeters * 100.0),
                        unit = "cm",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 6. Body Fat
        try {
            val res = client.readRecords(ReadRecordsRequest(BodyFatRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "body_fat",
                        value = Math.round(r.percentage.value * 10.0) / 10.0,
                        unit = "%",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 7. Sleep Session
        try {
            val res = client.readRecords(ReadRecordsRequest(SleepSessionRecord::class, timeFilter))
            for (r in res.records) {
                val durationHours = ChronoUnit.MINUTES.between(r.startTime, r.endTime) / 60.0
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "sleep",
                        value = Math.round(durationHours * 100.0) / 100.0,
                        unit = "hours",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 8. Active Calories Burned
        try {
            val res = client.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "active_calories",
                        value = Math.round(r.energy.inKilocalories),
                        unit = "kcal",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 9. Total Calories Burned
        try {
            val res = client.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "total_calories",
                        value = Math.round(r.energy.inKilocalories),
                        unit = "kcal",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 10. Distance
        try {
            val res = client.readRecords(ReadRecordsRequest(DistanceRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "distance",
                        value = Math.round(r.distance.inMeters),
                        unit = "meters",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 11. Oxygen Saturation
        try {
            val res = client.readRecords(ReadRecordsRequest(OxygenSaturationRecord::class, timeFilter))
            for (r in res.records) {
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "oxygen_saturation",
                        value = Math.round(r.percentage.value * 10.0) / 10.0,
                        unit = "%",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 12. Blood Pressure
        try {
            val res = client.readRecords(ReadRecordsRequest(BloodPressureRecord::class, timeFilter))
            for (r in res.records) {
                val sys = r.systolic.inMillimetersOfMercury.toInt()
                val dia = r.diastolic.inMillimetersOfMercury.toInt()
                val bpMap = mapOf("systolic" to sys, "diastolic" to dia)
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "blood_pressure",
                        value = bpMap,
                        unit = "mmHg",
                        startTime = r.time.toString(),
                        endTime = r.time.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        // 13. Exercise Session
        try {
            val res = client.readRecords(ReadRecordsRequest(ExerciseSessionRecord::class, timeFilter))
            for (r in res.records) {
                val durationMins = ChronoUnit.MINUTES.between(r.startTime, r.endTime)
                val exMap = mapOf(
                    "title" to (r.title ?: "Exercise Session"),
                    "durationMinutes" to durationMins
                )
                output.add(
                    BiometricRecordDto(
                        recordId = r.metadata.id,
                        type = "exercise",
                        value = exMap,
                        unit = "workout",
                        startTime = r.startTime.toString(),
                        endTime = r.endTime.toString()
                    )
                )
            }
        } catch (_: Exception) {}

        return output
    }

    /**
     * Gets a new change token for incremental sync tracking
     */
    suspend fun getChangesToken(): String? {
        val client = healthConnectClient ?: return null
        return try {
            client.getChangesToken(ChangesTokenRequest(recordTypes = recordTypes))
        } catch (e: Exception) {
            null
        }
    }
}

