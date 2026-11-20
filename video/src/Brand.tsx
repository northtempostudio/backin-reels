import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const BLUE = "#1A7BFF";
export const NAVY = "#040915";
export const FONT = `-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;

/** Deep navy with a slow-breathing blue glow and fine grain. */
export const Backdrop: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 60;
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${540 + drift}px ${760 - drift / 2}px, rgba(26,123,255,${0.32 * glow}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 700px at ${300 - drift}px 1650px, rgba(120,80,255,${0.16 * glow}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundPosition: `${(frame * 37) % 160}px ${(frame * 53) % 160}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** The app icon and "BackIn", the "In" in blue. */
export const Wordmark: React.FC<{ size?: number; delay?: number }> = ({ size = 1, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const text = spring({ frame: frame - delay - 6, fps, config: { damping: 16, stiffness: 120 } });
  const glow = interpolate(frame - delay, [0, 10, 40], [0, 1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 * size }}>
      <div style={{ position: "relative", transform: `scale(${pop}) rotate(${(1 - pop) * -14}deg)` }}>
        <div
          style={{
            position: "absolute",
            inset: -60 * size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(26,123,255,${0.75 * glow}), transparent 65%)`,
            filter: "blur(10px)",
          }}
        />
        <Img
          src={staticFile("icon.png")}
          style={{
            position: "relative",
            width: 260 * size,
            height: 260 * size,
            borderRadius: 60 * size,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(255,255,255,0.12)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 132 * size,
          letterSpacing: -4 * size,
          color: "white",
          opacity: text,
          transform: `translateY(${(1 - text) * 40}px)`,
        }}
      >
        Back<span style={{ color: BLUE }}>In</span>
      </div>
    </div>
  );
};
