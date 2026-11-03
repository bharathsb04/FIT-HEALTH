package com.fithealth.companion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fithealth.companion.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun StatusScreen(
    memberName: String?,
    memberEmail: String?,
    memberId: String?,
    hasPermissions: Boolean,
    lastSyncTime: Long?,
    lastCount: Int,
    isSyncing: Boolean,
    successMessage: String?,
    errorMessage: String?,
    onRequestPermissions: () -> Unit,
    onSyncNow: () -> Unit,
    onDisconnect: () -> Unit
) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.getDefault())
    val lastSyncFormatted = lastSyncTime?.let { dateFormat.format(Date(it)) } ?: "Never synced"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(FitDarkBackground)
            .padding(20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Samsung Health Bridge",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = "Fit Health Gym Companion",
                        fontSize = 12.sp,
                        color = FitSecondary
                    )
                }

                Box(
                    modifier = Modifier
                        .background(
                            color = if (hasPermissions) FitPrimary.copy(alpha = 0.15f) else FitAmber.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(20.dp)
                        )
                        .border(
                            width = 1.dp,
                            color = if (hasPermissions) FitPrimary else FitAmber,
                            shape = RoundedCornerShape(20.dp)
                        )
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (hasPermissions) "ONLINE & SYNCING" else "NEEDS PERMISSION",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (hasPermissions) FitPrimary else FitAmber
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Member Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = FitDarkSurface)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .background(
                                brush = Brush.linearGradient(listOf(FitPrimary, FitSecondary)),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = memberName?.take(1)?.uppercase() ?: "M",
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp,
                            color = Color(0xFF0B0F19)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = memberName ?: "Gym Member",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = memberEmail ?: "",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                        if (!memberId.isNullOrBlank()) {
                            Text(
                                text = "ID: $memberId",
                                fontSize = 11.sp,
                                color = FitSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Health Connect Permissions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = FitDarkSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(
                                imageVector = if (hasPermissions) Icons.Default.CheckCircle else Icons.Default.Warning,
                                contentDescription = null,
                                tint = if (hasPermissions) FitPrimary else FitAmber,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = "Health Connect Permissions",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Color.White
                            )
                        }
                    }

                    Text(
                        text = if (hasPermissions)
                            "All 13 Health Connect records authorized (Steps, Heart Rate, Sleep, BP, Body Comp, Calories)."
                        else
                            "Samsung Health sensor read permissions missing. Tap below to authorize.",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 6.dp, bottom = 10.dp)
                    )

                    if (!hasPermissions) {
                        Button(
                            onClick = onRequestPermissions,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = FitAmber),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Grant Health Connect Permissions", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Sync Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = FitDarkSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Telemetry Sync Status",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Last Synced:", fontSize = 12.sp, color = Color.Gray)
                        Text(text = lastSyncFormatted, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Records Last Uploaded:", fontSize = 12.sp, color = Color.Gray)
                        Text(text = "$lastCount metrics", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = FitPrimary)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Background WorkManager:", fontSize = 12.sp, color = Color.Gray)
                        Text(text = "Active (Every 15 min)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = FitSecondary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action: Sync Now
            Button(
                onClick = onSyncNow,
                enabled = !isSyncing && hasPermissions,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = FitPrimary,
                    contentColor = Color(0xFF0B0F19)
                )
            ) {
                if (isSyncing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color(0xFF0B0F19),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Syncing Health Telemetry...", fontWeight = FontWeight.Bold)
                } else {
                    Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sync Now to Fit Health Web App", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action: Disconnect
            OutlinedButton(
                onClick = onDisconnect,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = FitRose)
            ) {
                Icon(Icons.Default.PowerSettingsNew, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Disconnect Companion App")
            }
        }
    }
}

