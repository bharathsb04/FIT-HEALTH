package com.fithealth.companion.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Offline Sync Queue Entity
 * Stores records locally if the device has intermittent or no network connectivity.
 */
@Entity(tableName = "pending_records")
data class PendingRecordEntity(
    @PrimaryKey
    val recordId: String,
    val type: String,
    val valueJson: String,
    val unit: String,
    val startTime: String,
    val endTime: String,
    val sourceApp: String,
    val createdAt: Long = System.currentTimeMillis()
)

