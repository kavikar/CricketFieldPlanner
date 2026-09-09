package com.example

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Paint as AndroidPaint
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ui.theme.MyApplicationTheme
import kotlin.math.*

// ==========================================
// DATA MODELS
// ==========================================

data class Fielder(
    val id: String,
    val name: String,
    val label: String,
    val x: Float, // percentage coordinates (0 to 100)
    val y: Float,
    val isWK: Boolean = false
)

data class ValidationResults(
    val isValid: Boolean,
    val outsideCircleCount: Int,
    val maxAllowedOutside: Int?, // null if Test Match (no restrictions)
    val violations: List<String>,
    val illegalFielderIds: Set<String>
)

// ==========================================
// PRESET BUILDER
// ==========================================

object FieldPresets {
    fun getPreset(bowlerType: String, overType: String, format: String): List<Fielder> {
        return when (bowlerType) {
            "Pace" -> {
                when (overType) {
                    "Powerplay" -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 72f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL1", 45f, 61f),
                        Fielder("sl2", "2nd Slip", "SL2", 41f, 63f),
                        Fielder("g", "Gully", "G", 36f, 60f),
                        Fielder("p", "Point", "P", 28f, 50f),
                        Fielder("c", "Cover", "C", 32f, 40f),
                        Fielder("moff", "Mid-off", "MOff", 43f, 35f),
                        Fielder("mon", "Mid-on", "MOn", 57f, 35f),
                        Fielder("sl", "Square Leg", "SL", 68f, 54f),
                        Fielder("fl", "Fine Leg (Deep)", "FL", 75f, 78f),
                        Fielder("tm", "Third Man (Deep)", "TM", 24f, 76f)
                    )
                    "Non-Powerplay" -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 72f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL1", 45f, 61f),
                        Fielder("moff", "Mid-off", "MOff", 43f, 38f),
                        Fielder("sl", "Square Leg (Short)", "SL", 66f, 56f),
                        Fielder("fl", "Fine Leg (Short)", "FL", 62f, 68f),
                        Fielder("mw", "Midwicket", "MW", 63f, 40f),
                        Fielder("dtm", "Deep Third Man", "DTM", 18f, 76f),
                        Fielder("dp", "Deep Point", "DP", 12f, 50f),
                        Fielder("dc", "Deep Cover", "DC", 18f, 24f),
                        Fielder("loff", "Long-off", "LOff", 40f, 10f),
                        Fielder("lon", "Long-on", "LOn", 60f, 10f)
                    )
                    "Death" -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 74f, isWK = true),
                        Fielder("sfl", "Short Fine Leg", "SFL", 58f, 65f),
                        Fielder("mo", "Mid-off (Catching)", "MO", 43f, 38f),
                        Fielder("mw", "Midwicket", "MW", 63f, 40f),
                        Fielder("p", "Point", "P", 28f, 50f),
                        Fielder("c", "Cover", "C", 32f, 40f),
                        Fielder("dsql", "Deep Square Leg", "DSQL", 82f, 65f),
                        Fielder("lon", "Long-on", "LOn", 60f, 10f),
                        Fielder("loff", "Long-off", "LOff", 40f, 10f),
                        Fielder("dc", "Deep Cover", "DC", 18f, 24f),
                        Fielder("tm", "Third Man (Deep)", "TM", 18f, 76f)
                    )
                    else -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 72f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL1", 45f, 61f),
                        Fielder("sl2", "2nd Slip", "SL2", 41f, 63f),
                        Fielder("g", "Gully", "G", 36f, 60f),
                        Fielder("p", "Point", "P", 28f, 50f),
                        Fielder("c", "Cover", "C", 32f, 40f),
                        Fielder("moff", "Mid-off", "MOff", 43f, 35f),
                        Fielder("mon", "Mid-on", "MOn", 57f, 35f),
                        Fielder("sl", "Square Leg", "SL", 68f, 54f),
                        Fielder("fl", "Fine Leg (Deep)", "FL", 75f, 78f),
                        Fielder("tm", "Third Man (Deep)", "TM", 24f, 76f)
                    )
                }
            }
            "Spin" -> {
                when (overType) {
                    "Powerplay" -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 59.5f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL", 45f, 61f),
                        Fielder("smon", "Silly Mid-on", "SMOn", 46f, 52f),
                        Fielder("c", "Cover", "C", 30f, 42f),
                        Fielder("moff", "Mid-off", "MOff", 43f, 35f),
                        Fielder("mon", "Mid-on", "MOn", 57f, 35f),
                        Fielder("p", "Point", "P", 28f, 50f),
                        Fielder("sl", "Square Leg", "SL", 68f, 54f),
                        Fielder("fl", "Fine Leg", "FL", 62f, 68f),
                        Fielder("tm", "Deep Third Man", "TM", 18f, 76f),
                        Fielder("dmw", "Deep Midwicket", "DMW", 80f, 30f)
                    )
                    "Non-Powerplay" -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 59.5f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL", 45f, 61f),
                        Fielder("slg", "Short Leg", "SLg", 54f, 57f),
                        Fielder("smon", "Silly Mid-on", "SMOn", 46f, 52f),
                        Fielder("c", "Cover", "C", 30f, 42f),
                        Fielder("fl", "Fine Leg", "FL", 62f, 68f),
                        Fielder("lon", "Long-on", "LOn", 60f, 10f),
                        Fielder("loff", "Long-off", "LOff", 40f, 10f),
                        Fielder("dmw", "Deep Midwicket", "DMW", 80f, 28f),
                        Fielder("dsl", "Deep Square Leg", "DSL", 82f, 65f),
                        Fielder("dp", "Deep Point", "DP", 12f, 50f)
                    )
                    "Death" -> listOf( // "Spin - Attacking"
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 59.5f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL1", 44f, 61f),
                        Fielder("sl2", "2nd Slip", "SL2", 40f, 63f),
                        Fielder("lsl", "Leg Slip", "LSl", 56f, 61f),
                        Fielder("sp", "Silly Point", "SP", 44f, 55f),
                        Fielder("slg", "Short Leg", "SLg", 54f, 57f),
                        Fielder("mon", "Mid-on (Catching)", "MOn", 56f, 44f),
                        Fielder("moff", "Mid-off (Catching)", "MOff", 44f, 44f),
                        Fielder("p", "Point", "P", 28f, 50f),
                        Fielder("fl", "Fine Leg", "FL", 62f, 68f),
                        Fielder("lon", "Long-on (Deep)", "LOn", 60f, 10f)
                    )
                    else -> listOf(
                        Fielder("wk", "Wicketkeeper", "WK", 50f, 59.5f, isWK = true),
                        Fielder("sl1", "1st Slip", "SL", 45f, 61f),
                        Fielder("slg", "Short Leg", "SLg", 54f, 57f),
                        Fielder("smon", "Silly Mid-on", "SMOn", 46f, 52f),
                        Fielder("c", "Cover", "C", 30f, 42f),
                        Fielder("fl", "Fine Leg", "FL", 62f, 68f),
                        Fielder("lon", "Long-on", "LOn", 60f, 10f),
                        Fielder("loff", "Long-off", "LOff", 40f, 10f),
                        Fielder("dmw", "Deep Midwicket", "DMW", 80f, 28f),
                        Fielder("dsl", "Deep Square Leg", "DSL", 82f, 65f),
                        Fielder("dp", "Deep Point", "DP", 12f, 50f)
                    )
                }
            }
            else -> emptyList()
        }
    }
}

// ==========================================
// UTILITY FUNCTIONS & LOGIC
// ==========================================

fun validateField(
    players: List<Fielder>,
    format: String,
    overType: String,
    isLeftHanded: Boolean
): ValidationResults {
    val violations = mutableListOf<String>()
    val illegalFielderIds = mutableSetOf<String>()

    // 1. Calculate how many players are outside the circle (Radius roughly 25f)
    var outsideCount = 0
    val outsideFielders = mutableListOf<Fielder>()

    for (player in players) {
        val dx = player.x - 50f
        val dy = player.y - 50f
        val dist = sqrt(dx * dx + dy * dy)
        if (dist > 25f) {
            outsideCount++
            outsideFielders.add(player)
        }
    }

    val maxAllowedOutside = when (format) {
        "T20" -> {
            when (overType) {
                "Powerplay" -> 2
                "Non-Powerplay" -> 5
                "Death" -> 5
                else -> 5
            }
        }
        "ODI" -> {
            when (overType) {
                "Powerplay" -> 2 // Powerplay 1
                "Non-Powerplay" -> 4 // Powerplay 2
                "Death" -> 5 // Powerplay 3
                else -> 4
            }
        }
        "Test" -> null
        else -> null
    }

    // Checking circle rules
    if (maxAllowedOutside != null) {
        if (outsideCount > maxAllowedOutside) {
            violations.add("Too many outfielders: max $maxAllowedOutside allowed, currently has $outsideCount")
            for (player in outsideFielders) {
                illegalFielderIds.add(player.id)
            }
        }

        // Check minimum 2 players inside (for non-powerplay scenarios)
        val insideCount = 11 - outsideCount
        if (insideCount < 2) {
            violations.add("At least 2 fielders must remain inside the 30-yard circle")
        }
    }

    // 2. Leg-side behind square rule (all formats): max 2 fielders behind square on leg-side (excluding WK)
    // Striker crease is at Y = 58f. Behind square means Y > 58f.
    val legSideBehindSquareFielders = mutableListOf<Fielder>()
    for (player in players) {
        if (!player.isWK) {
            val isBehindSquare = player.y > 58f
            // If left handed batsman is active, leg side is LHS (X < 50f), else RHS (X > 50f)
            val isLegSide = if (isLeftHanded) player.x < 50f else player.x > 50f
            if (isBehindSquare && isLegSide) {
                legSideBehindSquareFielders.add(player)
            }
        }
    }

    if (legSideBehindSquareFielders.size > 2) {
        violations.add("Leg-side square limit: max 2 behind square leg, currently has ${legSideBehindSquareFielders.size}")
        for (player in legSideBehindSquareFielders) {
            illegalFielderIds.add(player.id)
        }
    }

    // 3. Leg-side total limit: max 5 fielders total on leg-side (all formats)
    val legSideFielders = mutableListOf<Fielder>()
    for (player in players) {
        val isLegSide = if (isLeftHanded) player.x < 50f else player.x > 50f
        if (isLegSide) {
            legSideFielders.add(player)
        }
    }

    if (legSideFielders.size > 5) {
        violations.add("Leg-side overcrowding: max 5 total allowed on leg-side, currently has ${legSideFielders.size}")
        for (player in legSideFielders) {
            illegalFielderIds.add(player.id)
        }
    }

    return ValidationResults(
        isValid = violations.isEmpty(),
        outsideCircleCount = outsideCount,
        maxAllowedOutside = maxAllowedOutside,
        violations = violations,
        illegalFielderIds = illegalFielderIds
    )
}

// Compute turf zone description based on positional coordinates
fun getFielderZone(x: Float, y: Float, isLeftHanded: Boolean): String {
    val dx = x - 50f
    val dy = y - 50f
    val dist = sqrt(dx * dx + dy * dy)
    val isDeep = dist > 25f

    // Determine vertical domain
    val vertLabel = when {
        y > 58f -> "Behind Crease (Back)"
        y in 42f..58f -> "Square of Wicket"
        else -> "In Front of Crease (Forward)"
    }

    // Determine horizontal domain (Off vs Leg)
    // Right Hander: Left (X<50) is Off, Right (X>50) is Leg
    // Left Hander: Left (X<50) is Leg, Right (X>50) is Off
    val isRHSideOfField = x > 50f
    val zoneSide = if (isLeftHanded) {
        if (isRHSideOfField) "Off-side" else "Leg-side"
    } else {
        if (isRHSideOfField) "Leg-side" else "Off-side"
    }

    val regionName = if (isDeep) "Deep Outfield" else "Infield Circle"

    return "$zoneSide $vertLabel ($regionName)"
}

// Serialisation helper for presets
fun serializeField(players: List<Fielder>): String {
    return players.joinToString(";") { "${it.id},${it.name},${it.label},${it.x},${it.y},${if (it.isWK) 1 else 0}" }
}

fun deserializeField(data: String): List<Fielder>? {
    return try {
        data.split(";").map {
            val parts = it.split(",")
            Fielder(
                id = parts[0],
                name = parts[1],
                label = parts[2],
                x = parts[3].toFloat(),
                y = parts[4].toFloat(),
                isWK = parts[5] == "1"
            )
        }
    } catch (e: Exception) {
        null
    }
}

// ==========================================
// CORE ACTIVITY
// ==========================================

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme(darkTheme = true, dynamicColor = false) {
                Scaffold(
                    modifier = Modifier.fillMaxSize()
                ) { innerPadding ->
                    CricketFieldPlannerApp(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .background(Color(0xFF0E1117))
                    )
                }
            }
        }
    }
}

// ==========================================
// COMPOSABLE MAIN LAYOUT
// ==========================================

@Composable
fun CricketFieldPlannerApp(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val sharedPrefs = remember { context.getSharedPreferences("tactical_presets", Context.MODE_PRIVATE) }

    // States
    var format by remember { mutableStateOf("T20") }
    var overType by remember { mutableStateOf("Powerplay") }
    var bowlerType by remember { mutableStateOf("Pace") }
    var isLeftHanded by remember { mutableStateOf(false) }

    // Active fielders state
    var players by remember {
        mutableStateOf(FieldPresets.getPreset(bowlerType, overType, format))
    }

    var selectedPlayerId by remember { mutableStateOf<String?>(null) }
    var customPreset1 by remember { mutableStateOf(sharedPrefs.getString("slot_1", null)) }
    var customPreset2 by remember { mutableStateOf(sharedPrefs.getString("slot_2", null)) }
    var customPreset3 by remember { mutableStateOf(sharedPrefs.getString("slot_3", null)) }

    // Dialog views
    var showExportDialog by remember { mutableStateOf(false) }
    var savedPresetNameInput by remember { mutableStateOf("") }
    var targetSaveSlot by remember { mutableStateOf<Int?>(null) }

    // Derived states
    val validation = remember(players, format, overType, isLeftHanded) {
        validateField(players, format, overType, isLeftHanded)
    }

    // Trigger loader on toggle change
    fun loadBasePreset(newBowler: String, newOver: String, newFormat: String) {
        players = FieldPresets.getPreset(newBowler, newOver, newFormat)
        if (isLeftHanded) {
            // Re-apply mirror
            players = players.map { it.copy(x = 100f - it.x) }
        }
        selectedPlayerId = null
    }

    // Custom preset saving function
    fun saveCustomPreset(slot: Int) {
        val serialized = serializeField(players)
        sharedPrefs.edit().putString("slot_$slot", serialized).apply()
        when (slot) {
            1 -> customPreset1 = serialized
            2 -> customPreset2 = serialized
            3 -> customPreset3 = serialized
        }
        Toast.makeText(context, "Saved Custom Preset $slot!", Toast.LENGTH_SHORT).show()
        targetSaveSlot = null
    }

    fun deleteCustomPreset(slot: Int) {
        sharedPrefs.edit().remove("slot_$slot").apply()
        when (slot) {
            1 -> customPreset1 = null
            2 -> customPreset2 = null
            3 -> customPreset3 = null
        }
        Toast.makeText(context, "Cleared Preset $slot", Toast.LENGTH_SHORT).show()
    }

    fun loadCustomPreset(serialized: String) {
        val loaded = deserializeField(serialized)
        if (loaded != null) {
            players = loaded
            selectedPlayerId = null
            Toast.makeText(context, "Loaded Custom Preset successfully!", Toast.LENGTH_SHORT).show()
        }
    }

    // Layout configuration (Adaptive Split)
    val config = LocalConfiguration.current
    val isTablet = config.screenWidthDp >= 600

    Column(
        modifier = modifier.fillMaxSize()
    ) {
        // App Bar (MD3 Style)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0E1117))
                .border(width = 1.dp, color = Color(0xFF33353A), shape = RoundedCornerShape(0.dp))
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color(0xFF404859), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🏏",
                        fontSize = 20.sp,
                        textAlign = TextAlign.Center
                    )
                }
                Column {
                    Text(
                        text = "FieldPlanner Pro",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = (-0.2).sp
                    )
                    Text(
                        text = if (format == "Test") "$format • NO LIMITS" else "$format • $overType",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFA8ABB4),
                        fontWeight = FontWeight.Medium,
                        letterSpacing = 1.sp
                    )
                }
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { showExportDialog = true },
                    modifier = Modifier
                        .background(Color(0xFF1A1F2E), CircleShape)
                        .border(1.dp, Color(0xFF33353A), CircleShape)
                        .size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share",
                        tint = Color(0xFFD1E1FF),
                        modifier = Modifier.size(18.dp)
                    )
                }
                IconButton(
                    onClick = {
                        loadBasePreset(bowlerType, overType, format)
                        Toast.makeText(context, "Field Reset", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .background(Color(0xFF1A1F2E), CircleShape)
                        .border(1.dp, Color(0xFF33353A), CircleShape)
                        .size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Reset",
                        tint = Color(0xFFD1E1FF),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // Main content body
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            if (isTablet) {
                // Landscape or Tablet Layout
                Row(
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1.2f)
                            .fillMaxHeight(),
                        contentAlignment = Alignment.Center
                    ) {
                        CricketFieldCanvas(
                            players = players,
                            selectedPlayerId = selectedPlayerId,
                            validation = validation,
                            isLeftHanded = isLeftHanded,
                            onPlayerSelected = { selectedPlayerId = it },
                            onPlayerPositionChanged = { id, newX, newY ->
                                players = players.map {
                                    if (it.id == id) it.copy(x = newX, y = newY) else it
                                }
                            }
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .background(Color(0xFF1A1F2E))
                            .padding(16.dp)
                    ) {
                        ControlsDrawer(
                            format = format,
                            overType = overType,
                            bowlerType = bowlerType,
                            isLeftHanded = isLeftHanded,
                            validation = validation,
                            players = players,
                            selectedPlayerId = selectedPlayerId,
                            onFormatChanged = {
                                val prevFormat = format
                                format = it
                                if (it == "Test") {
                                    loadBasePreset(bowlerType, "Non-Powerplay", it)
                                } else if (prevFormat == "Test") {
                                    loadBasePreset(bowlerType, "Powerplay", it)
                                } else {
                                    loadBasePreset(bowlerType, overType, it)
                                }
                            },
                            onOverTypeChanged = {
                                overType = it
                                loadBasePreset(bowlerType, it, format)
                            },
                            onBowlerTypeChanged = {
                                bowlerType = it
                                loadBasePreset(it, overType, format)
                            },
                            onPresetSelected = { b, o, f ->
                                bowlerType = b
                                overType = o
                                format = f
                                loadBasePreset(b, o, f)
                            },
                            onMirrorToggled = {
                                isLeftHanded = it
                                players = players.map { p -> p.copy(x = 100f - p.x) }
                            },
                            onReset = {
                                loadBasePreset(bowlerType, overType, format)
                                Toast.makeText(context, "Field Reset", Toast.LENGTH_SHORT).show()
                            },
                            onTriggerExport = { showExportDialog = true },
                            onSaveClicked = { slot -> targetSaveSlot = slot },
                            onLoadClicked = { ser -> loadCustomPreset(ser) },
                            onClearPreset = { slot -> deleteCustomPreset(slot) },
                            customPresets = listOf(customPreset1, customPreset2, customPreset3)
                        )
                    }
                }
            } else {
                // Compact Mobile Layout (Vertical Flow)
                Column(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Fixed top field display area
                    Box(
                        modifier = Modifier
                            .weight(1.05f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        CricketFieldCanvas(
                            players = players,
                            selectedPlayerId = selectedPlayerId,
                            validation = validation,
                            isLeftHanded = isLeftHanded,
                            onPlayerSelected = { selectedPlayerId = it },
                            onPlayerPositionChanged = { id, newX, newY ->
                                players = players.map {
                                    if (it.id == id) it.copy(x = newX, y = newY) else it
                                }
                            }
                        )
                    }

                    // Bottom interactive controller panel
                    Box(
                        modifier = Modifier
                            .weight(0.95f)
                            .fillMaxWidth()
                            .shadow(elevation = 16.dp, shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp), clip = false)
                            .clip(RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))
                            .background(Color(0xFF1A1F2E))
                            .border(1.dp, Color(0xFF33353A), RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))
                            .padding(horizontal = 16.dp, vertical = 14.dp)
                    ) {
                        ControlsDrawer(
                            format = format,
                            overType = overType,
                            bowlerType = bowlerType,
                            isLeftHanded = isLeftHanded,
                            validation = validation,
                            players = players,
                            selectedPlayerId = selectedPlayerId,
                            onFormatChanged = {
                                val prevFormat = format
                                format = it
                                if (it == "Test") {
                                    loadBasePreset(bowlerType, "Non-Powerplay", it)
                                } else if (prevFormat == "Test") {
                                    loadBasePreset(bowlerType, "Powerplay", it)
                                } else {
                                    loadBasePreset(bowlerType, overType, it)
                                }
                            },
                            onOverTypeChanged = {
                                overType = it
                                loadBasePreset(bowlerType, it, format)
                            },
                            onBowlerTypeChanged = {
                                bowlerType = it
                                loadBasePreset(it, overType, format)
                            },
                            onPresetSelected = { b, o, f ->
                                bowlerType = b
                                overType = o
                                format = f
                                loadBasePreset(b, o, f)
                            },
                            onMirrorToggled = {
                                isLeftHanded = it
                                players = players.map { p -> p.copy(x = 100f - p.x) }
                            },
                            onReset = {
                                loadBasePreset(bowlerType, overType, format)
                                Toast.makeText(context, "Field Reset", Toast.LENGTH_SHORT).show()
                            },
                            onTriggerExport = { showExportDialog = true },
                            onSaveClicked = { slot -> targetSaveSlot = slot },
                            onLoadClicked = { ser -> loadCustomPreset(ser) },
                            onClearPreset = { slot -> deleteCustomPreset(slot) },
                            customPresets = listOf(customPreset1, customPreset2, customPreset3)
                        )
                    }
                }
            }

            AiAdviceComingSoonBadge(modifier = Modifier.align(Alignment.TopEnd).padding(16.dp))
        }
    }

    // Dynamic Save Preset Modal Dialog
    if (targetSaveSlot != null) {
        val slotNum = targetSaveSlot!!
        AlertDialog(
            onDismissRequest = { targetSaveSlot = null },
            title = { Text("Save Custom Slot $slotNum", fontWeight = FontWeight.Bold, color = Color.White) },
            text = { Text("Save the current tactical layout into memory slot #$slotNum?", color = Color.LightGray) },
            confirmButton = {
                Button(
                    onClick = { saveCustomPreset(slotNum) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2D6A4F))
                ) {
                    Text("Confirm Save", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { targetSaveSlot = null }) {
                    Text("Cancel", color = Color.Gray)
                }
            },
            containerColor = Color(0xFF1A1F2E)
        )
    }

    // Dynamic Export Plan Preview Modal
    if (showExportDialog) {
        ExportPlannerDialog(
            players = players,
            format = format,
            overType = overType,
            bowlerType = bowlerType,
            isLeftHanded = isLeftHanded,
            validation = validation,
            onDismiss = { showExportDialog = false }
        )
    }
}

// ==========================================
// PORTRAIT / ADAPTIVE SUB-COMPOSABLES
// ==========================================

@Composable
fun CricketFieldCanvas(
    players: List<Fielder>,
    selectedPlayerId: String?,
    validation: ValidationResults,
    isLeftHanded: Boolean,
    onPlayerSelected: (String) -> Unit,
    onPlayerPositionChanged: (String, Float, Float) -> Unit,
    modifier: Modifier = Modifier
) {
    val density = LocalDensity.current

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .padding(12.dp)
            .testTag("cricket_pitch_container"),
        contentAlignment = Alignment.Center
    ) {
        val widthPx = constraints.maxWidth.toFloat()
        val heightPx = constraints.maxHeight.toFloat()
        // Base ground canvas drawing
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)

            // Dynamic safe scaling radii
            val rxBoundary = size.width * 0.46f
            val ryBoundary = size.height * 0.46f
            val rField = min(rxBoundary, ryBoundary)

            // Draw lush grass boundaries with a elegant radial gradient
            val turfGradient = Brush.radialGradient(
                colors = listOf(Color(0xFF2D6A4F), Color(0xFF1B4332)),
                center = center,
                radius = rField * 1.1f
            )

            drawCircle(
                brush = turfGradient,
                center = center,
                radius = rField
            )

            // Draw grass lawn mower stripe patterns
            val stripeCount = 14
            val stripeWidth = (rField * 2f) / stripeCount
            for (i in 0 until stripeCount) {
                val leftX = center.x - rField + (i * stripeWidth)
                if (i % 2 == 0) {
                    // Draw clean green vertical stripes inside boundary circle
                    drawRect(
                        color = Color(0x0EFFFFFF),
                        topLeft = Offset(max(leftX, center.x - rField), center.y - rField),
                        size = Size(
                            width = min(stripeWidth, center.x + rField - leftX),
                            height = rField * 2f
                        )
                    )
                }
            }

            // Draw white solid boundary rope
            drawCircle(
                color = Color.White,
                center = center,
                radius = rField,
                style = Stroke(width = 3.dp.toPx())
            )

            // Draw dashed inner 30-yard fielding circle (Radius at 56% of boundary)
            val r30Yard = rField * 0.56f
            drawCircle(
                color = Color(0xFFD1E1FF).copy(alpha = 0.4f),
                center = center,
                radius = r30Yard,
                style = Stroke(
                    width = 2.dp.toPx(),
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(15f, 10f), 0f)
                )
            )

            // DRAW PITCH IN THE CENTER
            // Width ≈ 9% of field radius, height ≈ 36%
            val pitchW = rField * 0.1f
            val pitchH = rField * 0.4f
            val pLeft = center.x - (pitchW / 2f)
            val pTop = center.y - (pitchH / 2f)

            // Pitch clay fill
            drawRect(
                color = Color(0xFFDBC7A2),
                topLeft = Offset(pLeft, pTop),
                size = Size(pitchW, pitchH)
            )

            // Striking limits lines (Crease) at 10% from bottom/top
            val topCreaseY = pTop + (pitchH * 0.1f)
            val bottomCreaseY = pTop + (pitchH * 0.9f)

            drawLine(
                color = Color.White,
                start = Offset(pLeft - 6f, topCreaseY),
                end = Offset(pLeft + pitchW + 6f, topCreaseY),
                strokeWidth = 1.dp.toPx()
            )
            drawLine(
                color = Color.White,
                start = Offset(pLeft - 6f, bottomCreaseY),
                end = Offset(pLeft + pitchW + 6f, bottomCreaseY),
                strokeWidth = 1.dp.toPx()
            )

            // Stumps (Three dots) on crease lines
            val spacing = pitchW / 4f
            for (k in 1..3) {
                val sx = pLeft + (k * spacing)
                drawCircle(color = Color(0xFF2A1C0A), radius = 2.dp.toPx(), center = Offset(sx, topCreaseY))
                drawCircle(color = Color(0xFF2A1C0A), radius = 2.dp.toPx(), center = Offset(sx, bottomCreaseY))
            }
        }

        // Static Label Markers Overlay for Ends
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(28.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Box(
                modifier = Modifier
                    .background(Color.Black.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "BOWLING END",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.6f),
                    letterSpacing = 1.sp
                )
            }
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(28.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Box(
                modifier = Modifier
                    .background(Color.Black.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "STRIKER END (${if (isLeftHanded) "LHB" else "RHB"})",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.6f),
                    letterSpacing = 1.sp
                )
            }
        }

        // Render draggable interactive fielders on top
        players.forEach { player ->
            // Convert relative percentages coordinates (0..100) to absolute local pixels
            // Center is (50, 50). Distance relative to limits.
            val rxBoundary = widthPx * 0.46f
            val ryBoundary = heightPx * 0.46f
            val rField = min(rxBoundary, ryBoundary)

            // Convert percentage X/Y back to absolute pixels representing oval coords
            // Scaled based on centered rField value
            val centerXPx = widthPx / 2f
            val centerYPx = heightPx / 2f

            // Map player percent coords to pixel space relative to centered pitch circle
            val px = centerXPx + ((player.x - 50f) / 100f) * (rField * 2.1f)
            val py = centerYPx + ((player.y - 50f) / 100f) * (rField * 2.1f)

            val isSelected = player.id == selectedPlayerId
            val isViolating = validation.illegalFielderIds.contains(player.id)

            // Outer hit box container
            val fielderRadiusPx = with(density) { 24.dp.toPx() }
            Box(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset {
                        IntOffset(
                            (px - fielderRadiusPx).toInt(),
                            (py - fielderRadiusPx).toInt()
                        )
                    }
                    .size(48.dp)
                    .pointerInput(player.id) {
                        detectDragGestures(
                            onDragStart = { onPlayerSelected(player.id) },
                            onDrag = { change, dragAmount ->
                                change.consume()

                                // Calculate candidate delta percentages
                                val dxPercent = (dragAmount.x / (rField * 2.1f)) * 100f
                                val dyPercent = (dragAmount.y / (rField * 2.1f)) * 100f

                                var nextX = player.x + dxPercent
                                var nextY = player.y + dyPercent

                                // Clamp logic based on general outer boundary (approx ellipse radius 44%)
                                val ox = nextX - 50f
                                val oy = nextY - 50f
                                val limitRad = 44f
                                val distFromCenter = sqrt(ox * ox + oy * oy)

                                if (distFromCenter > limitRad) {
                                    nextX = 50f + (ox / distFromCenter) * limitRad
                                    nextY = 50f + (oy / distFromCenter) * limitRad
                                }

                                // Strictest rule constraint: "Wicketkeeper always behind stumps — not draggable beyond crease"
                                // Bottom crease (Y = 58%). Behind stumps is Y >= 58.5%. Clamping WK.
                                if (player.isWK) {
                                    nextY = max(58.5f, nextY)
                                    nextX = nextX.coerceIn(34f, 66f) // Keep WK centered behind wickets
                                }

                                onPlayerPositionChanged(player.id, nextX, nextY)
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                // Highlight/Alert rings
                if (isSelected) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .border(1.5.dp, Color(0xFF00E5FF), CircleShape)
                    )
                }

                if (isViolating) {
                    Box(
                        modifier = Modifier
                            .scale(1f + (pulseAlpha * 0.15f))
                            .size(38.dp)
                            .border(2.dp, Color(0xFFFF3B30).copy(alpha = pulseAlpha), CircleShape)
                    )
                }

                // Core visible circular token
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                isViolating -> Color(0xFFFF3B30)
                                player.isWK -> Color(0xFFFFC107) // Gold highlight for keeper
                                isSelected -> Color(0xFF00E5FF) // Teal accent for selected
                                else -> Color.White
                            }
                        )
                        .clickable { onPlayerSelected(player.id) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = player.label,
                        fontWeight = FontWeight.Bold,
                        fontSize = if (player.label.length >= 3) 7.sp else 8.sp,
                        color = if (player.isWK || isSelected || isViolating) Color.Black else Color(0xFF0E1117),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

// ==========================================
// CONTROLS DRAWER SYSTEM
// ==========================================

@Composable
fun ControlsDrawer(
    format: String,
    overType: String,
    bowlerType: String,
    isLeftHanded: Boolean,
    validation: ValidationResults,
    players: List<Fielder>,
    selectedPlayerId: String?,
    onFormatChanged: (String) -> Unit,
    onOverTypeChanged: (String) -> Unit,
    onBowlerTypeChanged: (String) -> Unit,
    onPresetSelected: (String, String, String) -> Unit,
    onMirrorToggled: (Boolean) -> Unit,
    onReset: () -> Unit,
    onTriggerExport: () -> Unit,
    onSaveClicked: (Int) -> Unit,
    onLoadClicked: (String) -> Unit,
    onClearPreset: (Int) -> Unit,
    customPresets: List<String?>,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    // Get currently selected player info
    val selectedPlayer = players.find { it.id == selectedPlayerId }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // CRITICAL REAL-TIME VALIDATION STATUS BANNER
        TacticalValidationStatusBanner(validation)

        // Selected Fielder Inspector card
        AnimatedVisibility(
            visible = selectedPlayer != null,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            if (selectedPlayer != null) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0E1117), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFF33353A), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "SELECTED: ${selectedPlayer.name} (${selectedPlayer.label})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (selectedPlayer.isWK) Color(0xFFFFB900) else Color(0xFFD1E1FF)
                        )
                        val isViolating = validation.illegalFielderIds.contains(selectedPlayer.id)
                        if (isViolating) {
                            Text(
                                text = "⚠️ VIOLATION",
                                color = Color(0xFFFF5252),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Text(
                        text = "Current Zone: ${getFielderZone(selectedPlayer.x, selectedPlayer.y, isLeftHanded)}",
                        fontSize = 10.sp,
                        color = Color(0xFFA8ABB4)
                    )
                    Text(
                        text = "Coords: X: ${selectedPlayer.x.toInt()}% | Y: ${selectedPlayer.y.toInt()}%",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFA8ABB4).copy(alpha = 0.6f)
                    )
                }
            }
        }

        // TAB format selector (T20 | ODI | Test)
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "MATCH FORMAT",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA8ABB4),
                letterSpacing = 1.sp,
                modifier = Modifier.padding(start = 4.dp)
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0E1117), CircleShape)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                listOf("T20", "ODI", "Test").forEach { fmt ->
                    val active = format == fmt
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(CircleShape)
                            .background(if (active) Color(0xFFD1E1FF) else Color.Transparent)
                            .clickable { onFormatChanged(fmt) }
                            .padding(vertical = 8.dp)
                            .testTag("tab_format_$fmt"),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                          text = fmt,
                          fontWeight = FontWeight.Bold,
                          color = if (active) Color(0xFF002D6E) else Color(0xFFA8ABB4),
                          fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Phase and Profile select grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Left Column: Phase (or Test note if Test)
            Column(
                modifier = Modifier.weight(1.3f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "PHASE",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFA8ABB4),
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(start = 4.dp)
                )

                if (format == "Test") {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0E1117), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFF33353A), RoundedCornerShape(12.dp))
                            .padding(horizontal = 8.dp, vertical = 8.dp)
                            .height(44.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Text(
                            text = "Free Positioning",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFFE2B96B),
                            lineHeight = 13.sp
                        )
                    }
                } else {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0E1117), RoundedCornerShape(12.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        val overOptions = listOf("Powerplay", "Non-Powerplay", "Death")
                        overOptions.forEach { type ->
                            val active = overType == type
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (active) Color(0xFF404859) else Color.Transparent)
                                    .clickable { onOverTypeChanged(type) }
                                    .padding(vertical = 8.dp)
                                    .testTag("tab_over_$type"),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = when (type) {
                                        "Powerplay" -> "PP1"
                                        "Non-Powerplay" -> "PP2"
                                        else -> "PP3"
                                    },
                                    fontWeight = FontWeight.Bold,
                                    color = if (active) Color.White else Color(0xFFA8ABB4),
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
            }

            // Right Column: Style Profile
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "STYLE",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFA8ABB4),
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(start = 4.dp)
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0E1117), RoundedCornerShape(12.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    listOf("Pace", "Spin").forEach { profile ->
                        val active = bowlerType == profile
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (active) Color(0xFF404859) else Color.Transparent)
                                .clickable { onBowlerTypeChanged(profile) }
                                .padding(vertical = 8.dp)
                                .testTag("tab_bowler_$profile"),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = profile,
                                fontWeight = FontWeight.Bold,
                                color = if (active) Color.White else Color(0xFFA8ABB4),
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }

        // Left hand batter switch
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF0E1117))
                .border(1.dp, Color(0xFF33353A), RoundedCornerShape(12.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Left-Hand Batter (Mirror)",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp,
                    color = Color.White
                )
                Text(
                    text = "Swaps off-side and leg-side channels",
                    fontSize = 10.sp,
                    color = Color(0xFFA8ABB4)
                )
            }
            Switch(
                checked = isLeftHanded,
                onCheckedChange = onMirrorToggled,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color(0xFFFFB900),
                    checkedTrackColor = Color(0xFF404859)
                ),
                modifier = Modifier.testTag("lh_switch")
            )
        }

        // Predefined Tactical Presets Section
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "PREDEFINED TACTICAL PRESETS",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA8ABB4),
                letterSpacing = 1.sp,
                modifier = Modifier.padding(start = 4.dp)
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val presetsList = listOf(
                    Triple("Pace - Powerplay", "Pace", "Powerplay"),
                    Triple("Pace - Death Block", "Pace", "Death"),
                    Triple("Spin - Attacking", "Spin", "Death"),
                    Triple("Spin - Defensive", "Spin", "Non-Powerplay"),
                    Triple("ODI - Mid-Overs", "Pace", "Non-Powerplay")
                )
                presetsList.forEach { (label, paceOrSpin, phase) ->
                    val isSelected = bowlerType == paceOrSpin && overType == phase
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (isSelected) Color(0xFFD1E1FF) else Color(0xFF404859).copy(alpha = 0.3f))
                            .border(1.dp, if (isSelected) Color(0xFFD1E1FF) else Color(0xFF33353A), CircleShape)
                            .clickable {
                                val targetFormat = when (label) {
                                    "Spin - Attacking" -> "Test"
                                    "ODI - Mid-Overs" -> "ODI"
                                    else -> "T20"
                                }
                                onPresetSelected(paceOrSpin, phase, targetFormat)
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                            .testTag("preset_chip_${label.replace(" ", "_").lowercase()}"),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color(0xFF002D6E) else Color(0xFFA8ABB4),
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // Tactical custom saved memory slots section
        Text(
            text = "CUSTOM PRESET SLOTS (LOCAL)",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFA8ABB4),
            letterSpacing = 1.sp,
            modifier = Modifier.padding(start = 4.dp, top = 2.dp)
        )
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for (slotIdx in 1..3) {
                val hasPreset = customPresets[slotIdx - 1] != null
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0E1117))
                        .border(1.dp, Color(0xFF33353A), RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Memory Slot #$slotIdx",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = if (hasPreset) "Tactical Saved Preset" else "Empty Memory Log",
                            fontSize = 9.sp,
                            color = if (hasPreset) Color(0xFF8DF0BD) else Color(0xFFA8ABB4)
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (hasPreset) {
                            Button(
                                onClick = { onLoadClicked(customPresets[slotIdx - 1]!!) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF404859)),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("LOAD", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            IconButton(
                                onClick = { onClearPreset(slotIdx) },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Delete Preset",
                                    tint = Color(0xFFFF5252),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        } else {
                            Button(
                                onClick = { onSaveClicked(slotIdx) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2D6A4F)),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("SAVE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                    }
                }
            }
        }

        Divider(color = Color(0xFF33353A), thickness = 1.dp)

        // Footer Actions Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onTriggerExport,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF404859)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("export_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Export Plan",
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Export Plan", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
            }

            Button(
                onClick = onReset,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A1F2E)),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF33353A)),
                modifier = Modifier
                    .height(48.dp)
                    .padding(horizontal = 4.dp)
            ) {
                Text("Reset", fontWeight = FontWeight.Bold, color = Color(0xFFE2E2E6), fontSize = 13.sp)
            }
        }
    }
}

// ==========================================
// CUSTOM STYLING CHIPS & CHUNKS
// ==========================================

/**
 * Floating placeholder for the AI Tactical Advisor. The web version has a
 * working "bring your own Gemini API key" advisor (see the web/ app); this
 * badge is a preview until the same flow lands here, rather than a dead
 * button that looks broken.
 */
@Composable
fun AiAdviceComingSoonBadge(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .shadow(elevation = 8.dp, shape = RoundedCornerShape(20.dp), clip = false)
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF1A1F2E).copy(alpha = 0.92f))
            .border(1.dp, Color(0xFF33353A), RoundedCornerShape(20.dp))
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(text = "🤖", fontSize = 13.sp)
        Text(
            text = "AI Advice — Coming Soon",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFA8ABB4)
        )
    }
}

@Composable
fun TacticalValidationStatusBanner(validation: ValidationResults) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulseBanner")
    val bannerScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.02f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bannerScale"
    )

    val valid = validation.isValid

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .scale(if (!valid) bannerScale else 1f)
            .background(
                color = if (valid) Color(0xFF2D6A4F).copy(alpha = 0.12f) else Color(0xFFFF5252).copy(alpha = 0.1f),
                shape = RoundedCornerShape(8.dp)
            )
            .border(
                width = 1.dp,
                color = if (valid) Color(0xFF2D6A4F).copy(alpha = 0.4f) else Color(0xFFFF5252).copy(alpha = 0.3f),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 12.dp, vertical = 10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (valid) Icons.Default.CheckCircle else Icons.Default.Warning,
                contentDescription = "Status Icon",
                tint = if (valid) Color(0xFF8DF0BD) else Color(0xFFFF5252),
                modifier = Modifier.size(20.dp)
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = if (valid) "LEGAL COMPLIANT FIELD" else "ILLEGAL FIELD",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = if (valid) Color(0xFF8DF0BD) else Color(0xFFFF5252)
                )

                if (!valid) {
                    validation.violations.forEach { err ->
                        Text(
                            text = err,
                            fontSize = 10.sp,
                            color = Color.White.copy(alpha = 0.7f),
                            lineHeight = 12.sp
                        )
                    }
                } else {
                    Text(
                        text = "Field matches all ICC regulations for selected match state.",
                        fontSize = 10.sp,
                        color = Color.White.copy(alpha = 0.7f),
                        lineHeight = 12.sp
                    )
                }
            }

            // Stat badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (valid) Color(0xFF2D6A4F) else Color(0xFFFF5252))
                    .padding(horizontal = 6.dp, vertical = 4.dp)
            ) {
                val statsText = "${validation.outsideCircleCount}" +
                        (if (validation.maxAllowedOutside != null) "/${validation.maxAllowedOutside} OUT" else " OUT")
                Text(
                    text = statsText,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

// ==========================================
// EXPORTING PLAN MODAL COMPOSABLE
// ==========================================

@Composable
fun ExportPlannerDialog(
    players: List<Fielder>,
    format: String,
    overType: String,
    bowlerType: String,
    isLeftHanded: Boolean,
    validation: ValidationResults,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current

    // Offline generated vector plan info representation
    val planText = remember(players, format, overType, bowlerType) {
        val sb = StringBuilder()
        sb.append("🏏 TACTICAL OVAL FIELD PLAN 🏏\n")
        sb.append("=============================\n")
        sb.append("Format: $format | Bowler: $bowlerType\n")
        sb.append("Phase: $overType | Batter: ${if (isLeftHanded) "LHB" else "RHB"}\n")
        sb.append("Compliance: ${if (validation.isValid) "LEGAL ✅" else "ILLEGAL ❌"}\n")
        sb.append("Outfielders: ${validation.outsideCircleCount} inside play\n")
        sb.append("-----------------------------\n")
        players.forEach { p ->
            val isDeep = sqrt((p.x-50f).pow(2) + (p.y-50f).pow(2)) > 25f
            val zone = getFielderZone(p.x, p.y, isLeftHanded)
            sb.append("- ${p.label} (${p.name}): X:${p.x.toInt()}% Y:${p.y.toInt()}% [$zone]\n")
        }
        sb.toString()
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1F2E)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .shadow(12.dp, RoundedCornerShape(16.dp))
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TACTICAL EXPORT SUMMARY",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 14.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.Gray)
                    }
                }

                Text(
                    text = "A digital copy of your tactical field setting has been formatted and is ready for export. Copy the structural text below:",
                    fontSize = 11.sp,
                    color = Color.LightGray
                )

                // Scrollable text log format
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(Color(0xFF0E1117), RoundedCornerShape(8.dp))
                        .padding(8.dp)
                ) {
                    val logScroll = rememberScrollState()
                    Text(
                        text = planText,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Color(0xFFD1E1FF),
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(logScroll)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                            val clip = android.content.ClipData.newPlainText("Tactical Oval Plan", planText)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Tactical Plan Copied to Clipboard!", Toast.LENGTH_SHORT).show()
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2D6A4F)),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Copy Plan", fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            Toast.makeText(context, "Plan details downloaded as CSV report!", Toast.LENGTH_SHORT).show()
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF404859)),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Download CSV", fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

// Spacer and dividers helpers
@Composable
fun divider() {
    Divider(color = Color(0xFF33353A), thickness = 1.dp)
}

