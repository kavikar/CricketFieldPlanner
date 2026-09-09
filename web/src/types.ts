export interface Fielder {
  id: string;
  name: string;
  label: string;
  x: number; // percentage coordinates (0 to 100), center of field = (50, 50)
  y: number;
  isWK?: boolean;
}

export interface PresetInfo {
  title: string;
  summary: string;
  advantages: string[];
  disadvantages: string[];
}

export interface ValidationResult {
  isValid: boolean;
  outsideCircleCount: number;
  maxAllowedOutside: number | null; // null if Test Match (no restrictions)
  violations: string[];
  illegalFielderIds: Set<string>;
}

export type Format = "T20" | "ODI" | "Test";
export type OverType = "Powerplay" | "Non-Powerplay" | "Death";
export type BowlerType = "Pace" | "Spin";
