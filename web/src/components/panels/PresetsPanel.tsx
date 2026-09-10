import type { BowlerType, Format, OverType } from "../../types";
import { CUSTOM_SLOT_COUNT } from "../../lib/storage";

interface PresetChoice {
  key: string;
  title: string;
  detail: string;
  bowlerType: BowlerType;
  overType: OverType;
}

const CHOICES: PresetChoice[] = [
  { key: "pace-pp", title: "Pace · Powerplay", detail: "Two slips, 2 out", bowlerType: "Pace", overType: "Powerplay" },
  { key: "pace-mid", title: "Pace · Middle", detail: "Containment, 5 out", bowlerType: "Pace", overType: "Non-Powerplay" },
  { key: "pace-death", title: "Pace · Death", detail: "Boundary fortress", bowlerType: "Pace", overType: "Death" },
  { key: "spin-pp", title: "Spin · Powerplay", detail: "Close-catching trap", bowlerType: "Spin", overType: "Powerplay" },
  { key: "spin-mid", title: "Spin · Middle", detail: "Control web", bowlerType: "Spin", overType: "Non-Powerplay" },
  { key: "spin-death", title: "Spin · Attack", detail: "Close catchers", bowlerType: "Spin", overType: "Death" },
];

interface Props {
  format: Format;
  bowlerType: BowlerType;
  overType: OverType;
  customPresets: (string | null)[];
  onPresetSelected: (b: BowlerType, o: OverType, f: Format) => void;
  onSaveClicked: (slot: number) => void;
  onLoadClicked: (serialized: string) => void;
  onClearPreset: (slot: number) => void;
}

export default function PresetsPanel({
  format,
  bowlerType,
  overType,
  customPresets,
  onPresetSelected,
  onSaveClicked,
  onLoadClicked,
  onClearPreset,
}: Props) {
  return (
    <div className="panel">
      <section className="card">
        <h2 className="card-label">Standard fields</h2>
        <div className="preset-grid">
          {CHOICES.map((c) => {
            const isActive = c.bowlerType === bowlerType && c.overType === overType;
            return (
              <button
                key={c.key}
                className={`preset-card ${isActive ? "is-active" : ""}`}
                onClick={() => onPresetSelected(c.bowlerType, c.overType, format)}
              >
                <span className="preset-card-title">{c.title}</span>
                <span className="preset-card-detail">{c.detail}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="card-label">My fields</h2>
        <p className="card-hint">
          {CUSTOM_SLOT_COUNT} slots, saved in this browser.
        </p>
        <ul className="slot-list">
          {customPresets.map((data, i) => {
            const slot = i + 1;
            return (
              <li key={slot} className="slot">
                <div className="slot-info">
                  <span className="slot-name">Slot {slot}</span>
                  <span className={`slot-state ${data ? "is-filled" : ""}`}>
                    {data ? "Saved" : "Empty"}
                  </span>
                </div>
                <div className="slot-actions">
                  {data ? (
                    <>
                      <button className="btn btn-sm" onClick={() => onLoadClicked(data)}>
                        Load
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => onClearPreset(slot)}
                        aria-label={`Clear slot ${slot}`}
                      >
                        Clear
                      </button>
                    </>
                  ) : null}
                  <button className="btn btn-sm btn-primary" onClick={() => onSaveClicked(slot)}>
                    Save
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
