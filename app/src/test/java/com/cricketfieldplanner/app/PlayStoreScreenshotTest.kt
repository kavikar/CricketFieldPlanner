package com.cricketfieldplanner.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.unit.dp
import com.cricketfieldplanner.app.ui.theme.MyApplicationTheme
import com.github.takahirom.roborazzi.RobolectricDeviceQualifiers
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = RobolectricDeviceQualifiers.Pixel8, sdk = [36])
class PlayStoreScreenshotTest {

  @get:Rule val composeTestRule = createComposeRule()

  // Play Console rejects a screenshot whose longer side is more than 2x the shorter side.
  // The Pixel 8's full-height 412x915dp viewport renders at ~1078x2399px (ratio ~2.22), which
  // fails that check. Cropping to 412x780dp keeps width fixed (so the UI isn't rescaled) while
  // bringing the rendered ratio to ~1.89, comfortably under the 2x limit.
  private val screenshotSize = Modifier.size(412.dp, 780.dp)

  @Test
  fun screenshot_1_t20_powerplay() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = true, dynamicColor = false) {
        CricketFieldPlannerApp(
          modifier = screenshotSize
            .background(Color(0xFF0E1117))
        )
      }
    }

    composeTestRule.waitForIdle()
    composeTestRule.onRoot().captureRoboImage(filePath = "../assets/playstore_screenshots/playstore_screenshot_1_t20_powerplay.png")
  }

  @Test
  fun screenshot_2_spin_tactics() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = true, dynamicColor = false) {
        CricketFieldPlannerApp(
          modifier = screenshotSize
            .background(Color(0xFF0E1117))
        )
      }
    }

    composeTestRule.onNodeWithTag("tab_bowler_Spin").performClick()
    composeTestRule.waitForIdle()
    composeTestRule.onRoot().captureRoboImage(filePath = "../assets/playstore_screenshots/playstore_screenshot_2_spin_tactics.png")
  }

  @Test
  fun screenshot_3_death_overs() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = true, dynamicColor = false) {
        CricketFieldPlannerApp(
          modifier = screenshotSize
            .background(Color(0xFF0E1117))
        )
      }
    }

    composeTestRule.onNodeWithTag("tab_over_Death").performClick()
    composeTestRule.waitForIdle()
    composeTestRule.onRoot().captureRoboImage(filePath = "../assets/playstore_screenshots/playstore_screenshot_3_death_overs.png")
  }

  @Test
  fun screenshot_4_left_hand_mirror() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = true, dynamicColor = false) {
        CricketFieldPlannerApp(
          modifier = screenshotSize
            .background(Color(0xFF0E1117))
        )
      }
    }

    composeTestRule.onNodeWithTag("lh_switch").performClick()
    composeTestRule.waitForIdle()
    composeTestRule.onRoot().captureRoboImage(filePath = "../assets/playstore_screenshots/playstore_screenshot_4_left_hand_mirror.png")
  }
}


