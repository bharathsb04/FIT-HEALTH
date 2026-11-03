package com.fithealth.companion.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val FitDarkBackground = Color(0xFF0B0F19)
val FitDarkSurface = Color(0xFF121927)
val FitCard = Color(0xFF161F33)
val FitPrimary = Color(0xFF10B981)
val FitSecondary = Color(0xFF06B6D4)
val FitRose = Color(0xFFF43F5E)
val FitAmber = Color(0xFFF59E0B)
val FitSamsungBlue = Color(0xFF1428A0)

private val DarkColorScheme = darkColorScheme(
    primary = FitPrimary,
    onPrimary = Color(0xFF0B0F19),
    secondary = FitSecondary,
    onSecondary = Color(0xFF0B0F19),
    background = FitDarkBackground,
    onBackground = Color.White,
    surface = FitDarkSurface,
    onSurface = Color.White,
    surfaceVariant = FitCard,
    onSurfaceVariant = Color(0xFF94A3B8)
)

@Composable
fun FitHealthTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}

