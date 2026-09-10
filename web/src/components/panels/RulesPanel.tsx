import type { Fielder, Format, OverType, ValidationResult } from "../../types";
import { getPositionName, isOutsideCircle, CENTRE } from "../../lib/positions";

interface Props {
  format: Format;
  overType: OverType;
  isLeftHanded: boolean;
  players: Fielder[];
  validation: ValidationResult;
}

export default function RulesPanel({
  format,
  overType,
  isLeftHanded,
  players,
  validation,
}: Props) {
  const fielders = players.filter((p) => p.role === "fielder");
  const outside = fielders.filter((p) => isOutsideCircle(p.x, p.y));
  const legSide = fielders.filter((p) =>
    isLeftHanded ? p.x > CENTRE : p.x < CENTRE,
  );
  const behindSquareLeg = legSide.filter((p) => p.y > 58);

  return (
    <div className="panel">
      <section className={`card ${validation.isValid ? "card-ok" : "card-danger"}`}>
        <h2 className="card-label">{validation.isValid ? "Legal field" : "Illegal field"}</h2>
        {validation.isValid ? (
          <p className="card-hint">
            This field satisfies every restriction for {format}
            {format === "Test" ? "" : ` ${overType === "Non-Powerplay" ? "middle overs" : overType.toLowerCase()}`}.
          </p>
        ) : (
          <ul className="bullet-list bullet-warn">
            {validation.violations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="card-label">Counts</h2>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-value">
              {validation.outsideCircleCount}
              {validation.maxAllowedOutside !== null && (
                <span className="stat-max"> / {validation.maxAllowedOutside}</span>
              )}
            </span>
            <span className="stat-label">Outside circle</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {legSide.length}
              {format !== "Test" && <span className="stat-max"> / 5</span>}
            </span>
            <span className="stat-label">Leg side</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {behindSquareLeg.length}
              <span className="stat-max"> / 2</span>
            </span>
            <span className="stat-label">Behind square leg</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-label">Restrictions in force</h2>
        <ul className="rule-list">
          <li>
            <strong>Circle</strong>
            <span>
              {format === "Test"
                ? "No restriction in Test cricket."
                : `Max ${validation.maxAllowedOutside} fielders outside the 30-yard circle.`}
            </span>
          </li>
          <li>
            <strong>Behind square leg</strong>
            <span>Max 2 fielders. More than that is a no-ball.</span>
          </li>
          {format !== "Test" && (
            <li>
              <strong>Leg side</strong>
              <span>Max 5 fielders on the leg side.</span>
            </li>
          )}
        </ul>
        <p className="card-hint">
          The bowler and keeper are not counted — the restrictions apply to the nine fielders.
        </p>
      </section>

      {outside.length > 0 && (
        <section className="card">
          <h2 className="card-label">On the boundary</h2>
          <ul className="mini-list">
            {outside.map((p) => (
              <li key={p.id}>
                <span className="mini-list-name">{p.name}</span>
                <span className="mini-list-detail">{getPositionName(p.x, p.y, isLeftHanded)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
