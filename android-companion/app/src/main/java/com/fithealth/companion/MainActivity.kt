package com.fithealth.companion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.health.connect.client.PermissionController
import com.fithealth.companion.health.HealthConnectManager
import com.fithealth.companion.ui.screens.LoginScreen
import com.fithealth.companion.ui.screens.StatusScreen
import com.fithealth.companion.ui.theme.FitHealthTheme
import com.fithealth.companion.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()
    private lateinit var healthManager: HealthConnectManager

    // Permission Request Contract for Health Connect
    private val requestPermissionActivityContract =
        registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { granted ->
            viewModel.checkPermissions()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        healthManager = HealthConnectManager(this)

        setContent {
            FitHealthTheme {
                val uiState by viewModel.uiState.collectAsState()

                if (!uiState.isLoggedIn) {
                    LoginScreen(
                        initialServerUrl = uiState.serverUrl,
                        isLoading = uiState.isSyncing,
                        errorMessage = uiState.errorMessage,
                        onLogin = { email, pass, url ->
                            viewModel.login(email, pass, url)
                        }
                    )
                } else {
                    StatusScreen(
                        memberName = uiState.memberName,
                        memberEmail = uiState.memberEmail,
                        memberId = uiState.memberId,
                        hasPermissions = uiState.hasHealthPermissions,
                        lastSyncTime = uiState.lastSyncTime,
                        lastCount = uiState.lastSyncedCount,
                        isSyncing = uiState.isSyncing,
                        successMessage = uiState.successMessage,
                        errorMessage = uiState.errorMessage,
                        onRequestPermissions = {
                            requestPermissionActivityContract.launch(healthManager.permissions)
                        },
                        onSyncNow = {
                            viewModel.syncNow()
                        },
                        onDisconnect = {
                            viewModel.disconnect()
                        }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (::healthManager.isInitialized) {
            viewModel.checkPermissions()
        }
    }
}

