import type { ValidationResult } from "../types";

export default function ValidationBanner({ validation }: { validation: ValidationResult }) {
  const valid = validation.isValid;
  const statsText =
    `${validation.outsideCircleCount}` + (validation.maxAllowedOutside !== null ? `/${validation.maxAllowedOutside} OUT` : " OUT");

  return (
    <div className={`validation-banner ${valid ? "valid" : "invalid"}`}>
      <span className="validation-icon">{valid ? "✅" : "⚠️"}</span>
      <div className="validation-body">
        <div className="validation-title">{valid ? "LEGAL COMPLIANT FIELD" : "ILLEGAL FIELD"}</div>
        {valid ? (
          <div className="validation-detail">Field matches all ICC regulations for selected match state.</div>
        ) : (
          validation.violations.map((v, i) => (
            <div key={i} className="validation-detail">
              {v}
            </div>
          ))
        )}
      </div>
      <div className="validation-stat">{statsText}</div>
    </div>
  );
}
