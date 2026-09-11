import { useCallback, useEffect, useRef } from "react";
import type { Fielder, ValidationResult } from "../types";
import {
  BOUNDARY_RADIUS,
  CENTRE,
  CIRCLE_RADIUS,
  describePosition,
  OUTER_CLAMP_RADIUS,
  VIEWBOX_MIN,
  VIEWBOX_SIZE,
} from "../lib/positions";
import { shortLabel } from "../lib/roster";

interface Props {
  players: Fielder[];
  selectedPlayerId: string | null;
  validation: ValidationResult;
  isLeftHanded: boolean;
  onPlayerSelected: (id: string | null) => void;
  onPlayerPositionChanged: (id: string, x: number, y: number) => void;
}

const NUDGE_STEP = 1.5;

/** The bowler and keeper hold their stations; only the nine fielders move. */
function isMovable(player: Fielder): boolean {
  return player.role === "fielder";
}

function clampToField(x: number, y: number): { x: number; y: number } {
  const ox = x - CENTRE;
  const oy = y - CENTRE;
  const dist = Math.sqrt(ox * ox + oy * oy);
  if (dist <= OUTER_CLAMP_RADIUS) return { x, y };
  return {
    x: CENTRE + (ox / dist) * OUTER_CLAMP_RADIUS,
    y: CENTRE + (oy / dist) * OUTER_CLAMP_RADIUS,
  };
}

export default function FieldCanvas({
  players,
  selectedPlayerId,
  validation,
  isLeftHanded,
  onPlayerSelected,
  onPlayerPositionChanged,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const playersRef = useRef(players);
  playersRef.current = players;
  const dragState = useRef<{
    id: string;
    startX: number;
    startY: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);

  const toViewBoxDelta = useCallback((dxClient: number, dyClient: number) => {
    const svg = svgRef.current;
    if (!svg) return { dx: 0, dy: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      dx: (dxClient / rect.width) * VIEWBOX_SIZE,
      dy: (dyClient / rect.height) * VIEWBOX_SIZE,
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent, player: Fielder) => {
    onPlayerSelected(player.id);
    if (!isMovable(player)) return;
    e.preventDefault();
    dragState.current = {
      id: player.id,
      startX: player.x,
      startY: player.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      const { dx, dy } = toViewBoxDelta(e.clientX - drag.startClientX, e.clientY - drag.startClientY);
      const next = clampToField(drag.startX + dx, drag.startY + dy);
      onPlayerPositionChanged(drag.id, next.x, next.y);
    };
    const handleUp = () => {
      dragState.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [onPlayerPositionChanged, toViewBoxDelta]);

  /* Arrow keys nudge the selected fielder — precision placement, and the only
     way to use the planner without a pointer. Bound at the window rather than on
     the <g>, which never takes focus from a pointer press. */
  useEffect(() => {
    if (!selectedPlayerId) return;
    const onKey = (e: KeyboardEvent) => {
      const deltas: Record<string, [number, number]> = {
        ArrowUp: [0, -NUDGE_STEP],
        ArrowDown: [0, NUDGE_STEP],
        ArrowLeft: [-NUDGE_STEP, 0],
        ArrowRight: [NUDGE_STEP, 0],
      };
      const delta = deltas[e.key];
      if (!delta) return;

      // Never steal the arrow keys from a text field.
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;

      const player = playersRef.current.find((p) => p.id === selectedPlayerId);
      if (!player || !isMovable(player)) return;

      e.preventDefault();
      const next = clampToField(player.x + delta[0], player.y + delta[1]);
      onPlayerPositionChanged(player.id, next.x, next.y);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedPlayerId, onPlayerPositionChanged]);

  const selected = players.find((p) => p.id === selectedPlayerId) ?? null;

  return (
    <div className="field-canvas-wrap">
      <svg
        ref={svgRef}
        viewBox={`${VIEWBOX_MIN} ${VIEWBOX_MIN} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="field-canvas"
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label="Cricket field. Select a fielder, then use the arrow keys to move them."
      >
        <defs>
          <radialGradient id="turf" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#2f6b4f" />
            <stop offset="100%" stopColor="#1d4635" />
          </radialGradient>
          <clipPath id="fieldClip">
            <circle cx={CENTRE} cy={CENTRE} r={BOUNDARY_RADIUS} />
          </clipPath>
        </defs>

        <circle cx={CENTRE} cy={CENTRE} r={BOUNDARY_RADIUS} fill="url(#turf)" />

        <g clipPath="url(#fieldClip)" opacity="0.05">
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={4 + i * 13} y={0} width={6.5} height={100} fill="#ffffff" />
          ))}
        </g>

        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={BOUNDARY_RADIUS}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="0.45"
        />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.32"
          strokeWidth="0.35"
          strokeDasharray="2.5 2"
        />

        {/* Pitch: bowler's stumps at y=41, striker's at y=58 */}
        <rect x={CENTRE - 2.2} y={40} width={4.4} height={18} rx="0.4" fill="#d9c8a6" opacity="0.9" />
        <line x1={CENTRE - 2.6} y1={41} x2={CENTRE + 2.6} y2={41} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.18" />
        <line x1={CENTRE - 2.6} y1={58} x2={CENTRE + 2.6} y2={58} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.18" />

        <text x={CENTRE} y={-1} textAnchor="middle" className="field-end-label">
          BOWLING END
        </text>
        <text x={CENTRE} y={103} textAnchor="middle" className="field-end-label">
          STRIKER · {isLeftHanded ? "LEFT" : "RIGHT"} HAND
        </text>

        {/* Side markers so off/leg is never ambiguous */}
        <text x={-5} y={CENTRE} textAnchor="start" dominantBaseline="central" className="field-side-label">
          {isLeftHanded ? "OFF" : "LEG"}
        </text>
        <text x={105} y={CENTRE} textAnchor="end" dominantBaseline="central" className="field-side-label">
          {isLeftHanded ? "LEG" : "OFF"}
        </text>

        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          const isViolating = validation.illegalFielderIds.has(player.id);
          const movable = isMovable(player);
          const label = shortLabel(player.id, player.name);

          const cls = [
            "fielder-token",
            movable ? "is-movable" : "is-fixed",
            `role-${player.role}`,
            isSelected ? "is-selected" : "",
            isViolating ? "is-illegal" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <g
              key={player.id}
              transform={`translate(${player.x}, ${player.y})`}
              className={cls}
              tabIndex={0}
              role="button"
              aria-label={`${player.name}, ${describePosition(player, isLeftHanded)}${
                movable ? "" : " (fixed)"
              }`}
              onPointerDown={(e) => handlePointerDown(e, player)}
              onFocus={() => onPlayerSelected(player.id)}
            >
              {isSelected && <circle className="token-halo" r={3.6} />}
              <circle className="token-dot" r={2.4} />
              <text
                className="token-text"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={label.length >= 3 ? 1.35 : 1.6}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* The position name follows whoever is selected, so it can never go stale. */}
        {selected && (
          <text
            x={Math.min(Math.max(selected.x, 18), 82)}
            y={selected.y > 78 ? selected.y - 5.2 : selected.y + 7}
            textAnchor="middle"
            className="token-caption"
          >
            {describePosition(selected, isLeftHanded)}
          </text>
        )}
      </svg>
    </div>
  );
}
