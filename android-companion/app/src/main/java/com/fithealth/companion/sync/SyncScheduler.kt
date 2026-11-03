package com.fithealth.companion.sync

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

object SyncScheduler {

    private const val PERIODIC_WORK_TAG = "fit_health_periodic_sync"
    private const val IMMEDIATE_WORK_TAG = "fit_health_immediate_sync"

    /**
     * Schedules automatic background sync every 15 minutes with network constraints.
     */
    fun schedulePeriodicSync(context: Context, intervalMinutes: Long = 15) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val periodicRequest = PeriodicWorkRequestBuilder<BiometricsSyncWorker>(
            intervalMinutes, TimeUnit.MINUTES,
            5, TimeUnit.MINUTES // flex interval
        )
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
            .addTag(PERIODIC_WORK_TAG)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            PERIODIC_WORK_TAG,
            ExistingPeriodicWorkPolicy.UPDATE,
            periodicRequest
        )
    }

    /**
     * Triggers an immediate one-time sync run when user taps "Sync Now".
     */
    fun runImmediateSync(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val oneTimeRequest = OneTimeWorkRequestBuilder<BiometricsSyncWorker>()
            .setConstraints(constraints)
            .addTag(IMMEDIATE_WORK_TAG)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            IMMEDIATE_WORK_TAG,
            ExistingWorkPolicy.REPLACE,
            oneTimeRequest
        )
    }

    fun cancelAllSync(context: Context) {
        WorkManager.getInstance(context).cancelAllWorkByTag(PERIODIC_WORK_TAG)
        WorkManager.getInstance(context).cancelAllWorkByTag(IMMEDIATE_WORK_TAG)
    }
}

