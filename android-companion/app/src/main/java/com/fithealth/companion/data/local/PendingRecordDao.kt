package com.fithealth.companion.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface PendingRecordDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBatch(records: List<PendingRecordEntity>)

    @Query("SELECT * FROM pending_records ORDER BY createdAt ASC LIMIT :limit")
    suspend fun getPendingBatch(limit: Int = 200): List<PendingRecordEntity>

    @Query("DELETE FROM pending_records WHERE recordId IN (:recordIds)")
    suspend fun deleteUploaded(recordIds: List<String>)

    @Query("SELECT COUNT(*) FROM pending_records")
    suspend fun getPendingCount(): Int

    @Query("DELETE FROM pending_records")
    suspend fun clearAll()
}

