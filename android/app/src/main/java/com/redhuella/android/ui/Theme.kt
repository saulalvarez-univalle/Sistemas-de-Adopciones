package com.redhuella.android.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val HuellaBlue = Color(0xFF173F5F)
val HuellaGreen = Color(0xFF2F8F70)
val HuellaCanvas = Color(0xFFF6F8F9)
val HuellaInk = Color(0xFF263238)
val HuellaMuted = Color(0xFF687983)

private val RedHuellaColors = lightColorScheme(
    primary = HuellaBlue,
    onPrimary = Color.White,
    secondary = HuellaGreen,
    onSecondary = Color.White,
    background = HuellaCanvas,
    onBackground = HuellaInk,
    surface = Color.White,
    onSurface = HuellaInk,
    error = Color(0xFFB3261E)
)

@Composable
fun RedHuellaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RedHuellaColors,
        content = content
    )
}
