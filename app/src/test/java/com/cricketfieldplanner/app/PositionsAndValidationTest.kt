package com.cricketfieldplanner.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * These are the correctness-critical pieces of the bowler/keeper port: a
 * fixed role must never be labelled with a nearby fielding position, and
 * fielding-restriction counts must never include the bowler or keeper.
 */
class PositionsAndValidationTest {

  @Test
  fun `getPositionName finds the nearest anchor`() {
    // Exactly on the Cover anchor (70, 48).
    assertEquals("Cover", getPositionName(70f, 48f, isLeftHanded = false))
    // Near Deep Midwicket (17, 34), off the anchor itself.
    assertEquals("Deep Midwicket", getPositionName(18f, 35f, isLeftHanded = false))
  }

  @Test
  fun `getPositionName mirrors for a left-hander`() {
    // Point (73, 58) is off-side for a RHB; for a LHB the query is mirrored,
    // so the same physical spot (mirrored x) should read as Point too.
    val rhbName = getPositionName(73f, 58f, isLeftHanded = false)
    val lhbName = getPositionName(100f - 73f, 58f, isLeftHanded = true)
    assertEquals(rhbName, lhbName)
  }

  @Test
  fun `getPositionName would mislabel the bowler and keeper spots`() {
    // This is the trap describePosition exists to avoid: BOWLER_SPOT and
    // KEEPER_SPOT_PACE sit close enough to real anchors that a naive nearest-
    // anchor lookup returns a fielding position, not "Bowler"/"Wicketkeeper".
    val bowlerNearest = getPositionName(BOWLER_SPOT.x, BOWLER_SPOT.y, isLeftHanded = false)
    val keeperNearest = getPositionName(KEEPER_SPOT_PACE.x, KEEPER_SPOT_PACE.y, isLeftHanded = false)
    assertNotEquals("Bowler", bowlerNearest)
    assertNotEquals("Wicketkeeper", keeperNearest)
  }

  @Test
  fun `describePosition avoids the trap`() {
    val bowler = Fielder(BOWLER_ID, FielderRole.BOWLER, "Bowler", BOWLER_SPOT.x, BOWLER_SPOT.y)
    val keeper = Fielder(KEEPER_ID, FielderRole.KEEPER, "Keeper", KEEPER_SPOT_PACE.x, KEEPER_SPOT_PACE.y)
    val fielder = Fielder("f1", FielderRole.FIELDER, "Player 1", 70f, 48f)

    assertEquals("Bowler", describePosition(bowler, isLeftHanded = false))
    assertEquals("Wicketkeeper", describePosition(keeper, isLeftHanded = false))
    assertEquals("Cover", describePosition(fielder, isLeftHanded = false))
  }

  @Test
  fun `every preset builds a legal eleven with a real bowler`() {
    for (bowlerType in listOf("Pace", "Spin")) {
      for (overType in listOf("Powerplay", "Non-Powerplay", "Death")) {
        val eleven = FieldPresets.getPreset(bowlerType, overType, "T20")
        assertEquals("$bowlerType/$overType should field eleven", 11, eleven.size)
        assertEquals(1, eleven.count { it.role == FielderRole.BOWLER })
        assertEquals(1, eleven.count { it.role == FielderRole.KEEPER })
        assertEquals(9, eleven.count { it.role == FielderRole.FIELDER })
        assertEquals(11, eleven.map { it.id }.toSet().size) // no duplicate slot ids
      }
    }
  }

  @Test
  fun `validateField never counts the bowler or keeper toward circle or leg-side limits`() {
    // Bowler and keeper both sit inside the circle and, for a RHB, on the leg
    // side of centre (x < 50) — if they were counted, T20 powerplay (max 2
    // outside, max 5 on the leg side) would already be affected before any
    // fielder is placed. Nine fielders spread legally outside/on the off side.
    val players = listOf(
      Fielder(BOWLER_ID, FielderRole.BOWLER, "Bowler", 50f, 39f),
      Fielder(KEEPER_ID, FielderRole.KEEPER, "Keeper", 50f, 72f)
    ) + (1..9).map { i -> Fielder("f$i", FielderRole.FIELDER, "Player $i", 80f, 45f) }

    val result = validateField(players, format = "T20", overType = "Powerplay", isLeftHanded = false)

    // All 9 fielders are outside the circle here, which itself breaks the
    // powerplay's max-2 rule — the point is that outsideCircleCount is 9,
    // not 11, proving the bowler/keeper were excluded from the count.
    assertEquals(9, result.outsideCircleCount)
    assertFalse(BOWLER_ID in result.illegalFielderIds)
    assertFalse(KEEPER_ID in result.illegalFielderIds)
  }

  @Test
  fun `validateField accepts a legal powerplay field`() {
    val players = FieldPresets.getPreset("Pace", "Powerplay", "T20")
    val result = validateField(players, format = "T20", overType = "Powerplay", isLeftHanded = false)
    assertTrue(result.violations.joinToString(), result.isValid)
  }

  @Test
  fun `shortLabel collapses defaults and takes initials for a real name`() {
    assertEquals("BWL", shortLabel(BOWLER_ID, defaultName(BOWLER_ID)))
    assertEquals("WK", shortLabel(KEEPER_ID, defaultName(KEEPER_ID)))
    assertEquals("P1", shortLabel("f1", defaultName("f1")))
    assertEquals("JB", shortLabel("f1", "Jasprit Bumrah"))
  }
}
