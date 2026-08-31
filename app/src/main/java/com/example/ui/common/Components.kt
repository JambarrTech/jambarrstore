package com.example.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.JambarrPrimary
import com.example.ui.theme.JambarrSurface
import com.example.ui.theme.JambarrTextPrimary
import com.example.ui.theme.JambarrTextSecondary

@Composable
fun JambarrButton(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  isPrimary: Boolean = true
) {
  if (isPrimary) {
    Button(
      onClick = onClick,
      enabled = enabled,
      modifier = modifier.height(50.dp).fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      colors = ButtonDefaults.buttonColors(containerColor = JambarrPrimary)
    ) {
      Text(text = text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
    }
  } else {
    OutlinedButton(
      onClick = onClick,
      enabled = enabled,
      modifier = modifier.height(50.dp).fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      colors = ButtonDefaults.outlinedButtonColors(contentColor = JambarrPrimary)
    ) {
      Text(text = text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = JambarrPrimary)
    }
  }
}

@Composable
fun JambarrTopBar(
  title: String,
  onBackClick: (() -> Unit)? = null,
  actions: @Composable RowScope.() -> Unit = {}
) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .background(JambarrSurface)
      .padding(horizontal = 16.dp, vertical = 12.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      if (onBackClick != null) {
        IconButton(onClick = onBackClick) {
          Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Retour", tint = JambarrTextPrimary)
        }
        Spacer(modifier = Modifier.width(8.dp))
      }
      Text(
        text = title,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = JambarrTextPrimary
      )
    }
    Row(verticalAlignment = Alignment.CenterVertically, content = actions)
  }
}

@Composable
fun EmptyStateView(
  title: String,
  subtitle: String,
  actionText: String? = null,
  onAction: (() -> Unit)? = null
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(32.dp),
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Box(
      modifier = Modifier
        .size(80.dp)
        .clip(RoundedCornerShape(40.dp))
        .background(JambarrPrimary.copy(alpha = 0.1f)),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        imageVector = Icons.Default.CheckCircle,
        contentDescription = null,
        tint = JambarrPrimary,
        modifier = Modifier.size(40.dp)
      )
    }
    Spacer(modifier = Modifier.height(20.dp))
    Text(
      text = title,
      fontSize = 20.sp,
      fontWeight = FontWeight.Bold,
      color = JambarrTextPrimary
    )
    Spacer(modifier = Modifier.height(8.dp))
    Text(
      text = subtitle,
      fontSize = 14.sp,
      color = JambarrTextSecondary,
      textAlign = androidx.compose.ui.text.style.TextAlign.Center
    )
    if (actionText != null && onAction != null) {
      Spacer(modifier = Modifier.height(24.dp))
      Button(
        onClick = onAction,
        shape = RoundedCornerShape(10.dp),
        colors = ButtonDefaults.buttonColors(containerColor = JambarrPrimary)
      ) {
        Text(text = actionText, color = Color.White)
      }
    }
  }
}
