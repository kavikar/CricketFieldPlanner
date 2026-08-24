import { useCallback, useEffect, useRef, useState } from "react";
import type { Fielder, ValidationResult } from "../types";

interface Props {
  players: Fielder[];
  selectedPlayerId: string | null;
  validation: ValidationResult;
  isLeftHanded: boolean;
  onPlayerSelected: (id: string) => void;
  onPlayerPositionChanged: (id: string, x: number, y: number) => void;
}

const CENTER = 50;
const OUTER_CLAMP_RADIUS = 44;
const BOUNDARY_RADIUS = 46;
const CIRCLE_RADIUS = 25;

export default function FieldCanvas({
  players,
  selectedPlayerId,
  validation,
  isLeftHanded,
  onPlayerSelected,
  onPlayerPositionChanged,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; startClientX: number; startClientY: number } | null>(
    null,
  );
  const [, forceRender] = useState(0);

  const toViewBoxDelta = useCallback((dxClient: number, dyClient: number) => {
    const svg = svgRef.current;
    if (!svg) return { dx: 0, dy: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      dx: (dxClient / rect.width) * 100,
      dy: (dyClient / rect.height) * 100,
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent, player: Fielder) => {
    e.preventDefault();
    onPlayerSelected(player.id);
    dragState.current = {
      id: player.id,
      startX: player.x,
      startY: player.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      const { dx, dy } = toViewBoxDelta(e.clientX - drag.startClientX, e.clientY - drag.startClientY);

      let nextX = drag.startX + dx;
      let nextY = drag.startY + dy;

      const ox = nextX - CENTER;
      const oy = nextY - CENTER;
      const distFromCenter = Math.sqrt(ox * ox + oy * oy);
      if (distFromCenter > OUTER_CLAMP_RADIUS) {
        nextX = CENTER + (ox / distFromCenter) * OUTER_CLAMP_RADIUS;
        nextY = CENTER + (oy / distFromCenter) * OUTER_CLAMP_RADIUS;
      }

      const player = players.find((p) => p.id === drag.id);
      if (player?.isWK) {
        nextY = Math.max(58.5, nextY);
        nextX = Math.min(66, Math.max(34, nextX));
      }

      onPlayerPositionChanged(drag.id, nextX, nextY);
    };

    const handleUp = () => {
      dragState.current = null;
      forceRender((n) => n + 1);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [players, onPlayerPositionChanged, toViewBoxDelta]);

  return (
    <div className="field-canvas-wrap">
      <svg ref={svgRef} viewBox="0 0 100 100" className="field-canvas" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="turf" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2d6a4f" />
            <stop offset="100%" stopColor="#1b4332" />
          </radialGradient>
          <clipPath id="fieldClip">
            <circle cx={CENTER} cy={CENTER} r={BOUNDARY_RADIUS} />
          </clipPath>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={BOUNDARY_RADIUS} fill="url(#turf)" />

        <g clipPath="url(#fieldClip)" opacity="0.06">
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={4 + i * 13} y={0} width={6.5} height={100} fill="#ffffff" />
          ))}
        </g>

        <circle cx={CENTER} cy={CENTER} r={BOUNDARY_RADIUS} fill="none" stroke="#ffffff" strokeWidth="0.6" />

        <circle
          cx={CENTER}
          cy={CENTER}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#d1e1ff"
          strokeOpacity="0.4"
          strokeWidth="0.4"
          strokeDasharray="3 2"
        />

        {/* Pitch */}
        <rect x={CENTER - 2.3} y={CENTER - 9.2} width={4.6} height={18.4} fill="#dbc7a2" />
        <line x1={CENTER - 2.8} y1={CENTER - 7.4} x2={CENTER + 2.8} y2={CENTER - 7.4} stroke="#fff" strokeWidth="0.2" />
        <line x1={CENTER - 2.8} y1={CENTER + 7.4} x2={CENTER + 2.8} y2={CENTER + 7.4} stroke="#fff" strokeWidth="0.2" />

        {/* Labels */}
        <text x={CENTER} y={8} textAnchor="middle" fontSize="2.6" fontFamily="monospace" fill="#ffffff99" fontWeight="bold">
          BOWLING END
        </text>
        <text x={CENTER} y={95} textAnchor="middle" fontSize="2.6" fontFamily="monospace" fill="#ffffff99" fontWeight="bold">
          STRIKER END ({isLeftHanded ? "LHB" : "RHB"})
        </text>

        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          const isViolating = validation.illegalFielderIds.has(player.id);
          const fill = isViolating ? "#ff3b30" : player.isWK ? "#ffc107" : isSelected ? "#00e5ff" : "#ffffff";
          const textColor = player.isWK || isSelected || isViolating ? "#000000" : "#0e1117";

          return (
            <g
              key={player.id}
              transform={`translate(${player.x}, ${player.y})`}
              onPointerDown={(e) => handlePointerDown(e, player)}
              className="fielder-token"
            >
              {isSelected && <circle r={3.6} fill="none" stroke="#00e5ff" strokeWidth="0.35" />}
              {isViolating && <circle r={3.6} fill="none" stroke="#ff3b30" strokeWidth="0.5" opacity="0.85" />}
              <circle r={2.7} fill={fill} stroke="#0e1117" strokeWidth="0.15" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={player.label.length >= 3 ? "1.5" : "1.7"}
                fontWeight="bold"
                fill={textColor}
              >
                {player.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
