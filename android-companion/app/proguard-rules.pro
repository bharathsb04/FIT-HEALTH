# Proguard rules for Fit Health Companion App
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}

