import type { BowlerType, Fielder, OverType, Format, PresetInfo } from "../types";
import { anchor, BOWLER_SPOT, KEEPER_SPOT_PACE, KEEPER_SPOT_SPIN } from "../lib/positions";
import { BOWLER_ID, defaultName, FIELDER_SLOT_IDS, KEEPER_ID } from "../lib/roster";

/**
 * Each preset is nine canonical fielding positions — the bowler and keeper are
 * added automatically, so every field is a legal eleven.
 *
 * Positions are named rather than hand-placed so a preset can never drift out
 * of sync with what the app calls that spot; coordinates come from the single
 * anchor table in lib/positions.ts.
 */
type PresetSpec = readonly [string, string, string, string, string, string, string, string, string];

const PACE_POWERPLAY: PresetSpec = [
  "1st Slip", "2nd Slip", "Cover Point", "Cover", "Mid-off",
  "Mid-on", "Square Leg", "Fine Leg", "Third Man",
];

const PACE_NON_POWERPLAY: PresetSpec = [
  "1st Slip", "Mid-off", "Short Fine Leg", "Midwicket", "Third Man",
  "Deep Point", "Deep Cover", "Long-off", "Long-on",
];

const PACE_DEATH: PresetSpec = [
  "Short Fine Leg", "Mid-off", "Midwicket", "Point", "Deep Backward Square Leg",
  "Long-on", "Long-off", "Deep Cover", "Third Man",
];

const SPIN_POWERPLAY: PresetSpec = [
  "1st Slip", "Silly Mid-on", "Cover", "Mid-off", "Mid-on",
  "Point", "Square Leg", "Fine Leg", "Third Man",
];

const SPIN_NON_POWERPLAY: PresetSpec = [
  "1st Slip", "Silly Mid-on", "Cover", "Mid-on", "Fine Leg",
  "Long-on", "Long-off", "Deep Point", "Deep Cover",
];

const SPIN_DEATH: PresetSpec = [
  "1st Slip", "2nd Slip", "Leg Slip", "Short Leg", "Mid-on",
  "Mid-off", "Point", "Fine Leg", "Long-on",
];

/** Build the full eleven: fixed bowler, keeper positioned for the bowling type, nine fielders. */
function buildField(spec: PresetSpec, bowlerType: BowlerType): Fielder[] {
  const keeperSpot = bowlerType === "Spin" ? KEEPER_SPOT_SPIN : KEEPER_SPOT_PACE;

  const eleven: Fielder[] = [
    { id: BOWLER_ID, role: "bowler", name: defaultName(BOWLER_ID), x: BOWLER_SPOT.x, y: BOWLER_SPOT.y },
    { id: KEEPER_ID, role: "keeper", name: defaultName(KEEPER_ID), x: keeperSpot.x, y: keeperSpot.y },
  ];

  spec.forEach((positionName, i) => {
    const slotId = FIELDER_SLOT_IDS[i];
    const spot = anchor(positionName);
    eleven.push({ id: slotId, role: "fielder", name: defaultName(slotId), x: spot.x, y: spot.y });
  });

  return eleven;
}

export function getPreset(bowlerType: BowlerType, overType: OverType, _format: Format): Fielder[] {
  if (bowlerType === "Spin") {
    if (overType === "Powerplay") return buildField(SPIN_POWERPLAY, bowlerType);
    if (overType === "Death") return buildField(SPIN_DEATH, bowlerType);
    return buildField(SPIN_NON_POWERPLAY, bowlerType);
  }
  if (overType === "Powerplay") return buildField(PACE_POWERPLAY, bowlerType);
  if (overType === "Death") return buildField(PACE_DEATH, bowlerType);
  return buildField(PACE_NON_POWERPLAY, bowlerType);
}

export function getPresetInfo(
  bowlerType: BowlerType,
  overType: OverType,
  format: Format,
): PresetInfo {
  const phase = format === "T20" ? "T20" : format === "ODI" ? "ODI" : "Test";

  if (bowlerType === "Pace" && overType === "Powerplay") {
    return {
      title: "Pace Powerplay — Slip Cordon Attack",
      summary:
        "Swing-bowling powerplay field hunting the edge, with two slips behind the bat. Exactly 2 fielders outside the circle, the maximum the powerplay allows.",
      advantages: [
        "Two slips take every edge that carries",
        "Cover and Cover Point shut down the off-side drive",
        "Mid-off and Mid-on stay in catching range for the full ball",
        "Fine Leg and Third Man cover both boundaries behind square",
      ],
      disadvantages: [
        "No midwicket — the leg-side flick scores freely",
        "Only two boundary riders, so anything short is expensive",
        "Square leg is isolated if the batter works it fine",
      ],
    };
  }

  if (bowlerType === "Pace" && overType === "Non-Powerplay") {
    return {
      title: `Pace ${phase} Middle Overs — Containment`,
      summary:
        "Balanced middle-overs field: a lone slip keeps the edge in play while five boundary riders guard every scoring arc.",
      advantages: [
        "Long-off and Long-on seal the straight hitting corridor",
        "Deep Point, Deep Cover and Third Man protect the wide off side",
        "A single slip keeps edge-catching alive with any seam movement",
        "Short Fine Leg cuts off the glance for a single",
      ],
      disadvantages: [
        "The midwicket boundary is unguarded — the slog sweep pays",
        "One slip only, so a thick edge through the vacant cordon runs away",
        "Infield is thin; batters can rotate strike almost at will",
      ],
    };
  }

  if (bowlerType === "Pace" && overType === "Death") {
    return {
      title: "Pace Death Overs — Boundary Fortress",
      summary:
        "Five boundary riders on the rope for the closing overs, with four in the ring to take the mis-hit off a yorker.",
      advantages: [
        "Five riders cover the straight, square and fine arcs",
        "Short Fine Leg stops the scoop and the inside edge",
        "Midwicket and Point stay up for the mistimed drive",
        "Deep Backward Square Leg covers the pull",
      ],
      disadvantages: [
        "Huge gaps in the ring — ones and twos are there for the taking",
        "No slip, so an edge behind square goes unpunished",
        "Two fielders behind square on the leg side is the legal limit; no room to adjust",
      ],
    };
  }

  if (bowlerType === "Spin" && overType === "Powerplay") {
    return {
      title: "Spin Powerplay — Close-Catching Trap",
      summary:
        "Spin inside the powerplay with the keeper up to the stumps. Silly Mid-on applies close pressure while a slip covers the edge.",
      advantages: [
        "Keeper up to the stumps pins the batter in the crease",
        "Silly Mid-on takes the bat-pad chance",
        "Slip covers the edge off turn and bounce",
        "Surprise value against a batter set for pace",
      ],
      disadvantages: [
        "Fine Leg and Third Man are the only boundary cover — width is punished",
        "Nothing deep on the leg side for the slog sweep",
        "Demands real accuracy; a short ball disappears",
      ],
    };
  }

  if (bowlerType === "Spin" && overType === "Non-Powerplay") {
    return {
      title: `Spin ${phase} Middle Overs — Control Web`,
      summary:
        "Classic spin control field: close catcher in, five out, forcing the batter to take a risk to score.",
      advantages: [
        "Five boundary riders seal Long-on, Long-off, Fine Leg, Deep Point and Deep Cover",
        "Silly Mid-on keeps the bat-pad chance alive",
        "Lone slip stays in for the edge against the turn",
        "Mid-on plugs the straight single",
      ],
      disadvantages: [
        "Midwicket boundary is open to the sweep",
        "The slip costs a fielder in the ring",
        "Only works with a tight line — a rank ball is a boundary",
      ],
    };
  }

  if (bowlerType === "Spin" && overType === "Death") {
    const isTest = format === "Test";
    return {
      title: isTest
        ? "Spin Test Match — Aggressive Catching Cordon"
        : "Spin Death Overs — Close Catcher Attack",
      summary: isTest
        ? "High-risk Test field with catchers ringed around the bat — keeper up, two slips, Leg Slip and Short Leg. For a surface that is turning sharply."
        : "Attacking spin field for the death, backing close catchers over boundary protection. High risk, high reward.",
      advantages: [
        "Two slips plus Leg Slip cover every edge behind the wicket",
        "Short Leg takes the bat-pad chance on the turn",
        "Mid-on and Mid-off catch the chip and the top edge",
        "Point cuts off the cut and the square drive",
      ],
      disadvantages: isTest
        ? [
            "Only Fine Leg and Long-on on the rope — any clean hit finds the fence",
            "Needs sharp catching from every close fielder",
            "Five on the leg side is the legal maximum; the field cannot shift further",
          ]
        : [
            "Boundary cover is minimal — a set batter will target the gaps",
            "Requires exceptional accuracy to keep the pressure on",
            "One loose ball swings the over",
          ],
    };
  }

  return {
    title: "Custom Formation",
    summary: "A custom field. Test matches apply no circle restrictions.",
    advantages: ["Fully flexible positioning — no circle limitations in Test cricket"],
    disadvantages: ["Check the limited-overs restrictions before using this in T20 or ODI"],
  };
}
