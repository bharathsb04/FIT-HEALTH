package com.fithealth.companion.data.remote

import com.fithealth.companion.data.model.LoginRequestDto
import com.fithealth.companion.data.model.LoginResponseDto
import com.fithealth.companion.data.model.SyncRequestDto
import com.fithealth.companion.data.model.SyncResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface FitHealthApi {

    @POST("/api/auth/login")
    suspend fun login(
        @Body request: LoginRequestDto
    ): Response<LoginResponseDto>

    @POST("/api/biometrics/sync")
    suspend fun syncBiometrics(
        @Header("Authorization") token: String,
        @Body payload: SyncRequestDto
    ): Response<SyncResponseDto>
}

