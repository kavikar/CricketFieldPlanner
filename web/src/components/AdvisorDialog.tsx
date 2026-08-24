import { useEffect, useState } from "react";
import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getTacticalAdvice } from "../lib/gemini";

interface Props {
  players: Fielder[];
  format: Format;
  overType: OverType;
  bowlerType: BowlerType;
  isLeftHanded: boolean;
  validation: ValidationResult;
  onDismiss: () => void;
}

export default function AdvisorDialog({
  players,
  format,
  overType,
  bowlerType,
  isLeftHanded,
  validation,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [text, setText] = useState("");

  useEffect(() => {
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
        if (!cancelled) {
          setText(err.message);
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🤖 AI TACTICAL ADVISOR</span>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="advisor-body">
          {status === "loading" && <div className="advisor-loading">Analyzing field setup…</div>}
          {status === "error" && <div className="advisor-error">{text}</div>}
          {status === "done" && <div className="advisor-text">{text}</div>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onDismiss}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
