import React from "react";
import { staticFile } from "remotion";
import { BLUE } from "./Brand";

export type Mood = "happy" | "excited" | "smug" | "shocked" | "sad" | "suspicious" | "determined" | "sleepy";
/** [upper, lower] angle in degrees from straight down; positive points the way the figure faces. */
export type Limb = [number, number];
export type Pose = { armB: Limb; armF: Limb; legB: Limb; legF: Limb; lean?: number; hip?: number; headTilt?: number };

const rad = (d: number) => (d * Math.PI) / 180;
const step = (x: number, y: number, a: number, l: number): [number, number] => [x + Math.sin(rad(a)) * l, y + Math.cos(rad(a)) * l];

export const STAND: Pose = { armB: [-12, -6], armF: [12, 6], legB: [-8, -4], legF: [8, 4] };
/** Looking down at a phone held in front of the face. */
export const PHONE: Pose = { armB: [-10, -4], armF: [30, 122], legB: [-6, -3], legF: [6, 3] };
export const SEATED: Pose = { armB: [-20, 30], armF: [30, 140], legB: [88, 4], legF: [92, 8], lean: -14, hip: 40 };
export const CHEER: Pose = { armB: [-120, -150], armF: [120, 150], legB: [-14, -6], legF: [14, 6] };
export const SELFIE: Pose = { armB: [-10, -4], armF: [125, 150], legB: [-6, -3], legF: [6, 3], headTilt: -8 };

export const walk = (t: number, speed = 0.45): Pose => {
  const s = Math.sin(t * speed);
  return { armB: [-28 * s, -20 * s + 10], armF: [28 * s, 20 * s + 10], legB: [26 * s, 26 * s - 18 * Math.max(0, s)], legF: [-26 * s, -26 * s - 18 * Math.max(0, -s)] };
};

export const Face: React.FC<{ mood: Mood; c: string }> = ({ mood, c }) => {
  const st = { stroke: c, strokeWidth: 5, strokeLinecap: "round" as const, fill: "none" };
  switch (mood) {
    case "happy": return <><circle cx={12} cy={-7} r={4} fill={c} /><path d="M 2 9 Q 13 20 24 7" {...st} /></>;
    case "excited": return <><path d="M 6 -5 L 12 -12 L 18 -5" {...st} /><path d="M 1 6 Q 13 26 26 5 Z" fill={c} stroke={c} strokeWidth={3} strokeLinejoin="round" /></>;
    case "smug": return <><path d="M 6 -7 L 19 -7" {...st} /><path d="M 3 -14 L 19 -12" {...st} strokeWidth={4} /><path d="M 4 11 Q 14 13 23 3" {...st} /></>;
    case "shocked": return <><circle cx={13} cy={-7} r={7} {...st} strokeWidth={4} /><circle cx={15} cy={-7} r={2.5} fill={c} /><path d="M 3 -22 Q 13 -28 23 -22" {...st} strokeWidth={4} /><ellipse cx={15} cy={13} rx={5} ry={7} {...st} strokeWidth={4} /></>;
    case "sad": return <><circle cx={12} cy={-6} r={4} fill={c} /><path d="M 4 -16 L 19 -20" {...st} strokeWidth={4} /><path d="M 3 15 Q 13 6 23 15" {...st} /></>;
    case "suspicious": return <><path d="M 6 -7 L 19 -6" {...st} /><path d="M 3 -19 L 20 -12" {...st} strokeWidth={4} /><path d="M 5 11 L 22 10" {...st} /></>;
    case "determined": return <><circle cx={13} cy={-6} r={4} fill={c} /><path d="M 3 -18 L 21 -11" {...st} strokeWidth={4} /><path d="M 5 11 L 22 9" {...st} /></>;
    case "sleepy": return <><path d="M 6 -6 Q 12 -2 18 -6" {...st} /><circle cx={15} cy={12} r={3.5} {...st} strokeWidth={3} /></>;
  }
};

export const Stick: React.FC<{
  x: number; y: number; s?: number; facing?: 1 | -1; color?: string; mood: Mood; pose: Pose;
  phone?: boolean; phoneRot?: number; sweat?: boolean; glow?: number; prop?: "dumbbell"; headFill?: string;
}> = ({ x, y, s = 1, facing = 1, color = "white", mood, pose, phone, phoneRot = -10, sweat, glow = 0, prop, headFill = "#0B1428" }) => {
  const hipY = -(pose.hip ?? 85);
  const sh: [number, number] = [0, hipY - 72];
  const head: [number, number] = [6, sh[1] - 42];
  const line = { stroke: color, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const limb = (from: [number, number], [a1, a2]: Limb, l1: number, l2: number) => {
    const k = step(from[0], from[1], a1, l1);
    const e = step(k[0], k[1], a2, l2);
    return { d: `M ${from[0]} ${from[1]} L ${k[0]} ${k[1]} L ${e[0]} ${e[1]}`, end: e, a2 };
  };
  const legB = limb([0, hipY], pose.legB, 44, 44), legF = limb([0, hipY], pose.legF, 44, 44);
  const armB = limb(sh, pose.armB, 40, 38), armF = limb(sh, pose.armF, 40, 38);
  return (
    <g transform={`translate(${x},${y}) scale(${s * facing},${s})`}>
      <path d={legB.d} {...line} opacity={0.8} />
      <g transform={`rotate(${pose.lean ?? 0} 0 ${hipY})`}>
        <path d={armB.d} {...line} opacity={0.8} />
        <path d={`M 0 ${hipY} L ${sh[0]} ${sh[1]} L ${head[0] - 4} ${head[1] + 30}`} {...line} />
        <g transform={`translate(${head[0]},${head[1]}) rotate(${pose.headTilt ?? 0})`}>
          <circle r={31} fill={headFill} stroke={color} strokeWidth={8} />
          <Face mood={mood} c={color} />
          {sweat && <path d="M -20 -26 Q -27 -14 -20 -8 Q -13 -14 -20 -26 Z" fill="#7FC4FF" />}
        </g>
        <path d={armF.d} {...line} />
        {phone && (
          <g transform={`translate(${armF.end[0]},${armF.end[1]}) rotate(${phoneRot})`}>
            {glow > 0 && <rect x={-30} y={-46} width={60} height={92} rx={18} fill={BLUE} opacity={0.35 * glow} />}
            <rect x={-17} y={-30} width={34} height={60} rx={8} fill="#05080F" stroke={color} strokeWidth={4} />
            <rect x={-12} y={-24} width={24} height={48} rx={4} fill="#0E2A5C" />
            <image href={staticFile("icon.png")} x={-10} y={-10} width={20} height={20} />
          </g>
        )}
        {prop === "dumbbell" && (
          <g transform={`translate(${armF.end[0]},${armF.end[1]})`}>
            <rect x={-30} y={-5} width={60} height={10} rx={4} fill="#9AA4B8" />
            <rect x={-38} y={-18} width={14} height={36} rx={4} fill="#5B6478" /><rect x={24} y={-18} width={14} height={36} rx={4} fill="#5B6478" />
          </g>
        )}
      </g>
      <path d={legF.d} {...line} />
    </g>
  );
};

/** Speech or thought bubble (HTML, so text never mirrors). */
export const Bubble: React.FC<{ x: number; y: number; s: number; children: React.ReactNode; color?: string; tail?: "left" | "right"; think?: boolean }> = ({ x, y, s, children, color = "white", tail = "left", think }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: tail === "left" ? "0% 100%" : "100% 100%", opacity: Math.min(1, s * 1.5) }}>
    <div style={{ background: color, color: "#0B1428", fontFamily: `-apple-system, "SF Pro Display", Arial`, fontWeight: 800, fontSize: 40, padding: "18px 28px",
      borderRadius: think ? 60 : 34, boxShadow: "0 18px 40px rgba(0,0,0,0.45)", whiteSpace: "nowrap", position: "relative" }}>
      {children}
      {think ? (
        <>
          <div style={{ position: "absolute", bottom: -26, [tail]: 30, width: 24, height: 24, borderRadius: 12, background: color }} />
          <div style={{ position: "absolute", bottom: -48, [tail]: 14, width: 14, height: 14, borderRadius: 7, background: color }} />
        </>
      ) : (
        <div style={{ position: "absolute", bottom: -18, [tail]: 34, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `22px solid ${color}` }} />
      )}
    </div>
  </div>
);
