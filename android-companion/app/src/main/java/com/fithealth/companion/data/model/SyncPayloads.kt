package com.fithealth.companion.data.model

import com.google.gson.annotations.SerializedName

data class SyncRequestDto(
    @SerializedName("records")
    val records: List<BiometricRecordDto>,

    @SerializedName("device")
    val device: String,

    @SerializedName("changeToken")
    val changeToken: String? = null
)

data class SyncResponseDto(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String,

    @SerializedName("syncedCount")
    val syncedCount: Int,

    @SerializedName("lastSyncTimestamp")
    val lastSyncTimestamp: String
)

data class LoginRequestDto(
    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String,

    @SerializedName("role")
    val role: String = "member"
)

data class LoginResponseDto(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("token")
    val token: String?,

    @SerializedName("user")
    val user: UserDto?
)

data class UserDto(
    @SerializedName("id")
    val id: String?,

    @SerializedName("name")
    val name: String?,

    @SerializedName("email")
    val email: String?,

    @SerializedName("role")
    val role: String?
)

