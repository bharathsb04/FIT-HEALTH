package com.fithealth.companion.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    // Default to Android Emulator loopback to host machine port 5000
    private var currentBaseUrl = "http://10.0.2.2:5000/"
    private var retrofitInstance: Retrofit? = null
    private var apiServiceInstance: FitHealthApi? = null

    fun getService(baseUrl: String? = null): FitHealthApi {
        val targetUrl = if (!baseUrl.isNullOrBlank()) {
            if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
        } else {
            currentBaseUrl
        }

        if (apiServiceInstance == null || currentBaseUrl != targetUrl) {
            currentBaseUrl = targetUrl

            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC // Never log sensitive payload bodies
            }

            val okHttpClient = OkHttpClient.Builder()
                .connectTimeout(20, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .writeTimeout(20, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            retrofitInstance = Retrofit.Builder()
                .baseUrl(currentBaseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            apiServiceInstance = retrofitInstance!!.create(FitHealthApi::class.java)
        }

        return apiServiceInstance!!
    }
}

