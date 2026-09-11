import { useEffect } from "react";
import type { Format } from "../types";

interface Props {
  open: boolean;
  format: Format;
  isLeftHanded: boolean;
  onClose: () => void;
  onFormatChanged: (f: Format) => void;
  onHandednessChanged: (isLeft: boolean) => void;
  onExport: () => void;
  onAdvisor: () => void;
  onReset: () => void;
  onBetaSignup: () => void;
}

const FORMATS: Format[] = ["T20", "ODI", "Test"];

export default function AppDrawer({
  open,
  format,
  isLeftHanded,
  onClose,
  onFormatChanged,
  onHandednessChanged,
  onExport,
  onAdvisor,
  onReset,
  onBetaSignup,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-scrim ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <span className="drawer-title">Settings</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3 className="drawer-label">Format</h3>
            <div className="segmented">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  className={`seg ${format === f ? "is-active" : ""}`}
                  onClick={() => onFormatChanged(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="drawer-hint">
              {format === "T20" && "Overs 1–6 allow 2 fielders out, 7–20 allow 5."}
              {format === "ODI" && "Overs 1–10 allow 2 out, 11–40 allow 4, 41–50 allow 5."}
              {format === "Test" && "No fielding circle restrictions apply."}
            </p>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-label">Batter</h3>
            <div className="segmented">
              <button
                className={`seg ${!isLeftHanded ? "is-active" : ""}`}
                onClick={() => onHandednessChanged(false)}
              >
                Right hand
              </button>
              <button
                className={`seg ${isLeftHanded ? "is-active" : ""}`}
                onClick={() => onHandednessChanged(true)}
              >
                Left hand
              </button>
            </div>
            <p className="drawer-hint">Mirrors the field, so off side and leg side stay correct.</p>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-label">Actions</h3>
            <button className="drawer-item" onClick={onExport}>
              <span aria-hidden="true">⤴</span> Export plan
            </button>
            <button className="drawer-item" onClick={onAdvisor}>
              <span aria-hidden="true">✦</span> AI tactical advice
            </button>
            <button className="drawer-item" onClick={onReset}>
              <span aria-hidden="true">↻</span> Reset to preset
            </button>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-label">About</h3>
            <button className="drawer-item" onClick={onBetaSignup}>
              <span aria-hidden="true">📱</span> Join the Android beta
            </button>
            <a className="drawer-item" href="/privacy.html" target="_blank" rel="noreferrer">
              <span aria-hidden="true">◇</span> Privacy policy
            </a>
            <a
              className="drawer-item"
              href="mailto:support@cricketfieldplanner.com?subject=Cricket%20Field%20Planner%20feedback"
            >
              <span aria-hidden="true">✉</span> Send feedback
            </a>
            <p className="drawer-version">Version {__APP_VERSION__}</p>
          </section>
        </div>
      </aside>
    </>
  );
}
