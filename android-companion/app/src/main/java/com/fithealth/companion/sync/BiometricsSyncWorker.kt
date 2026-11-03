package com.fithealth.companion.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.fithealth.companion.data.local.PendingRecordEntity
import com.fithealth.companion.data.local.SyncQueueDatabase
import com.fithealth.companion.data.model.BiometricRecordDto
import com.fithealth.companion.data.model.SyncRequestDto
import com.fithealth.companion.data.remote.ApiClient
import com.fithealth.companion.health.HealthConnectManager
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class BiometricsSyncWorker(
    private val appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val gson = Gson()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = appContext.getSharedPreferences("fit_health_companion_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("auth_token", null)
        val serverUrl = prefs.getString("server_url", "http://10.0.2.2:5000")

        if (token.isNullOrBlank()) {
            return@withContext Result.failure()
        }

        val healthManager = HealthConnectManager(appContext)
        if (!healthManager.hasAllPermissions()) {
            return@withContext Result.failure()
        }

        val db = SyncQueueDatabase.getDatabase(appContext)
        val dao = db.pendingRecordDao()

        try {
            // 1. Fetch fresh telemetry from Health Connect
            val freshRecords = healthManager.readInitialSync30Days()

            // 2. Enqueue fresh records into offline Room Database
            if (freshRecords.isNotEmpty()) {
                val entities = freshRecords.map { dto ->
                    PendingRecordEntity(
                        recordId = dto.recordId,
                        type = dto.type,
                        valueJson = gson.toJson(dto.value),
                        unit = dto.unit,
                        startTime = dto.startTime,
                        endTime = dto.endTime,
                        sourceApp = dto.sourceApp
                    )
                }
                dao.insertBatch(entities)
            }

            // 3. Drain pending offline queue to Fit Health backend in batches
            val api = ApiClient.getService(serverUrl)
            var pendingBatch = dao.getPendingBatch(100)

            while (pendingBatch.isNotEmpty()) {
                val dtoList = pendingBatch.map { entity ->
                    BiometricRecordDto(
                        recordId = entity.recordId,
                        type = entity.type,
                        value = gson.fromJson(entity.valueJson, Any::class.java),
                        unit = entity.unit,
                        startTime = entity.startTime,
                        endTime = entity.endTime,
                        sourceApp = entity.sourceApp
                    )
                }

                val payload = SyncRequestDto(
                    records = dtoList,
                    device = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL} (Health Connect)"
                )

                val response = api.syncBiometrics("Bearer $token", payload)
                if (response.isSuccessful && response.body()?.success == true) {
                    val uploadedIds = pendingBatch.map { it.recordId }
                    dao.deleteUploaded(uploadedIds)

                    // Record last sync timestamp
                    prefs.edit()
                        .putLong("last_sync_time", System.currentTimeMillis())
                        .putInt("last_synced_count", dtoList.size)
                        .apply()
                } else {
                    // Retry on temporary network/server failure
                    return@withContext Result.retry()
                }

                pendingBatch = dao.getPendingBatch(100)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

