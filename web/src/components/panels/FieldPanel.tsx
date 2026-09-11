import type { BowlerType, Fielder, OverType, Format, PresetInfo, ValidationResult } from "../../types";
import { describePosition, isOutsideCircle } from "../../lib/positions";

interface Props {
  format: Format;
  overType: OverType;
  bowlerType: BowlerType;
  isLeftHanded: boolean;
  presetInfo: PresetInfo;
  validation: ValidationResult;
  selectedPlayer: Fielder | null;
  onOverTypeChanged: (o: OverType) => void;
  onBowlerTypeChanged: (b: BowlerType) => void;
}

/** T20 is the primary format, so phases are labelled the way a T20 captain thinks. */
function phaseLabel(overType: OverType, format: Format): string {
  if (format === "Test") return overType === "Powerplay" ? "Attacking" : "Standard";
  if (overType === "Powerplay") return "Powerplay";
  if (overType === "Death") return "Death";
  return "Middle";
}

const PHASES: OverType[] = ["Powerplay", "Non-Powerplay", "Death"];
const BOWLER_TYPES: BowlerType[] = ["Pace", "Spin"];

export default function FieldPanel({
  format,
  overType,
  bowlerType,
  isLeftHanded,
  presetInfo,
  validation,
  selectedPlayer,
  onOverTypeChanged,
  onBowlerTypeChanged,
}: Props) {
  return (
    <div className="panel">
      <section className="card">
        <h2 className="card-label">Phase</h2>
        <div className="segmented">
          {PHASES.map((p) => (
            <button
              key={p}
              className={`seg ${overType === p ? "is-active" : ""}`}
              onClick={() => onOverTypeChanged(p)}
            >
              {phaseLabel(p, format)}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-label">Bowling</h2>
        <div className="segmented">
          {BOWLER_TYPES.map((b) => (
            <button
              key={b}
              className={`seg ${bowlerType === b ? "is-active" : ""}`}
              onClick={() => onBowlerTypeChanged(b)}
            >
              {b}
            </button>
          ))}
        </div>
        <p className="card-hint">
          {bowlerType === "Spin"
            ? "Keeper stands up to the stumps."
            : "Keeper stands back."}
        </p>
      </section>

      {selectedPlayer && (
        <section className="card card-accent">
          <h2 className="card-label">Selected</h2>
          <div className="selected-name">{selectedPlayer.name}</div>
          <div className="selected-position">
            {describePosition(selectedPlayer, isLeftHanded)}
          </div>
          <div className="chip-row">
            <span className="chip">
              {isOutsideCircle(selectedPlayer.x, selectedPlayer.y) ? "Outside circle" : "Inside circle"}
            </span>
            {selectedPlayer.role !== "fielder" && <span className="chip">Fixed position</span>}
            {validation.illegalFielderIds.has(selectedPlayer.id) && (
              <span className="chip chip-danger">Breaks a rule</span>
            )}
          </div>
          {selectedPlayer.role === "fielder" && (
            <p className="card-hint">Drag to move, or use the arrow keys.</p>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="card-label">Tactic</h2>
        <div className="tactic-title">{presetInfo.title}</div>
        <p className="tactic-summary">{presetInfo.summary}</p>

        <h3 className="mini-label">Strengths</h3>
        <ul className="bullet-list">
          {presetInfo.advantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <h3 className="mini-label">Risks</h3>
        <ul className="bullet-list bullet-warn">
          {presetInfo.disadvantages.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
