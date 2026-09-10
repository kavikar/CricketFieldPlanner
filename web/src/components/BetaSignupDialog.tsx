import { useState } from "react";
import { submitBetaSignup } from "../lib/betaSignup";

interface Props {
  onDismiss: () => void;
}

type Status = "idle" | "submitting" | "done" | "error";

export default function BetaSignupDialog({ onDismiss }: Props) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bots fill this; humans never see it
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) return; // silently drop bot submissions
    setStatus("submitting");
    try {
      await submitBetaSignup(email);
      setStatus("done");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🧪 JOIN ANDROID BETA TESTING</span>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>

        {status === "done" ? (
          <>
            <p className="modal-subtext">
              You're on the list — I'll add you to the Play Console tester group and you'll get an
              invite email shortly.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={onDismiss}>
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="advisor-key-form">
            <p className="modal-subtext">
              The Android app is in closed testing on Google Play. Drop your email and I'll add you
              to the tester list — you'll get an invite link once you're added.
            </p>
            <input
              type="email"
              required
              className="advisor-key-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            {/* Honeypot: hidden from real users via CSS, not just visually absent, so
                screen readers skip it too. Bots that fill every field trip this. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="honeypot-field"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
            {status === "error" && <div className="advisor-error">{errorText}</div>}
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
                {status === "submitting" ? "Signing up…" : "Request Invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
