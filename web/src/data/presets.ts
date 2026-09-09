import type { BowlerType, Fielder, OverType, Format } from "../types";

const PACE_POWERPLAY: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 72, isWK: true },
  { id: "sl1", name: "1st Slip", label: "SL1", x: 45, y: 61 },
  { id: "sl2", name: "2nd Slip", label: "SL2", x: 41, y: 63 },
  { id: "g", name: "Gully", label: "G", x: 36, y: 60 },
  { id: "p", name: "Point", label: "P", x: 28, y: 50 },
  { id: "c", name: "Cover", label: "C", x: 32, y: 40 },
  { id: "moff", name: "Mid-off", label: "MOff", x: 43, y: 35 },
  { id: "mon", name: "Mid-on", label: "MOn", x: 57, y: 35 },
  { id: "sl", name: "Square Leg", label: "SL", x: 68, y: 54 },
  { id: "fl", name: "Fine Leg (Deep)", label: "FL", x: 75, y: 78 },
  { id: "tm", name: "Third Man (Deep)", label: "TM", x: 24, y: 76 },
];

const PACE_NON_POWERPLAY: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 72, isWK: true },
  { id: "sl1", name: "1st Slip", label: "SL1", x: 45, y: 61 },
  { id: "moff", name: "Mid-off", label: "MOff", x: 43, y: 38 },
  { id: "sl", name: "Square Leg (Short)", label: "SL", x: 66, y: 56 },
  { id: "fl", name: "Fine Leg (Short)", label: "FL", x: 62, y: 68 },
  { id: "mw", name: "Midwicket", label: "MW", x: 63, y: 40 },
  { id: "dtm", name: "Deep Third Man", label: "DTM", x: 18, y: 76 },
  { id: "dp", name: "Deep Point", label: "DP", x: 12, y: 50 },
  { id: "dc", name: "Deep Cover", label: "DC", x: 18, y: 24 },
  { id: "loff", name: "Long-off", label: "LOff", x: 40, y: 10 },
  { id: "lon", name: "Long-on", label: "LOn", x: 60, y: 10 },
];

const PACE_DEATH: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 74, isWK: true },
  { id: "sfl", name: "Short Fine Leg", label: "SFL", x: 58, y: 65 },
  { id: "mo", name: "Mid-off (Catching)", label: "MO", x: 43, y: 38 },
  { id: "mw", name: "Midwicket", label: "MW", x: 63, y: 40 },
  { id: "p", name: "Point", label: "P", x: 28, y: 50 },
  { id: "c", name: "Cover", label: "C", x: 32, y: 40 },
  { id: "dsql", name: "Deep Square Leg", label: "DSQL", x: 82, y: 65 },
  { id: "lon", name: "Long-on", label: "LOn", x: 60, y: 10 },
  { id: "loff", name: "Long-off", label: "LOff", x: 40, y: 10 },
  { id: "dc", name: "Deep Cover", label: "DC", x: 18, y: 24 },
  { id: "tm", name: "Third Man (Deep)", label: "TM", x: 18, y: 76 },
];

const SPIN_POWERPLAY: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 59.5, isWK: true },
  { id: "sl1", name: "1st Slip", label: "SL1", x: 45, y: 61 },
  { id: "smon", name: "Silly Mid-on", label: "SMOn", x: 54, y: 52 },
  { id: "c", name: "Cover", label: "C", x: 30, y: 42 },
  { id: "moff", name: "Mid-off", label: "MOff", x: 43, y: 35 },
  { id: "mon", name: "Mid-on", label: "MOn", x: 57, y: 35 },
  { id: "p", name: "Point", label: "P", x: 28, y: 50 },
  { id: "sl", name: "Square Leg", label: "SL", x: 68, y: 54 },
  { id: "fl", name: "Fine Leg", label: "FL", x: 62, y: 68 },
  { id: "tm", name: "Deep Third Man", label: "TM", x: 18, y: 76 },
  { id: "dmw", name: "Deep Midwicket", label: "DMW", x: 80, y: 30 },
];

const SPIN_NON_POWERPLAY: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 59.5, isWK: true },
  { id: "sl1", name: "1st Slip", label: "SL1", x: 45, y: 61 },
  { id: "slg", name: "Short Leg", label: "SLg", x: 54, y: 57 },
  { id: "smon", name: "Silly Mid-on", label: "SMOn", x: 54, y: 52 },
  { id: "c", name: "Cover", label: "C", x: 30, y: 42 },
  { id: "fl", name: "Fine Leg", label: "FL", x: 62, y: 68 },
  { id: "lon", name: "Long-on", label: "LOn", x: 60, y: 10 },
  { id: "loff", name: "Long-off", label: "LOff", x: 40, y: 10 },
  { id: "dmw", name: "Deep Midwicket", label: "DMW", x: 80, y: 28 },
  { id: "dsl", name: "Deep Square Leg", label: "DSL", x: 82, y: 65 },
  { id: "dp", name: "Deep Point", label: "DP", x: 12, y: 50 },
];

const SPIN_DEATH: Fielder[] = [
  { id: "wk", name: "Wicketkeeper", label: "WK", x: 50, y: 59.5, isWK: true },
  { id: "sl1", name: "1st Slip", label: "SL1", x: 44, y: 61 },
  { id: "sl2", name: "2nd Slip", label: "SL2", x: 40, y: 63 },
  { id: "lsl", name: "Leg Slip", label: "LSl", x: 56, y: 61 },
  { id: "sp", name: "Silly Point", label: "SP", x: 44, y: 55 },
  { id: "slg", name: "Short Leg", label: "SLg", x: 54, y: 57 },
  { id: "mon", name: "Mid-on (Catching)", label: "MOn", x: 56, y: 44 },
  { id: "moff", name: "Mid-off (Catching)", label: "MOff", x: 44, y: 44 },
  { id: "p", name: "Point", label: "P", x: 28, y: 50 },
  { id: "fl", name: "Fine Leg", label: "FL", x: 62, y: 68 },
  { id: "lon", name: "Long-on (Deep)", label: "LOn", x: 60, y: 10 },
];

export function getPreset(
  bowlerType: BowlerType,
  overType: OverType,
  _format: Format,
): Fielder[] {
  if (bowlerType === "Pace") {
    if (overType === "Powerplay") return PACE_POWERPLAY;
    if (overType === "Non-Powerplay") return PACE_NON_POWERPLAY;
    if (overType === "Death") return PACE_DEATH;
    return PACE_POWERPLAY;
  }
  if (bowlerType === "Spin") {
    if (overType === "Powerplay") return SPIN_POWERPLAY;
    if (overType === "Non-Powerplay") return SPIN_NON_POWERPLAY;
    if (overType === "Death") return SPIN_DEATH;
    return SPIN_NON_POWERPLAY;
  }
  return [];
}
