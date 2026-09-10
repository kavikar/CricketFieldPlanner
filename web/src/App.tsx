import { useCallback, useEffect, useMemo, useState } from "react";
import type { BowlerType, Fielder, Format, OverType, Roster } from "./types";
import { getPreset, getPresetInfo } from "./data/presets";
import { validateField } from "./lib/validation";
import { mirrorX } from "./lib/positions";
import { defaultRoster } from "./lib/roster";
import {
  clearCustomPresetSlot,
  CUSTOM_SLOT_COUNT,
  deserializeField,
  loadAllCustomSlots,
  loadRoster,
  saveRoster,
  serializeField,
  setCustomPresetSlot,
} from "./lib/storage";
import FieldCanvas from "./components/FieldCanvas";
import AppDrawer from "./components/AppDrawer";
import BottomTabs, { type TabId } from "./components/BottomTabs";
import FieldPanel from "./components/panels/FieldPanel";
import PresetsPanel from "./components/panels/PresetsPanel";
import SquadPanel from "./components/panels/SquadPanel";
import RulesPanel from "./components/panels/RulesPanel";
import ExportDialog from "./components/ExportDialog";
import AdvisorDialog from "./components/AdvisorDialog";
import BetaSignupDialog from "./components/BetaSignupDialog";
import BetaBanner from "./components/BetaBanner";
import { dismissBetaBanner, hasDismissedBetaBanner } from "./lib/betaSignup";
import "./App.css";

/** Mirror the whole field when the batter's handedness changes. */
function mirrorField(players: Fielder[]): Fielder[] {
  return players.map((p) => ({ ...p, x: mirrorX(p.x) }));
}

function withRoster(players: Fielder[], roster: Roster): Fielder[] {
  return players.map((p) => ({ ...p, name: roster[p.id] ?? p.name }));
}

function phaseText(format: Format, overType: OverType): string {
  if (format === "Test") return "Test";
  if (overType === "Non-Powerplay") return "Middle overs";
  return overType;
}

export default function App() {
  const [format, setFormat] = useState<Format>("T20");
  const [overType, setOverType] = useState<OverType>("Powerplay");
  const [bowlerType, setBowlerType] = useState<BowlerType>("Pace");
  const [isLeftHanded, setIsLeftHanded] = useState(false);

  const [roster, setRoster] = useState<Roster>(() => loadRoster());
  const [players, setPlayers] = useState<Fielder[]>(() =>
    withRoster(getPreset("Pace", "Powerplay", "T20"), loadRoster()),
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const [customPresets, setCustomPresets] = useState<(string | null)[]>(() => loadAllCustomSlots());

  const [tab, setTab] = useState<TabId>("field");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showBetaSignup, setShowBetaSignup] = useState(false);
  const [showBetaBanner, setShowBetaBanner] = useState(() => !hasDismissedBetaBanner());
  const [saveSlotTarget, setSaveSlotTarget] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveRoster(roster);
  }, [roster]);

  const validation = useMemo(
    () => validateField(players, format, overType, isLeftHanded),
    [players, format, overType, isLeftHanded],
  );

  const presetInfo = useMemo(
    () => getPresetInfo(bowlerType, overType, format),
    [bowlerType, overType, format],
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2200);
  }, []);

  const loadBasePreset = useCallback(
    (b: BowlerType, o: OverType, f: Format, leftHanded: boolean, currentRoster: Roster) => {
      let next = getPreset(b, o, f);
      if (leftHanded) next = mirrorField(next);
      setPlayers(withRoster(next, currentRoster));
      setSelectedPlayerId(null);
    },
    [],
  );

  const handleFormatChanged = (f: Format) => {
    const prevFormat = format;
    setFormat(f);
    let nextOver = overType;
    if (f === "Test") nextOver = "Non-Powerplay";
    else if (prevFormat === "Test") nextOver = "Powerplay";
    setOverType(nextOver);
    loadBasePreset(bowlerType, nextOver, f, isLeftHanded, roster);
  };

  const handleOverTypeChanged = (o: OverType) => {
    setOverType(o);
    loadBasePreset(bowlerType, o, format, isLeftHanded, roster);
  };

  const handleBowlerTypeChanged = (b: BowlerType) => {
    setBowlerType(b);
    loadBasePreset(b, overType, format, isLeftHanded, roster);
  };

  const handlePresetSelected = (b: BowlerType, o: OverType, f: Format) => {
    setBowlerType(b);
    setOverType(o);
    setFormat(f);
    loadBasePreset(b, o, f, isLeftHanded, roster);
    setTab("field");
  };

  const handleHandednessChanged = (isLeft: boolean) => {
    if (isLeft === isLeftHanded) return;
    setIsLeftHanded(isLeft);
    setPlayers((prev) => mirrorField(prev));
  };

  const handleReset = () => {
    loadBasePreset(bowlerType, overType, format, isLeftHanded, roster);
    showToast("Field reset");
  };

  const handlePlayerPositionChanged = useCallback((id: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const handleRename = (slotId: string, name: string) => {
    setRoster((prev) => ({ ...prev, [slotId]: name }));
    setPlayers((prev) => prev.map((p) => (p.id === slotId ? { ...p, name } : p)));
  };

  const handleResetNames = () => {
    const fresh = defaultRoster();
    setRoster(fresh);
    setPlayers((prev) => withRoster(prev, fresh));
    showToast("Names reset");
  };

  const handleSaveCustomPreset = (slot: number) => {
    const serialized = serializeField(players);
    setCustomPresetSlot(slot, serialized);
    setCustomPresets((prev) => prev.map((v, i) => (i === slot - 1 ? serialized : v)));
    showToast(`Saved to slot ${slot}`);
    setSaveSlotTarget(null);
  };

  const handleClearCustomPreset = (slot: number) => {
    clearCustomPresetSlot(slot);
    setCustomPresets((prev) => prev.map((v, i) => (i === slot - 1 ? null : v)));
    showToast(`Cleared slot ${slot}`);
  };

  const handleLoadCustomPreset = (serialized: string) => {
    const loaded = deserializeField(serialized, roster);
    if (!loaded) {
      showToast("That saved field could not be read");
      return;
    }
    setPlayers(loaded);
    setSelectedPlayerId(null);
    setTab("field");
    showToast("Field loaded");
  };

  const handleOpenBetaSignup = () => {
    dismissBetaBanner();
    setShowBetaBanner(false);
    setDrawerOpen(false);
    setShowBetaSignup(true);
  };

  const handleDismissBetaBanner = () => {
    dismissBetaBanner();
    setShowBetaBanner(false);
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  const handleSelectFromSquad = (slotId: string) => {
    setSelectedPlayerId(slotId);
    setTab("field");
  };

  return (
    <div className="app-shell">
      <div className="app-top">
        {showBetaBanner && (
          <BetaBanner onSignUp={handleOpenBetaSignup} onDismiss={handleDismissBetaBanner} />
        )}
        <header className="app-bar">
          <button
            className="icon-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open settings"
            aria-expanded={drawerOpen}
          >
            <span className="hamburger" aria-hidden="true" />
          </button>

          <div className="app-bar-title">
            <span className="app-title">Field Planner</span>
            <span className="app-subtitle">
              {format} · {phaseText(format, overType)} · {bowlerType}
            </span>
          </div>

          <div
            className={`status-pill ${validation.isValid ? "is-ok" : "is-bad"}`}
            title={validation.isValid ? "Legal field" : validation.violations.join("; ")}
          >
            {validation.maxAllowedOutside === null
              ? "No limit"
              : `${validation.outsideCircleCount}/${validation.maxAllowedOutside} out`}
          </div>
        </header>
      </div>

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

        <div className="panel-pane">
          {tab === "field" && (
            <FieldPanel
              format={format}
              overType={overType}
              bowlerType={bowlerType}
              isLeftHanded={isLeftHanded}
              presetInfo={presetInfo}
              validation={validation}
              selectedPlayer={selectedPlayer}
              onOverTypeChanged={handleOverTypeChanged}
              onBowlerTypeChanged={handleBowlerTypeChanged}
            />
          )}
          {tab === "presets" && (
            <PresetsPanel
              format={format}
              bowlerType={bowlerType}
              overType={overType}
              customPresets={customPresets}
              onPresetSelected={handlePresetSelected}
              onSaveClicked={(slot) => setSaveSlotTarget(slot)}
              onLoadClicked={handleLoadCustomPreset}
              onClearPreset={handleClearCustomPreset}
            />
          )}
          {tab === "squad" && (
            <SquadPanel
              players={players}
              roster={roster}
              isLeftHanded={isLeftHanded}
              selectedPlayerId={selectedPlayerId}
              onRename={handleRename}
              onResetNames={handleResetNames}
              onSelect={handleSelectFromSquad}
            />
          )}
          {tab === "rules" && (
            <RulesPanel
              format={format}
              overType={overType}
              isLeftHanded={isLeftHanded}
              players={players}
              validation={validation}
            />
          )}
        </div>
      </main>

      <BottomTabs active={tab} onChange={setTab} alertCount={validation.violations.length} />

      <AppDrawer
        open={drawerOpen}
        format={format}
        isLeftHanded={isLeftHanded}
        onClose={() => setDrawerOpen(false)}
        onFormatChanged={(f) => {
          handleFormatChanged(f);
        }}
        onHandednessChanged={handleHandednessChanged}
        onExport={() => {
          setDrawerOpen(false);
          setShowExport(true);
        }}
        onAdvisor={() => {
          setDrawerOpen(false);
          setShowAdvisor(true);
        }}
        onReset={() => {
          setDrawerOpen(false);
          handleReset();
        }}
        onBetaSignup={handleOpenBetaSignup}
      />

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

      {showBetaSignup && <BetaSignupDialog onDismiss={() => setShowBetaSignup(false)} />}

      {saveSlotTarget !== null && (
        <div className="modal-overlay" onClick={() => setSaveSlotTarget(null)}>
          <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Save to slot {saveSlotTarget}</span>
            </div>
            <p className="modal-subtext">
              {customPresets[saveSlotTarget - 1]
                ? `Slot ${saveSlotTarget} already has a field saved. Overwrite it?`
                : `Save the current field into slot ${saveSlotTarget} of ${CUSTOM_SLOT_COUNT}?`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleSaveCustomPreset(saveSlotTarget)}>
                Save
              </button>
              <button className="btn btn-ghost" onClick={() => setSaveSlotTarget(null)}>
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
