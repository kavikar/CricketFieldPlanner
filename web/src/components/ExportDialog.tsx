import { useMemo, useState } from "react";
import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getFielderZone } from "../lib/validation";

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
    lines.push("🏏 TACTICAL OVAL FIELD PLAN 🏏");
    lines.push("=============================");
    lines.push(`Format: ${format} | Bowler: ${bowlerType}`);
    lines.push(`Phase: ${overType} | Batter: ${isLeftHanded ? "LHB" : "RHB"}`);
    lines.push(`Compliance: ${validation.isValid ? "LEGAL ✅" : "ILLEGAL ❌"}`);
    lines.push(`Outfielders: ${validation.outsideCircleCount} inside play`);
    lines.push("-----------------------------");
    for (const p of players) {
      const zone = getFielderZone(p.x, p.y, isLeftHanded);
      lines.push(`- ${p.label} (${p.name}): X:${Math.round(p.x)}% Y:${Math.round(p.y)}% [${zone}]`);
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
    const header = "id,name,label,x,y,isWK,zone";
    const rows = players.map(
      (p) =>
        `${p.id},${p.name},${p.label},${p.x.toFixed(1)},${p.y.toFixed(1)},${p.isWK ? 1 : 0},${getFielderZone(p.x, p.y, isLeftHanded)}`,
    );
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
          <span className="modal-title">TACTICAL EXPORT SUMMARY</span>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="modal-subtext">
          A digital copy of your tactical field setting has been formatted and is ready for export.
        </p>
        <pre className="export-log">{planText}</pre>
        {copyStatus && <div className="copy-status">{copyStatus}</div>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleCopy}>
            Copy Plan
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadCsv}>
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
