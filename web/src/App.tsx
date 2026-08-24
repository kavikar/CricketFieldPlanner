import { useCallback, useMemo, useState } from "react";
import type { BowlerType, Fielder, Format, OverType } from "./types";
import { getPreset } from "./data/presets";
import { validateField } from "./lib/validation";
import {
  clearCustomPresetSlot,
  deserializeField,
  getCustomPresetSlot,
  serializeField,
  setCustomPresetSlot,
} from "./lib/storage";
import FieldCanvas from "./components/FieldCanvas";
import ControlsPanel from "./components/ControlsPanel";
import ExportDialog from "./components/ExportDialog";
import AdvisorDialog from "./components/AdvisorDialog";
import "./App.css";

function mirror(players: Fielder[]): Fielder[] {
  return players.map((p) => ({ ...p, x: 100 - p.x }));
}

export default function App() {
  const [format, setFormat] = useState<Format>("T20");
  const [overType, setOverType] = useState<OverType>("Powerplay");
  const [bowlerType, setBowlerType] = useState<BowlerType>("Pace");
  const [isLeftHanded, setIsLeftHanded] = useState(false);

  const [players, setPlayers] = useState<Fielder[]>(() => getPreset("Pace", "Powerplay", "T20"));
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const [customPresets, setCustomPresets] = useState<(string | null)[]>(() => [
    getCustomPresetSlot(1),
    getCustomPresetSlot(2),
    getCustomPresetSlot(3),
  ]);

  const [showExport, setShowExport] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [saveSlotTarget, setSaveSlotTarget] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const validation = useMemo(
    () => validateField(players, format, overType, isLeftHanded),
    [players, format, overType, isLeftHanded],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2200);
  };

  const loadBasePreset = useCallback(
    (newBowler: BowlerType, newOver: OverType, newFormat: Format, leftHanded: boolean) => {
      let next = getPreset(newBowler, newOver, newFormat);
      if (leftHanded) next = mirror(next);
      setPlayers(next);
      setSelectedPlayerId(null);
    },
    [],
  );

  const handleFormatChanged = (f: Format) => {
    const prevFormat = format;
    setFormat(f);
    if (f === "Test") {
      setOverType("Non-Powerplay");
      loadBasePreset(bowlerType, "Non-Powerplay", f, isLeftHanded);
    } else if (prevFormat === "Test") {
      setOverType("Powerplay");
      loadBasePreset(bowlerType, "Powerplay", f, isLeftHanded);
    } else {
      loadBasePreset(bowlerType, overType, f, isLeftHanded);
    }
  };

  const handleOverTypeChanged = (o: OverType) => {
    setOverType(o);
    loadBasePreset(bowlerType, o, format, isLeftHanded);
  };

  const handleBowlerTypeChanged = (b: BowlerType) => {
    setBowlerType(b);
    loadBasePreset(b, overType, format, isLeftHanded);
  };

  const handlePresetSelected = (b: BowlerType, o: OverType, f: Format) => {
    setBowlerType(b);
    setOverType(o);
    setFormat(f);
    loadBasePreset(b, o, f, isLeftHanded);
  };

  const handleMirrorToggled = (v: boolean) => {
    setIsLeftHanded(v);
    setPlayers((prev) => mirror(prev));
  };

  const handleReset = () => {
    loadBasePreset(bowlerType, overType, format, isLeftHanded);
    showToast("Field Reset");
  };

  const handlePlayerPositionChanged = useCallback((id: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const handleSaveCustomPreset = (slot: number) => {
    const serialized = serializeField(players);
    setCustomPresetSlot(slot, serialized);
    setCustomPresets((prev) => prev.map((v, i) => (i === slot - 1 ? serialized : v)));
    showToast(`Saved Custom Preset ${slot}!`);
    setSaveSlotTarget(null);
  };

  const handleClearCustomPreset = (slot: number) => {
    clearCustomPresetSlot(slot);
    setCustomPresets((prev) => prev.map((v, i) => (i === slot - 1 ? null : v)));
    showToast(`Cleared Preset ${slot}`);
  };

  const handleLoadCustomPreset = (serialized: string) => {
    const loaded = deserializeField(serialized);
    if (loaded) {
      setPlayers(loaded);
      setSelectedPlayerId(null);
      showToast("Loaded Custom Preset successfully!");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="app-bar-left">
          <div className="app-logo">🏏</div>
          <div>
            <div className="app-title">FieldPlanner Pro</div>
            <div className="app-subtitle">{format === "Test" ? `${format} • NO LIMITS` : `${format} • ${overType}`}</div>
          </div>
        </div>
        <div className="app-bar-right">
          <button className="icon-btn round" onClick={() => setShowExport(true)} aria-label="Export">
            ⤴
          </button>
          <button
            className="icon-btn round"
            onClick={() => {
              handleReset();
            }}
            aria-label="Reset"
          >
            ↻
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="field-pane">
          <FieldCanvas
            players={players}
            selectedPlayerId={selectedPlayerId}
            validation={validation}
            isLeftHanded={isLeftHanded}
            onPlayerSelected={setSelectedPlayerId}
            onPlayerPositionChanged={handlePlayerPositionChanged}
          />
        </div>
        <div className="controls-pane">
          <ControlsPanel
            format={format}
            overType={overType}
            bowlerType={bowlerType}
            isLeftHanded={isLeftHanded}
            validation={validation}
            players={players}
            selectedPlayerId={selectedPlayerId}
            onFormatChanged={handleFormatChanged}
            onOverTypeChanged={handleOverTypeChanged}
            onBowlerTypeChanged={handleBowlerTypeChanged}
            onPresetSelected={handlePresetSelected}
            onMirrorToggled={handleMirrorToggled}
            onReset={handleReset}
            onTriggerExport={() => setShowExport(true)}
            onTriggerAdvisor={() => setShowAdvisor(true)}
            onSaveClicked={(slot) => setSaveSlotTarget(slot)}
            onLoadClicked={handleLoadCustomPreset}
            onClearPreset={handleClearCustomPreset}
            customPresets={customPresets}
          />
        </div>
      </main>

      {showExport && (
        <ExportDialog
          players={players}
          format={format}
          overType={overType}
          bowlerType={bowlerType}
          isLeftHanded={isLeftHanded}
          validation={validation}
          onDismiss={() => setShowExport(false)}
        />
      )}

      {showAdvisor && (
        <AdvisorDialog
          players={players}
          format={format}
          overType={overType}
          bowlerType={bowlerType}
          isLeftHanded={isLeftHanded}
          validation={validation}
          onDismiss={() => setShowAdvisor(false)}
        />
      )}

      {saveSlotTarget !== null && (
        <div className="modal-overlay" onClick={() => setSaveSlotTarget(null)}>
          <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Save Custom Slot {saveSlotTarget}</span>
            </div>
            <p className="modal-subtext">
              Save the current tactical layout into memory slot #{saveSlotTarget}?
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleSaveCustomPreset(saveSlotTarget)}>
                Confirm Save
              </button>
              <button className="btn btn-outline" onClick={() => setSaveSlotTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
