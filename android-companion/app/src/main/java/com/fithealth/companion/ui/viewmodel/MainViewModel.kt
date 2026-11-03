package com.fithealth.companion.ui.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.fithealth.companion.data.model.LoginRequestDto
import com.fithealth.companion.data.remote.ApiClient
import com.fithealth.companion.health.HealthConnectManager
import com.fithealth.companion.sync.SyncScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MainUiState(
    val isLoggedIn: Boolean = false,
    val token: String? = null,
    val memberName: String? = null,
    val memberEmail: String? = null,
    val memberId: String? = null,
    val serverUrl: String = "http://10.0.2.2:5000",
    val hasHealthPermissions: Boolean = false,
    val isSyncing: Boolean = false,
    val lastSyncTime: Long? = null,
    val lastSyncedCount: Int = 0,
    val errorMessage: String? = null,
    val successMessage: String? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("fit_health_companion_prefs", Context.MODE_PRIVATE)
    private val healthManager = HealthConnectManager(application)

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        loadSession()
        checkPermissions()
    }

    fun loadSession() {
        val token = prefs.getString("auth_token", null)
        val name = prefs.getString("member_name", null)
        val email = prefs.getString("member_email", null)
        val memberId = prefs.getString("member_id", null)
        val serverUrl = prefs.getString("server_url", "http://10.0.2.2:5000") ?: "http://10.0.2.2:5000"
        val lastSync = prefs.getLong("last_sync_time", 0L).takeIf { it > 0 }
        val lastCount = prefs.getInt("last_synced_count", 0)

        _uiState.value = _uiState.value.copy(
            isLoggedIn = !token.isNullOrBlank(),
            token = token,
            memberName = name,
            memberEmail = email,
            memberId = memberId,
            serverUrl = serverUrl,
            lastSyncTime = lastSync,
            lastSyncedCount = lastCount
        )

        if (!token.isNullOrBlank()) {
            SyncScheduler.schedulePeriodicSync(getApplication(), 15)
        }
    }

    fun checkPermissions() {
        viewModelScope.launch {
            val hasPerms = healthManager.hasAllPermissions()
            _uiState.value = _uiState.value.copy(hasHealthPermissions = hasPerms)
        }
    }

    fun login(email: String, pass: String, serverUrl: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true, errorMessage = null)
            try {
                val api = ApiClient.getService(serverUrl)
                val response = api.login(LoginRequestDto(email.trim(), pass, "member"))

                if (response.isSuccessful && response.body()?.token != null) {
                    val body = response.body()!!
                    val token = body.token!!
                    val user = body.user

                    prefs.edit()
                        .putString("auth_token", token)
                        .putString("member_name", user?.name)
                        .putString("member_email", user?.email)
                        .putString("member_id", user?.id)
                        .putString("server_url", serverUrl.trim())
                        .apply()

                    _uiState.value = _uiState.value.copy(
                        isLoggedIn = true,
                        token = token,
                        memberName = user?.name,
                        memberEmail = user?.email,
                        memberId = user?.id,
                        serverUrl = serverUrl.trim(),
                        isSyncing = false,
                        successMessage = "Logged in successfully as ${user?.name}!"
                    )

                    SyncScheduler.schedulePeriodicSync(getApplication(), 15)
                    checkPermissions()
                } else {
                    _uiState.value = _uiState.value.copy(
                        isSyncing = false,
                        errorMessage = response.body()?.message ?: "Login failed. Check your credentials."
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSyncing = false,
                    errorMessage = "Connection error: ${e.message}"
                )
            }
        }
    }

    fun syncNow() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true, errorMessage = null)
            SyncScheduler.runImmediateSync(getApplication())
            // Brief delay to reflect state
            kotlinx.coroutines.delay(2000)
            loadSession()
            _uiState.value = _uiState.value.copy(isSyncing = false, successMessage = "Telemetry sync requested!")
        }
    }

    fun disconnect() {
        prefs.edit().clear().apply()
        SyncScheduler.cancelAllSync(getApplication())
        _uiState.value = MainUiState(
            isLoggedIn = false,
            serverUrl = "http://10.0.2.2:5000"
        )
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(errorMessage = null, successMessage = null)
    }
}

