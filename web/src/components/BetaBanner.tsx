interface Props {
  onSignUp: () => void;
  onDismiss: () => void;
}

export default function BetaBanner({ onSignUp, onDismiss }: Props) {
  return (
    <div className="beta-banner">
      <span className="beta-banner-icon">📱</span>
      <span className="beta-banner-text">The Android app is in closed beta — sign up for an invite.</span>
      <button className="beta-banner-cta" onClick={onSignUp}>
        Sign Up
      </button>
      <button className="beta-banner-close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
