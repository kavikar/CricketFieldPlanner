import { useMemo, useState } from "react";
import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getPositionName, isOutsideCircle } from "../lib/positions";

interface Props {
  players: Fielder[];
  format: Format;
  overType: OverType;
  bowlerType: BowlerType;
  isLeftHanded: boolean;
  validation: ValidationResult;
  onDismiss: () => void;
}

export default function ExportDialog({
  players,
  format,
  overType,
  bowlerType,
  isLeftHanded,
  validation,
  onDismiss,
}: Props) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const planText = useMemo(() => {
    const lines: string[] = [];
    lines.push("CRICKET FIELD PLAN");
    lines.push(`${format} | ${overType === "Non-Powerplay" ? "Middle overs" : overType} | ${bowlerType}`);
    lines.push(`Batter: ${isLeftHanded ? "Left hand" : "Right hand"}`);
    lines.push(validation.isValid ? "Legal field" : `ILLEGAL: ${validation.violations.join("; ")}`);
    lines.push(
      `Outside the circle: ${validation.outsideCircleCount}${
        validation.maxAllowedOutside !== null ? ` of ${validation.maxAllowedOutside} allowed` : ""
      }`,
    );
    lines.push("");
    for (const p of players) {
      const where =
        p.role === "bowler"
          ? "Bowler"
          : p.role === "keeper"
            ? "Wicketkeeper"
            : getPositionName(p.x, p.y, isLeftHanded);
      lines.push(`- ${p.name}: ${where}`);
    }
    return lines.join("\n");
  }, [players, format, overType, bowlerType, isLeftHanded, validation]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(planText);
      setCopyStatus("Copied to clipboard!");
    } catch {
      setCopyStatus("Could not copy — select and copy manually.");
    }
  };

  const handleDownloadCsv = () => {
    const header = "slot,name,role,position,x,y,outside_circle";
    const rows = players.map((p) => {
      const where =
        p.role === "bowler"
          ? "Bowler"
          : p.role === "keeper"
            ? "Wicketkeeper"
            : getPositionName(p.x, p.y, isLeftHanded);
      return [
        p.id,
        JSON.stringify(p.name),
        p.role,
        JSON.stringify(where),
        p.x.toFixed(1),
        p.y.toFixed(1),
        isOutsideCircle(p.x, p.y) ? 1 : 0,
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `field-plan-${format}-${overType}-${bowlerType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Export plan</span>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="modal-subtext">
          Copy the plan as text, or download it as a spreadsheet.
        </p>
        <pre className="export-log">{planText}</pre>
        {copyStatus && <div className="copy-status">{copyStatus}</div>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleCopy}>
            Copy plan
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadCsv}>
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
