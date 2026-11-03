package com.fithealth.companion.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [PendingRecordEntity::class], version = 1, exportSchema = false)
abstract class SyncQueueDatabase : RoomDatabase() {
    abstract fun pendingRecordDao(): PendingRecordDao

    companion object {
        @Volatile
        private var INSTANCE: SyncQueueDatabase? = null

        fun getDatabase(context: Context): SyncQueueDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SyncQueueDatabase::class.java,
                    "fit_health_sync_queue.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}

