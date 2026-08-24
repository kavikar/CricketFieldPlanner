import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getFielderZone } from "../lib/validation";
import ValidationBanner from "./ValidationBanner";

interface PresetChip {
  label: string;
  bowlerType: BowlerType;
  overType: OverType;
  format: Format;
}

const PRESET_CHIPS: PresetChip[] = [
  { label: "Pace - Powerplay", bowlerType: "Pace", overType: "Powerplay", format: "T20" },
  { label: "Pace - Death Block", bowlerType: "Pace", overType: "Death", format: "T20" },
  { label: "Spin - Attacking", bowlerType: "Spin", overType: "Death", format: "Test" },
  { label: "Spin - Defensive", bowlerType: "Spin", overType: "Non-Powerplay", format: "T20" },
  { label: "ODI - Mid-Overs", bowlerType: "Pace", overType: "Non-Powerplay", format: "ODI" },
];

interface Props {
  format: Format;
  overType: OverType;
  bowlerType: BowlerType;
  isLeftHanded: boolean;
  validation: ValidationResult;
  players: Fielder[];
  selectedPlayerId: string | null;
  onFormatChanged: (f: Format) => void;
  onOverTypeChanged: (o: OverType) => void;
  onBowlerTypeChanged: (b: BowlerType) => void;
  onPresetSelected: (b: BowlerType, o: OverType, f: Format) => void;
  onMirrorToggled: (v: boolean) => void;
  onReset: () => void;
  onTriggerExport: () => void;
  onTriggerAdvisor: () => void;
  onSaveClicked: (slot: number) => void;
  onLoadClicked: (serialized: string) => void;
  onClearPreset: (slot: number) => void;
  customPresets: (string | null)[];
}

export default function ControlsPanel({
  format,
  overType,
  bowlerType,
  isLeftHanded,
  validation,
  players,
  selectedPlayerId,
  onFormatChanged,
  onOverTypeChanged,
  onBowlerTypeChanged,
  onPresetSelected,
  onMirrorToggled,
  onReset,
  onTriggerExport,
  onTriggerAdvisor,
  onSaveClicked,
  onLoadClicked,
  onClearPreset,
  customPresets,
}: Props) {
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  return (
    <div className="controls-panel">
      <ValidationBanner validation={validation} />

      {selectedPlayer && (
        <div className="inspector-card">
          <div className="inspector-header">
            <span className={selectedPlayer.isWK ? "inspector-name wk" : "inspector-name"}>
              SELECTED: {selectedPlayer.name} ({selectedPlayer.label})
            </span>
            {validation.illegalFielderIds.has(selectedPlayer.id) && (
              <span className="inspector-violation">⚠️ VIOLATION</span>
            )}
          </div>
          <div className="inspector-detail">
            Current Zone: {getFielderZone(selectedPlayer.x, selectedPlayer.y, isLeftHanded)}
          </div>
          <div className="inspector-coords">
            Coords: X: {Math.round(selectedPlayer.x)}% | Y: {Math.round(selectedPlayer.y)}%
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-label">MATCH FORMAT</div>
        <div className="tab-row pill">
          {(["T20", "ODI", "Test"] as Format[]).map((fmt) => (
            <button
              key={fmt}
              className={`tab ${format === fmt ? "active" : ""}`}
              onClick={() => onFormatChanged(fmt)}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <div className="section flex-13">
          <div className="section-label">PHASE</div>
          {format === "Test" ? (
            <div className="static-box">Free Positioning</div>
          ) : (
            <div className="tab-row rounded">
              {(["Powerplay", "Non-Powerplay", "Death"] as OverType[]).map((type) => (
                <button
                  key={type}
                  className={`tab small ${overType === type ? "active" : ""}`}
                  onClick={() => onOverTypeChanged(type)}
                >
                  {type === "Powerplay" ? "PP1" : type === "Non-Powerplay" ? "PP2" : "PP3"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="section flex-1">
          <div className="section-label">STYLE</div>
          <div className="tab-row rounded">
            {(["Pace", "Spin"] as BowlerType[]).map((profile) => (
              <button
                key={profile}
                className={`tab small ${bowlerType === profile ? "active" : ""}`}
                onClick={() => onBowlerTypeChanged(profile)}
              >
                {profile}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="switch-row">
        <div>
          <div className="switch-title">Left-Hand Batter (Mirror)</div>
          <div className="switch-subtitle">Swaps off-side and leg-side channels</div>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={isLeftHanded}
            onChange={(e) => onMirrorToggled(e.target.checked)}
          />
          <span className="switch-track" />
        </label>
      </div>

      <div className="section">
        <div className="section-label">PREDEFINED TACTICAL PRESETS</div>
        <div className="chip-row">
          {PRESET_CHIPS.map((chip) => {
            const isSelected = bowlerType === chip.bowlerType && overType === chip.overType;
            return (
              <button
                key={chip.label}
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => onPresetSelected(chip.bowlerType, chip.overType, chip.format)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="section-label">CUSTOM PRESET SLOTS (LOCAL)</div>
      <div className="slot-list">
        {[1, 2, 3].map((slotIdx) => {
          const preset = customPresets[slotIdx - 1];
          const hasPreset = preset != null;
          return (
            <div key={slotIdx} className="slot-row">
              <div>
                <div className="slot-title">Memory Slot #{slotIdx}</div>
                <div className={hasPreset ? "slot-subtitle saved" : "slot-subtitle"}>
                  {hasPreset ? "Tactical Saved Preset" : "Empty Memory Log"}
                </div>
              </div>
              <div className="slot-actions">
                {hasPreset ? (
                  <>
                    <button className="btn-mini btn-load" onClick={() => onLoadClicked(preset!)}>
                      LOAD
                    </button>
                    <button className="icon-btn danger" onClick={() => onClearPreset(slotIdx)} aria-label="Delete preset">
                      🗑
                    </button>
                  </>
                ) : (
                  <button className="btn-mini btn-save" onClick={() => onSaveClicked(slotIdx)}>
                    SAVE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider" />

      <div className="footer-row">
        <button className="btn btn-secondary" onClick={onTriggerAdvisor}>
          🤖 AI Advice
        </button>
        <button className="btn btn-primary" onClick={onTriggerExport}>
          Export Plan
        </button>
        <button className="btn btn-outline" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
