import React from "react";
import { OffthreadVideo, staticFile } from "remotion";

export const FOOTAGE = { file: "footage.mp4", width: 884, height: 1920 };

/** The recorded app, from `from` seconds into the footage. */
export const Footage: React.FC<{ from: number; width: number; style?: React.CSSProperties; rate?: number }> = ({ from, width, style, rate = 1 }) => {
  const height = (width * FOOTAGE.height) / FOOTAGE.width;
  return (
    <OffthreadVideo
      src={staticFile(FOOTAGE.file)}
      startFrom={Math.round(from * 30)}
      muted
      playbackRate={rate}
      style={{ width, height, display: "block", ...style }}
    />
  );
};

/** An iPhone (titanium edge, black bezel, Dynamic Island) playing the footage. */
export const Phone: React.FC<{ from: number; width: number; sheen?: number }> = ({ from, width, sheen = 0.3 }) => {
  const screenH = (width * FOOTAGE.height) / FOOTAGE.width;
  const bezel = width * 0.035;
  const radius = width * 0.165;
  return (
    <div
      style={{
        position: "relative",
        width: width + bezel * 2,
        height: screenH + bezel * 2,
        borderRadius: radius + bezel,
        background: "linear-gradient(145deg, #5a5f6b, #1d2027 30%, #3b3f48 70%, #15171c)",
        padding: 3,
        boxShadow: "0 60px 140px rgba(0,0,0,0.75), 0 0 120px rgba(26,123,255,0.18)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius + bezel - 3,
          background: "#000",
          padding: bezel - 3,
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", width, height: screenH, borderRadius: radius, overflow: "hidden" }}>
          <Footage from={from} width={width} />
          <div
            style={{
              position: "absolute",
              top: width * 0.03,
              left: "50%",
              transform: "translateX(-50%)",
              width: width * 0.3,
              height: width * 0.088,
              borderRadius: 999,
              background: "#000",
            }}
          />
          {/* Glass sheen */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, rgba(255,255,255,0.10), transparent 35%, transparent 70%, rgba(255,255,255,0.05))",
              pointerEvents: "none",
            }}
          />
          {/* A light sweep across the glass */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(110deg, transparent ${sheen * 160 - 40}%, rgba(255,255,255,0.16) ${sheen * 160 - 25}%, transparent ${sheen * 160 - 10}%)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * A piece of the screen lifted out of the phone: the same moment of the
 * footage, cropped to `crop` (in footage pixels) and drawn `width` wide.
 */
export const Cutout: React.FC<{
  from: number;
  crop: { x: number; y: number; w: number; h: number };
  width: number;
  radius?: number;
  still?: boolean;
}> = ({ from, crop, width, radius = 36, still = false }) => {
  const scale = width / crop.w;
  return (
    <div
      style={{
        width,
        height: crop.h * scale,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 40px 90px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(255,255,255,0.14)",
      }}
    >
      <Footage
        from={from}
        rate={still ? 0.0625 : 1}
        width={FOOTAGE.width * scale}
        style={{ position: "absolute", left: -crop.x * scale, top: -crop.y * scale }}
      />
    </div>
  );
};
