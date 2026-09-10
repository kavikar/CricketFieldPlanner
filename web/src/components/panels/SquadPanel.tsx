import type { Fielder, Roster } from "../../types";
import { getPositionName } from "../../lib/positions";
import { defaultName, isDefaultName, shortLabel } from "../../lib/roster";

interface Props {
  players: Fielder[];
  roster: Roster;
  isLeftHanded: boolean;
  selectedPlayerId: string | null;
  onRename: (slotId: string, name: string) => void;
  onResetNames: () => void;
  onSelect: (slotId: string) => void;
}

const ROLE_ORDER = { bowler: 0, keeper: 1, fielder: 2 } as const;

export default function SquadPanel({
  players,
  roster,
  isLeftHanded,
  selectedPlayerId,
  onRename,
  onResetNames,
  onSelect,
}: Props) {
  const ordered = [...players].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  const named = players.filter((p) => !isDefaultName(p.id, roster[p.id] ?? "")).length;

  return (
    <div className="panel">
      <section className="card">
        <h2 className="card-label">Squad</h2>
        <p className="card-hint">
          Name your eleven. Names stay with the player as you move them, and carry across every
          saved field.
        </p>

        <ul className="squad-list">
          {ordered.map((p) => (
            <li
              key={p.id}
              className={`squad-row ${selectedPlayerId === p.id ? "is-selected" : ""}`}
            >
              <button
                className={`squad-badge role-${p.role}`}
                onClick={() => onSelect(p.id)}
                aria-label={`Select ${p.name}`}
              >
                {shortLabel(p.id, p.name)}
              </button>
              <div className="squad-fields">
                <input
                  className="squad-input"
                  value={roster[p.id] ?? ""}
                  onChange={(e) => onRename(p.id, e.target.value)}
                  placeholder={defaultName(p.id)}
                  aria-label={`Name for ${defaultName(p.id)}`}
                  maxLength={24}
                />
                <span className="squad-position">
                  {p.role === "bowler"
                    ? "Bowler · fixed"
                    : p.role === "keeper"
                      ? "Wicketkeeper · fixed"
                      : getPositionName(p.x, p.y, isLeftHanded)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {named > 0 && (
          <button className="btn btn-ghost btn-block" onClick={onResetNames}>
            Reset all names
          </button>
        )}
      </section>
    </div>
  );
}
