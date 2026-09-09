import type { BowlerType, Fielder, OverType, Format, PresetInfo } from "../types";

// Coordinate system: center=(50,50), bowling end=top(y≈0), striker end=bottom(y≈100)
// For RHB: off-side=left(x<50), leg-side=right(x>50)
// 30-yard circle radius=25, boundary radius≈46

const PACE_POWERPLAY: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",   label: "WK",   x: 50,  y: 72,   isWK: true },
  { id: "sl1",  name: "1st Slip",       label: "SL1",  x: 45,  y: 63  },
  { id: "sl2",  name: "2nd Slip",       label: "SL2",  x: 41,  y: 65  },
  { id: "g",    name: "Gully",          label: "G",    x: 37,  y: 61  },
  { id: "cp",   name: "Cover Point",    label: "CP",   x: 29,  y: 48  },
  { id: "c",    name: "Cover",          label: "C",    x: 33,  y: 39  },
  { id: "moff", name: "Mid-off",        label: "MOff", x: 43,  y: 34  },
  { id: "mon",  name: "Mid-on",         label: "MOn",  x: 57,  y: 34  },
  { id: "sl",   name: "Square Leg",     label: "SL",   x: 70,  y: 54  },
  { id: "fl",   name: "Fine Leg",       label: "FL",   x: 74,  y: 80  }, // outside ✓
  { id: "tm",   name: "Third Man",      label: "TM",   x: 22,  y: 78  }, // outside ✓
];

const PACE_NON_POWERPLAY: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",   label: "WK",   x: 50,  y: 72,   isWK: true },
  { id: "sl1",  name: "1st Slip",       label: "SL1",  x: 44,  y: 63  },
  { id: "moff", name: "Mid-off",        label: "MOff", x: 43,  y: 37  },
  { id: "ssl",  name: "Short Sq. Leg",  label: "SSL",  x: 68,  y: 55  },
  { id: "sfl",  name: "Short Fine Leg", label: "SFL",  x: 62,  y: 68  },
  { id: "mw",   name: "Midwicket",      label: "MW",   x: 64,  y: 40  },
  { id: "dtm",  name: "Deep Third Man", label: "DTM",  x: 15,  y: 78  }, // outside ✓
  { id: "dp",   name: "Deep Point",     label: "DP",   x: 10,  y: 50  }, // outside ✓
  { id: "dc",   name: "Deep Cover",     label: "DC",   x: 17,  y: 23  }, // outside ✓
  { id: "loff", name: "Long-off",       label: "LOff", x: 40,  y: 7   }, // outside ✓
  { id: "lon",  name: "Long-on",        label: "LOn",  x: 60,  y: 7   }, // outside ✓
];

const PACE_DEATH: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",     label: "WK",   x: 50,  y: 74,   isWK: true },
  { id: "sfl",  name: "Short Fine Leg",   label: "SFL",  x: 58,  y: 65  },
  { id: "moff", name: "Mid-off",          label: "MOff", x: 43,  y: 38  },
  { id: "mw",   name: "Midwicket",        label: "MW",   x: 63,  y: 40  },
  { id: "p",    name: "Point",            label: "P",    x: 29,  y: 50  },
  { id: "c",    name: "Cover",            label: "C",    x: 34,  y: 39  },
  { id: "dsl",  name: "Deep Square Leg",  label: "DSL",  x: 80,  y: 66  }, // outside ✓
  { id: "lon",  name: "Long-on",          label: "LOn",  x: 60,  y: 7   }, // outside ✓
  { id: "loff", name: "Long-off",         label: "LOff", x: 40,  y: 7   }, // outside ✓
  { id: "dc",   name: "Deep Cover",       label: "DC",   x: 16,  y: 25  }, // outside ✓
  { id: "tm",   name: "Third Man",        label: "TM",   x: 17,  y: 78  }, // outside ✓
];

const SPIN_POWERPLAY: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",  label: "WK",   x: 50,  y: 59.5, isWK: true },
  { id: "sl1",  name: "1st Slip",      label: "SL1",  x: 44,  y: 62  },
  { id: "smon", name: "Silly Mid-on",  label: "SMOn", x: 54,  y: 52  }, // on-side ✓
  { id: "slg",  name: "Short Leg",     label: "SLg",  x: 55,  y: 57  },
  { id: "c",    name: "Cover",         label: "C",    x: 29,  y: 42  },
  { id: "moff", name: "Mid-off",       label: "MOff", x: 43,  y: 34  },
  { id: "mon",  name: "Mid-on",        label: "MOn",  x: 57,  y: 34  },
  { id: "p",    name: "Point",         label: "P",    x: 27,  y: 50  },
  { id: "sl",   name: "Square Leg",    label: "SL",   x: 70,  y: 52  },
  { id: "fl",   name: "Fine Leg",      label: "FL",   x: 74,  y: 80  }, // outside ✓
  { id: "dtm",  name: "Deep Third Man",label: "DTM",  x: 21,  y: 78  }, // outside ✓
];

const SPIN_NON_POWERPLAY: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",  label: "WK",   x: 50,  y: 59.5, isWK: true },
  { id: "sl1",  name: "1st Slip",      label: "SL1",  x: 44,  y: 62  },
  { id: "slg",  name: "Short Leg",     label: "SLg",  x: 55,  y: 57  },
  { id: "smon", name: "Silly Mid-on",  label: "SMOn", x: 54,  y: 52  }, // on-side ✓
  { id: "c",    name: "Cover",         label: "C",    x: 30,  y: 42  },
  { id: "mon",  name: "Mid-on",        label: "MOn",  x: 57,  y: 36  },
  { id: "fl",   name: "Fine Leg",      label: "FL",   x: 72,  y: 80  }, // outside ✓
  { id: "lon",  name: "Long-on",       label: "LOn",  x: 60,  y: 7   }, // outside ✓
  { id: "loff", name: "Long-off",      label: "LOff", x: 40,  y: 7   }, // outside ✓
  { id: "dp",   name: "Deep Point",    label: "DP",   x: 12,  y: 50  }, // outside ✓
  { id: "dco",  name: "Deep Cover",    label: "DCo",  x: 17,  y: 25  }, // outside ✓
];

// Designed for Test match attacking spin — max close catchers, no circle restrictions
const SPIN_DEATH: Fielder[] = [
  { id: "wk",   name: "Wicketkeeper",     label: "WK",   x: 50,  y: 59.5, isWK: true },
  { id: "sl1",  name: "1st Slip",         label: "SL1",  x: 44,  y: 62  },
  { id: "sl2",  name: "2nd Slip",         label: "SL2",  x: 40,  y: 64  },
  { id: "lsl",  name: "Leg Slip",         label: "LSl",  x: 56,  y: 62  },
  { id: "sp",   name: "Silly Point",      label: "SP",   x: 44,  y: 56  },
  { id: "slg",  name: "Short Leg",        label: "SLg",  x: 55,  y: 57  },
  { id: "mon",  name: "Mid-on",           label: "MOn",  x: 57,  y: 44  },
  { id: "moff", name: "Mid-off",          label: "MOff", x: 43,  y: 44  },
  { id: "p",    name: "Point",            label: "P",    x: 27,  y: 50  },
  { id: "fl",   name: "Fine Leg",         label: "FL",   x: 73,  y: 80  }, // outside ✓
  { id: "lon",  name: "Long-on",          label: "LOn",  x: 60,  y: 8   }, // outside ✓
];

export function getPreset(
  bowlerType: BowlerType,
  overType: OverType,
  _format: Format,
): Fielder[] {
  if (bowlerType === "Pace") {
    if (overType === "Powerplay")    return PACE_POWERPLAY;
    if (overType === "Non-Powerplay") return PACE_NON_POWERPLAY;
    if (overType === "Death")        return PACE_DEATH;
    return PACE_POWERPLAY;
  }
  if (bowlerType === "Spin") {
    if (overType === "Powerplay")    return SPIN_POWERPLAY;
    if (overType === "Non-Powerplay") return SPIN_NON_POWERPLAY;
    if (overType === "Death")        return SPIN_DEATH;
    return SPIN_NON_POWERPLAY;
  }
  return [];
}

export function getPresetInfo(
  bowlerType: BowlerType,
  overType: OverType,
  format: Format,
): PresetInfo {
  if (bowlerType === "Pace" && overType === "Powerplay") {
    return {
      title: "Pace Powerplay — Slip Cordon Attack",
      summary:
        "Classic swing-bowling powerplay formation targeting edges and nicks with a triple slip cordon. Only 2 fielders outside the 30-yard circle as required by ICC rules.",
      advantages: [
        "Triple slip cordon (1st Slip, 2nd Slip, Gully) maximises edge-catch chances",
        "Cover Point & Cover cut off off-side drives in the V",
        "Mid-on & Mid-off in catching range for full and straight deliveries",
        "Fine Leg & Third Man protect the boundary on both sides",
      ],
      disadvantages: [
        "No mid-wicket — leg-side flicks and glances go unpunished",
        "Slip-heavy field is exposed if batter plays on the front foot",
        "Aggressive batters can freely target the square leg and cow-corner gaps",
      ],
    };
  }

  if (bowlerType === "Pace" && overType === "Non-Powerplay") {
    return {
      title: `Pace ${format === "ODI" ? "ODI" : "T20"} Mid-Overs — Containment`,
      summary:
        "Balanced mid-overs pace field: a lone slip preserves edge potential while five outfielders guard all four boundary zones. Infield pair pin the batter on the on-side.",
      advantages: [
        "Long-on & Long-off seal the straight hitting corridor",
        "Deep Point, Deep Cover & Deep Third Man protect the wide off-side",
        "Single slip keeps edge-catching alive with seam movement",
        "Short Square Leg & Short Fine Leg apply infield pressure on the on-side",
      ],
      disadvantages: [
        "Cow-corner / mid-wicket gap remains open for aggressive sweepers",
        "A single slip limits catching variety compared to powerplay",
        "Batters who hit straight early in the arc can exploit the mid-off gap",
      ],
    };
  }

  if (bowlerType === "Pace" && overType === "Death") {
    return {
      title: "Pace Death Overs — Boundary Fortress",
      summary:
        "Five-man boundary ring to concede as few fours and sixes as possible in the final overs. Infield pair placed to take catches off yorkers and full deliveries.",
      advantages: [
        "Five boundary riders cover all hitting arcs — Long-on, Long-off, Deep Cover, Deep Sq. Leg, Third Man",
        "Short Fine Leg stops the fine glance and inside edge",
        "Mid-wicket & Cover in catching position for full deliveries and mis-hits",
        "Point cuts off the late cut and square drive",
      ],
      disadvantages: [
        "Massive gaps in the infield — batters can run hard between the wickets",
        "No slip means edges behind square go unpunished",
        "Batters advancing down the track can loft into the mid-wicket gap",
      ],
    };
  }

  if (bowlerType === "Spin" && overType === "Powerplay") {
    return {
      title: "Spin Powerplay — Close-Catching Trap",
      summary:
        "Aggressive spin choice in the powerplay with WK standing up to the stumps. Short Leg and Silly Mid-on create an on-side catching cordon while a single slip covers the off-edge.",
      advantages: [
        "WK standing up pressures the batter — no back-cut or charging down the track",
        "Short Leg & Silly Mid-on trap the batter on the on-side with close catches",
        "Slip catches edges off turn and bounce into the cordon",
        "Surprise factor — unusual spin in powerplay can unsettle aggressive batters",
      ],
      disadvantages: [
        "Fine Leg & Third Man are the only boundary protection — any width gets punished",
        "Slog sweeps and big hits over mid-wicket are not covered",
        "Requires exceptional accuracy — a bad ball goes for maximum",
      ],
    };
  }

  if (bowlerType === "Spin" && overType === "Non-Powerplay") {
    return {
      title: `Spin ${format === "ODI" ? "ODI" : "T20"} Mid-Overs — Control Web`,
      summary:
        "Classic spin control field: Short Leg and Silly Mid-on apply close-catching pressure while five outfielders protect all boundary zones. Forces batters to play against the spin.",
      advantages: [
        "Short Leg & Silly Mid-on create an on-side catching trap for sweeps and flicks",
        "Five outfielders — Long-on, Long-off, Fine Leg, Deep Point, Deep Cover — seal the boundary",
        "Lone slip keeps edge-catching alive against turn",
        "Mid-on plugs the straight on-side for singles and low catches",
      ],
      disadvantages: [
        "Mid-wicket and cow-corner gaps exposed to big hitters",
        "Slip takes a fielder away from the outfield — one boundary zone thinner",
        "Effective only with consistent line and length from the spinner",
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
        ? "High-risk Test match formation with five close catchers creating a 360° cordon — WK standing up, two slips, Leg Slip, Silly Point and Short Leg. Best used when the surface is spinning sharply."
        : "An attacking spin field for death overs using close catchers and two boundary riders. High-risk, high-reward — works best when the spinner can land the ball on a precise spot.",
      advantages: [
        "Double slip cordon (1st & 2nd Slip) + Leg Slip covers all edges behind the wicket",
        "Silly Point & Short Leg create a 360° catching trap around the batter",
        "Mid-on & Mid-off catch drives, chips and top-edges off the pitch",
        "Point cuts off the late cut and square drive",
      ],
      disadvantages: isTest
        ? [
            "Only Fine Leg & Long-on on the boundary — any big hit finds the fence",
            "Requires sharp catching from all five close fielders",
            "Not suitable for T20/ODI death overs — violates fielding circle restrictions",
          ]
        : [
            "Boundary exposure is high — aggressive batters will target the outfield",
            "Requires exceptional accuracy from the spinner to maintain pressure",
            "A single bad delivery can change the momentum of the over",
          ],
    };
  }

  return {
    title: "Custom Formation",
    summary: "A custom or Test-match field with no fielding restrictions applied.",
    advantages: ["Fully flexible positioning — no circle or boundary limitations"],
    disadvantages: ["Not suitable for limited-overs formats without adjustments"],
  };
}
