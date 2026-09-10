export type TabId = "field" | "presets" | "squad" | "rules";

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  alertCount: number;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "field", label: "Field", icon: "◎" },
  { id: "presets", label: "Presets", icon: "▦" },
  { id: "squad", label: "Squad", icon: "☰" },
  { id: "rules", label: "Rules", icon: "⚖" },
];

export default function BottomTabs({ active, onChange, alertCount }: Props) {
  return (
    <nav className="bottom-tabs" aria-label="Sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${active === tab.id ? "is-active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="tab-label">{tab.label}</span>
          {tab.id === "rules" && alertCount > 0 && (
            <span className="tab-badge" aria-label={`${alertCount} issues`}>
              {alertCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
