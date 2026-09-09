import { useEffect, useState } from "react";
import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getTacticalAdvice, MissingApiKeyError } from "../lib/gemini";
import { clearApiKey, getApiKey, setApiKey } from "../lib/apiKey";

interface Props {
  players: Fielder[];
  format: Format;
  overType: OverType;
  bowlerType: BowlerType;
  isLeftHanded: boolean;
  validation: ValidationResult;
  onDismiss: () => void;
}

type Status = "needs-key" | "loading" | "done" | "error";

export default function AdvisorDialog({
  players,
  format,
  overType,
  bowlerType,
  isLeftHanded,
  validation,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<Status>(() => (getApiKey() ? "loading" : "needs-key"));
  const [text, setText] = useState("");
  const [keyInput, setKeyInput] = useState("");

  const runAdvisor = () => {
    let cancelled = false;
    setStatus("loading");
    getTacticalAdvice(players, format, overType, bowlerType, isLeftHanded, validation)
      .then((advice) => {
        if (!cancelled) {
          setText(advice);
          setStatus("done");
        }
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err instanceof MissingApiKeyError) {
          setStatus("needs-key");
        } else {
          setText(err.message);
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    if (status !== "loading") return;
    return runAdvisor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setApiKey(keyInput);
    setKeyInput("");
    runAdvisor();
  };

  const handleChangeKey = () => {
    clearApiKey();
    setStatus("needs-key");
  };

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🤖 AI TACTICAL ADVISOR</span>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>

        {status === "needs-key" && (
          <form className="advisor-key-form" onSubmit={handleSaveKey}>
            <p className="modal-subtext">
              Uses your own Google Gemini API key — it's saved only in this browser and sent
              directly to Google, never through our servers. Get a free key from{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Google AI Studio
              </a>
              .
            </p>
            <input
              type="password"
              className="advisor-key-input"
              placeholder="Paste your Gemini API key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={!keyInput.trim()}>
                Save & Get Advice
              </button>
            </div>
          </form>
        )}

        {status !== "needs-key" && (
          <>
            <div className="advisor-body">
              {status === "loading" && <div className="advisor-loading">Analyzing field setup…</div>}
              {status === "error" && <div className="advisor-error">{text}</div>}
              {status === "done" && <div className="advisor-text">{text}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={handleChangeKey}>
                Change API Key
              </button>
              <button className="btn btn-secondary" onClick={onDismiss}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
