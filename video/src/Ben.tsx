import React, { useId } from "react";
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { BLUE, NAVY, FONT } from "./Brand";
import { Stick, STAND, PHONE, CHEER, SELFIE, Pose, Mood } from "./Stick";

/** "Bro's been starting tomorrow for 173 days" — paper doodle world that flips to BackIn blue. */
export const BEN_FRAMES = 720; // 24 s @ 30 fps

// Key beats (frames)
export const T = {
  fails: 96, // 0:03.2
  friends: 210, // 0:07  music cuts out
  bleed: 270, // 0:09  bass hit, ink bleed starts
  app: 340, // 0:11.3 phone takes over
  payoff: 570, // 0:19
  endcard: 636, // 0:21.2
};

const PAPER = "#f6f1e6";
const INK = "#151515";
const HAND = `"Marker Felt", "Chalkboard SE", "Comic Sans MS", sans-serif`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, start: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [start, start + len], [0, 1], { ...clamp, easing: ease });
const pop = (f: number, start: number, fps: number) =>
  spring({ frame: f - start, fps, config: { damping: 10, stiffness: 180, mass: 0.6 } });
const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const L = (x: [number, number], y: [number, number]): [number, number] => [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t];
  return {
    armB: L(a.armB, b.armB), armF: L(a.armF, b.armF), legB: L(a.legB, b.legB), legF: L(a.legF, b.legF),
    lean: (a.lean ?? 0) + ((b.lean ?? 0) - (a.lean ?? 0)) * t, hip: (a.hip ?? 85) + ((b.hip ?? 85) - (a.hip ?? 85)) * t,
    headTilt: (a.headTilt ?? 0) + ((b.headTilt ?? 0) - (a.headTilt ?? 0)) * t,
  };
};
// deterministic shake
const shake = (f: number, start: number, amp: number, len = 10) => {
  const k = f - start;
  if (k < 0 || k > len) return 0;
  return Math.sin(k * 2.7) * amp * (1 - k / len);
};

/* ───────────────────────── paper world ───────────────────────── */

const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: PAPER }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(${PAPER} 0 58px, #d6e1ee 58px 60px)`, opacity: 0.9 }} />
    <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 3, background: "#e9a3a3" }} />
  </AbsoluteFill>
);

const Ink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

const BenInk: React.FC<{ x: number; y: number; s?: number; mood: Mood; pose: Pose; facing?: 1 | -1; prop?: "dumbbell" }> = (p) => (
  <Stick {...p} color={INK} headFill={PAPER} />
);

/** Scene 1: tear-off calendar runs to 173 while Ben slaps snooze. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // flips accelerate: day number eases 150 -> 173 over 0..66, final slam at 66
  const SLAM = 66;
  const p = interpolate(f, [4, SLAM], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const day = Math.round(150 + 23 * p);
  const slam = pop(f, SLAM, fps);
  const calScale = f < SLAM ? 1 : 1 + 0.12 * (1 - slam);
  const flipPhase = (150 + 23 * p) % 1; // drives the falling page
  const sh = shake(f, SLAM, 22, 12);
  // snooze slaps: arm up/down every 8 frames before the slam, then stays down
  const slap = f < SLAM ? Math.abs(Math.sin((f / 8) * Math.PI)) : 0;
  const zz = (f % 40) / 40;
  return (
    <AbsoluteFill style={{ transform: `translate(${sh}px, ${sh * 0.6}px)` }}>
      <Paper />
      {/* calendar */}
      <div style={{ position: "absolute", left: 290, top: 230, width: 500, height: 540, transform: `rotate(-3deg) scale(${calScale})` }}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", border: `7px solid ${INK}`, borderRadius: 18, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden" }}>
          <div style={{ height: 120, background: "#e2463b", borderBottom: `7px solid ${INK}`, color: "#fff", font: `800 64px ${HAND}`, textAlign: "center", lineHeight: "120px" }}>DAY</div>
          <div style={{ font: `900 250px ${HAND}`, color: INK, textAlign: "center", lineHeight: "380px" }}>{day}</div>
        </div>
        {/* page tearing away */}
        {f < SLAM && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 127, height: 400, background: "#fff", border: `6px solid ${INK}`, borderTop: "none",
            transformOrigin: "50% 0%", transform: `perspective(900px) rotateX(${flipPhase * 110}deg) translateY(${flipPhase * 60}px)`, opacity: (1 - flipPhase) * 0.9,
            font: `900 250px ${HAND}`, color: INK, textAlign: "center", lineHeight: "380px", marginTop: -7 }}>{day - 1}</div>
        )}
      </div>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", font: `700 46px ${HAND}`, color: "#6b6357", opacity: ramp(f, SLAM, 10) }}>
        days of "starting tomorrow"
      </div>
      {/* bed + Ben */}
      <Ink>
        <g fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
          <rect x={160} y={1170} width={60} height={250} rx={16} fill="#fff" />
          <rect x={170} y={1300} width={740} height={90} rx={20} fill="#fff" />
          <path d="M210 1300 L210 1460 M900 1390 L900 1460" />
          <path d="M360 1300 Q560 1215 880 1290" fill="#cfe0f4" />
          <circle cx={300} cy={1252} r={48} fill={PAPER} />
          <path d="M276 1248 q12 8 26 0" strokeWidth={6} />
          {/* nightstand + alarm */}
          <rect x={890} y={1170} width={120} height={130} rx={10} fill="#fff" />
          <g transform={`translate(950, ${1130 + (slap > 0.6 ? 6 : 0)})`}>
            <rect x={-46} y={-40} width={92} height={70} rx={14} fill="#ffd34d" />
            {f < SLAM && f % 8 < 4 && <path d="M-40 -60 l-14 -20 M0 -64 v-24 M40 -60 l14 -20" strokeWidth={6} />}
          </g>
          {/* arm reaching to snooze */}
          <path d={`M520 1278 L${700 + slap * 120} ${1230 - slap * 70} L${820 + slap * 90} ${1150 - slap * 10}`} />
        </g>
        <text x={620 + zz * 40} y={1150 - zz * 90} fontSize={64} fill={INK} opacity={1 - zz} fontFamily={HAND}>z</text>
        <text x={560 + ((zz + 0.5) % 1) * 40} y={1150 - ((zz + 0.5) % 1) * 90} fontSize={48} fill={INK} opacity={1 - ((zz + 0.5) % 1)} fontFamily={HAND}>z</text>
      </Ink>
    </AbsoluteFill>
  );
};

/** One gag beat: label card + Ben failing. */
export const Fail: React.FC<{ kind: "gym" | "study" | "life" }> = ({ kind }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const HIT = 16; // impact frame within the beat
  const hit = f >= HIT;
  const sh = shake(f, HIT, 26, 10);
  const freeze = f >= HIT && f < HIT + 4; // anime impact frame
  const speed = ramp(f, 0, HIT, Easing.in(Easing.quad));
  let ben: React.ReactNode;
  if (kind === "gym") {
    const lift = lerpPose(STAND, CHEER, speed);
    ben = hit ? (
      <g>
        <BenInk x={540} y={1430} s={2.2} mood="shocked" pose={{ armB: [-80, -90], armF: [80, 90], legB: [-80, -80], legF: [80, 80], hip: 20 }} />
        <g transform="translate(540,1395) scale(2.2)">
          <rect x={-60} y={-8} width={120} height={16} rx={6} fill="#9AA4B8" stroke={INK} strokeWidth={4} />
          <rect x={-78} y={-34} width={26} height={68} rx={6} fill="#5B6478" stroke={INK} strokeWidth={4} />
          <rect x={52} y={-34} width={26} height={68} rx={6} fill="#5B6478" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    ) : (
      <BenInk x={540} y={1500} s={2.2} mood="determined" pose={lift} prop="dumbbell" />
    );
  } else if (kind === "study") {
    ben = (
      <g>
        <rect x={250} y={1300} width={580} height={30} rx={8} fill="#fff" stroke={INK} strokeWidth={9} />
        <path d="M300 1330 v190 M780 1330 v190" stroke={INK} strokeWidth={9} />
        <path d="M430 1296 l110 -20 l110 20 l-110 10 z" fill="#fff" stroke={INK} strokeWidth={7} />
        <BenInk x={540} y={1520} s={2} mood={hit ? "sleepy" : "determined"}
          pose={hit ? { armB: [-100, -40], armF: [100, 40], legB: [70, 0], legF: [80, 0], hip: 40, lean: 70 } : { armB: [-40, 60], armF: [40, 120], legB: [80, 0], legF: [90, 0], hip: 40, lean: -5 }} />
        {hit && <text x={700} y={1180} fontSize={70} fontFamily={HAND} fill={INK}>z z</text>}
      </g>
    );
  } else {
    const write = Math.min(1, f / HIT);
    ben = (
      <g>
        <rect x={240} y={1040} width={520} height={360} rx={10} fill="#fff" stroke={INK} strokeWidth={8} transform="rotate(-2 500 1220)" />
        <text x={290} y={1130} fontSize={64} fontFamily={HAND} fill={INK}>THE PLAN</text>
        <path d={`M300 1190 h${320 * write}`} stroke={INK} strokeWidth={6} strokeDasharray="20 14" />
        <path d={`M300 1250 h${hit ? 60 : 260 * write}`} stroke={INK} strokeWidth={6} strokeDasharray="20 14" />
        {hit ? (
          <BenInk x={720 + (f - HIT) * 9} y={1660} s={1.8} mood="sad" facing={1} pose={{ armB: [-150, -10], armF: [150, 10], legB: [100, 10], legF: [70, 10], hip: 30, lean: 75 }} />
        ) : (
          <BenInk x={830} y={1660} s={1.8} mood="smug" facing={-1} pose={{ armB: [-10, -4], armF: [70, 80], legB: [-8, -4], legF: [8, 4] }} />
        )}
      </g>
    );
  }
  const labels = { gym: "GYM", study: "STUDY", life: "FIX LIFE" };
  const lab = pop(f, 0, fps);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh}px, ${-sh * 0.5}px)` }}>
      <Paper />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${lab}) rotate(${kind === "study" ? 3 : -3}deg)`, font: `900 120px ${HAND}`, color: INK, border: `8px solid ${INK}`, padding: "10px 46px", background: "#fff", boxShadow: `10px 10px 0 ${INK}` }}>
          {labels[kind]}
        </div>
      </div>
      <Ink>{ben}</Ink>
      {hit && (
        <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", font: `900 150px ${HAND}`, color: "#e2463b",
          transform: `scale(${pop(f, HIT, fps)}) rotate(-6deg)`, WebkitTextStroke: `6px ${INK}` }}>
          {kind === "life" ? "NOPE." : "FAIL"}
        </div>
      )}
      {freeze && <AbsoluteFill style={{ background: INK, mixBlendMode: "difference" }} />}
      {freeze && <SpeedLines />}
    </AbsoluteFill>
  );
};

const SpeedLines: React.FC = () => (
  <Ink>
    {Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.05;
      const r1 = 420 + (i * 37) % 160;
      return <line key={i} x1={540 + Math.cos(a) * r1} y1={1250 + Math.sin(a) * r1} x2={540 + Math.cos(a) * 1400} y2={1250 + Math.sin(a) * 1400} stroke="#fff" strokeWidth={6 + (i % 4) * 3} />;
    })}
  </Ink>
);

/* ───────────────────────── blue world ───────────────────────── */

const Navy: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const f = useCurrentFrame();
  const d = Math.sin(f / 40) * 60;
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${540 + d}px ${820 - d / 2}px, rgba(26,123,255,${0.5 * glow}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(700px 700px at ${260 - d}px 1700px, rgba(120,80,255,${0.18 * glow}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

const PhoneShell: React.FC<{ width: number; children: React.ReactNode }> = ({ width, children }) => {
  const h = (width * 1920) / 884;
  return (
    <div style={{ width: width + 28, height: h + 28, borderRadius: width * 0.17, background: "linear-gradient(145deg,#5a5f6b,#1d2027 30%,#3b3f48 70%,#15171c)", padding: 14, boxSizing: "border-box",
      boxShadow: `0 50px 120px rgba(0,0,0,.7), 0 0 140px rgba(26,123,255,.55)` }}>
      <div style={{ width, height: h, borderRadius: width * 0.15, overflow: "hidden", background: "#000", position: "relative" }}>
        {children}
        <div style={{ position: "absolute", top: width * 0.03, left: "50%", transform: "translateX(-50%)", width: width * 0.3, height: width * 0.085, borderRadius: 99, background: "#000" }} />
      </div>
    </div>
  );
};

/** Friends scene (drawn twice: as ink on paper, then as white on navy inside the bleed). */
const FriendsScene: React.FC<{ blue: boolean; f: number; fps: number }> = ({ blue, f, fps }) => {
  const c = blue ? "#fff" : INK;
  const head = blue ? "#0B1428" : PAPER;
  const inL = pop(f, 6, fps), inR = pop(f, 14, fps);
  const phoneUp = ramp(f, 34, 14);
  const benIn = ramp(f, 20, 16);
  return (
    <>
      <Ink>
        <Stick x={-200 + inL * 400} y={1600} s={1.9} color={c} headFill={head} mood="suspicious" pose={{ armB: [-40, 100], armF: [40, -100], legB: [-10, -4], legF: [10, 4] }} />
        <Stick x={1280 - inR * 400} y={1600} s={1.9} facing={-1} color={c} headFill={head} mood="smug" pose={lerpPose(STAND, PHONE, phoneUp)} phone={phoneUp > 0.5} glow={blue ? 1 : 0} />
        <Stick x={540} y={1980 - benIn * 260} s={1.6} color={c} headFill={head} mood="shocked" pose={STAND} />
      </Ink>
    </>
  );
};

/** Scene 3: friends arrive on paper; at the bass hit blue ink bleeds out of the phone and swallows the page. */
export const Prove: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const B = T.bleed - T.friends; // bleed start within this scene
  const cx = 780, cy = 1270; // the friend's phone
  const baseR = interpolate(f, [B, B + 62], [0, 2300], { ...clamp, easing: Easing.out(Easing.quad) });
  const wob = interpolate(f, [B + 46, B + 62], [1, 0], clamp);
  const r = Math.max(0, baseR * (1 + 0.08 * Math.sin(f * 0.32) * wob));
  const lead = 24 + 26 * Math.sin(Math.PI * ramp(f, B, 50, (t) => t));
  const disp = interpolate(f, [B, B + 62], [60, 170], clamp);
  const drop = ramp(f, B - 6, 6, Easing.out(Easing.back(2)));
  const settled = f >= B + 64;
  const phoneIn = ramp(f, B + 30, 26, Easing.out(Easing.cubic));
  const sh = shake(f, B, 18, 10);

  const blueWorld = (
    <div style={{ position: "absolute", inset: 0 }}>
      <Navy />
      <FriendsScene blue f={f} fps={fps} />
      <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${0.25 + 0.75 * phoneIn}) rotate(${(1 - phoneIn) * -14}deg)`, opacity: phoneIn }}>
        <PhoneShell width={430}><Img src={staticFile("ben-still.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></PhoneShell>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ transform: `translate(${sh}px,0)` }}>
      {!settled && (
        <>
          <Paper />
          <FriendsScene blue={false} f={f} fps={fps} />
        </>
      )}
      {settled ? blueWorld : (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id={`b${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={7} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={disp} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id={`e${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={7} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={disp * 1.08} xChannelSelector="R" yChannelSelector="G" result="d" />
              <feGaussianBlur in="d" stdDeviation={3.2} />
            </filter>
            <mask id={`mi${uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
              <rect width={1080} height={1920} fill="black" />
              {r > 0.5 && <circle cx={cx} cy={cy} r={r + lead} fill="white" filter={`url(#e${uid})`} />}
              {drop > 0 && <circle cx={cx} cy={cy} r={22 * drop} fill="white" />}
            </mask>
            <mask id={`mn${uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
              <rect width={1080} height={1920} fill="black" />
              {r > 0.5 && <circle cx={cx} cy={cy} r={r} fill="white" filter={`url(#b${uid})`} />}
            </mask>
          </defs>
          <rect width={1080} height={1920} fill={BLUE} opacity={0.95} mask={`url(#mi${uid})`} />
          <g mask={`url(#mn${uid})`}>
            <foreignObject x={0} y={0} width={1080} height={1920}>{blueWorld}</foreignObject>
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** Scene 4: the real app. */
const Chip: React.FC<{ f: number; at: number; x: number; y: number; children: React.ReactNode }> = ({ f, at, x, y, children }) => {
  const { fps } = useVideoConfig();
  const s = pop(f, at, fps);
  const bob = Math.sin((f - at) / 14) * 8;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, transform: `scale(${s})`, opacity: Math.min(1, s * 1.4), background: "#fff", color: "#0B1428",
      font: `800 40px ${FONT}`, padding: "18px 30px", borderRadius: 40, boxShadow: "0 18px 50px rgba(0,0,0,.45)", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

export const AppReveal: React.FC = () => {
  const f = useCurrentFrame();
  // footage plan: 0–90 gym approve (2.0s→5.0s), 90–150 hike approve (5.0s→7.0s), 150–230 streak milestone (15.0s→17.7s)
  const segs = [
    { from: 0, len: 90, src: 2.0 },
    { from: 90, len: 60, src: 5.0 },
    { from: 150, len: 80, src: 16.4 },
  ];
  const zoom = interpolate(f, [0, 230], [1, 1.06], clamp);
  const ripple = (k: number) => ((f / 60 + k / 3) % 1);
  return (
    <AbsoluteFill>
      <Navy glow={1.1} />
      <Ink>
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={540} cy={1000} r={300 + ripple(k) * 700} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.35 * (1 - ripple(k))} />
        ))}
      </Ink>
      <div style={{ position: "absolute", left: 540, top: 1000, transform: `translate(-50%,-50%) scale(${zoom})` }}>
        <PhoneShell width={560}>
          {segs.map((s) => (
            <Sequence key={s.from} from={s.from} durationInFrames={s.len} layout="none">
              <OffthreadVideo src={staticFile("ben-app.mp4")} startFrom={Math.round(s.src * 30)} muted style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            </Sequence>
          ))}
        </PhoneShell>
      </div>
      <Chip f={f} at={8} x={40} y={430}>📸 photo proof</Chip>
      <Chip f={f} at={66} x={700} y={1330}>✓ approved</Chip>
      <Chip f={f} at={156} x={60} y={1480}>🔥 streak</Chip>
      {/* tiny white Ben taking a selfie, bottom right */}
      <Ink>
        <Stick x={900} y={1830 - ramp(f, 120, 20) * 40} s={1.2} mood="excited" pose={SELFIE} phone color="#fff" glow={1} />
      </Ink>
    </AbsoluteFill>
  );
};

/** Scene 5: Ben actually does it. */
export const Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lift = ramp(f, 4, 16, Easing.out(Easing.back(1.6)));
  const n = Math.round(interpolate(f, [8, 34], [1, 30], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const pill = pop(f, 6, fps);
  return (
    <AbsoluteFill>
      <Navy glow={1.2} />
      <Ink>
        <Stick x={540} y={1250} s={3} mood="excited" pose={lerpPose(STAND, CHEER, lift)} color="#fff" />
        {lift > 0.9 && Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const k = ramp(f, 16, 24);
          return <line key={i} x1={540 + Math.cos(a) * (360 + k * 80)} y1={760 + Math.sin(a) * (360 + k * 80)} x2={540 + Math.cos(a) * (400 + k * 160)} y2={760 + Math.sin(a) * (400 + k * 160)} stroke={BLUE} strokeWidth={10} strokeLinecap="round" opacity={1 - k} />;
        })}
      </Ink>
      <div style={{ position: "absolute", left: 700, top: 470, transform: `scale(${pill})`, background: BLUE, color: "#fff", borderRadius: 50, padding: "16px 36px", font: `900 64px ${FONT}`, boxShadow: "0 0 60px rgba(26,123,255,.8)" }}>
        🔥 {n}
      </div>
    </AbsoluteFill>
  );
};

/** Scene 6: end card with a white flash into the wordmark. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = ramp(f, 0, 12);
  const FLASH = 24;
  const burst = ramp(f, FLASH - 6, 6, (t) => t * t);
  const recover = 1 - ramp(f, FLASH + 3, 18, Easing.out(Easing.poly(5)));
  const white = f < FLASH ? burst : f < FLASH + 3 ? 1 : recover;
  const mark = spring({ frame: f - FLASH, fps, config: { damping: 14, stiffness: 120 } });
  const link = ramp(f, FLASH + 22, 12);
  return (
    <AbsoluteFill>
      <Navy glow={1.3} />
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", font: `900 92px ${FONT}`, color: "#fff", letterSpacing: -2,
        opacity: line, transform: `translateY(${(1 - line) * 30}px)` }}>
        Stop saying<br />tomorrow.
      </div>
      {f >= FLASH && (
        <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${1.04 - 0.04 * mark})` }}>
          <div style={{ position: "relative", width: 700, height: 201 }}>
            <Img src={staticFile("wordmark-base.svg")} style={{ position: "absolute", inset: 0, width: "100%" }} />
            <Img src={staticFile("wordmark-accent.svg")} style={{ position: "absolute", inset: 0, width: "100%" }} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, textAlign: "center", font: `700 56px ${FONT}`, color: "#8fb8ff", opacity: link }}>
        Link in bio
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 1060px, #fff ${Math.min(100, white * 140)}%, rgba(255,255,255,0) ${Math.min(140, white * 200)}%)`, opacity: white }} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── captions ───────────────────────── */

export const CAPTIONS: { from: number; to: number; text: string; paper: boolean }[] = [
  { from: 4, to: 34, text: "This is Ben.", paper: true },
  { from: 34, to: 96, text: "Ben has been starting tomorrow for 173 days.", paper: true },
  { from: 96, to: 134, text: "Gym? Tomorrow.", paper: true },
  { from: 134, to: 172, text: "Studying? Tomorrow.", paper: true },
  { from: 172, to: 210, text: "Fixing his life? Also tomorrow.", paper: true },
  { from: 214, to: 340, text: "So his friends decided to make him prove it.", paper: false },
  { from: 344, to: 412, text: "A photo every day.", paper: false },
  { from: 412, to: 490, text: "Friends who actually check.", paper: false },
  { from: 490, to: 570, text: "And suddenly, Ben's showing up.", paper: false },
  { from: 572, to: 636, text: "Turns out, tomorrow's easier when your friends are watching.", paper: false },
];

export const CaptionUnit: React.FC<{ text: string; paper: boolean; from: number }> = ({ text, paper, from }) => {
  const f = useCurrentFrame();
  return <CaptionView c={{ from, to: 99999, text, paper }} k={ramp(f, 0, 6)} />;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const c = CAPTIONS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  return <CaptionView c={c} k={ramp(f, c.from, 6)} />;
};

const CaptionView: React.FC<{ c: (typeof CAPTIONS)[number]; k: number }> = ({ c, k }) => {
  const top = c.paper ? 1640 : c.from >= 572 ? 1560 : c.from === 214 ? 300 : 120;
  const plate = c.from === 214;
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
      <span style={{
        font: c.paper ? `900 64px ${HAND}` : `800 58px ${FONT}`, lineHeight: 1.18,
        color: c.paper ? INK : "#fff", letterSpacing: c.paper ? 0 : -1,
        textShadow: c.paper || plate ? "none" : "0 4px 24px rgba(0,0,0,.6)",
        background: c.paper ? "rgba(246,241,230,.88)" : plate ? "#0B1428" : "none", padding: c.paper || plate ? "6px 20px" : 0, borderRadius: plate ? 14 : 0,
        boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
      }}>{c.text}</span>
    </div>
  );
};

/* ───────────────────────── sound ───────────────────────── */

export const SFX: { at: number; file: string; vol?: number; trim?: number; len?: number }[] = [
  { at: 0, file: "audio/sfx/fs-369880.mp3", vol: 0.35, trim: 0.5, len: 66 }, // alarm
  ...[10, 22, 32, 40, 47, 53, 58, 62].map((at) => ({ at, file: "audio/sfx/fs-466375.mp3", vol: 0.5, len: 10 })), // page flicks
  { at: 66, file: "audio/sfx/fs-339437.mp3", vol: 1 }, // thud on 173
  { at: 96 + 16, file: "audio/sfx/fs-458572.mp3", vol: 0.9 }, // bonk (gym)
  { at: 134 + 16, file: "audio/sfx/fs-528254.mp3", vol: 1 }, // snore (study)
  { at: 172 + 14, file: "audio/sfx/fs-175409.mp3", vol: 0.7, trim: 0.2, len: 40 }, // sad trombone
  { at: 210, file: "audio/sfx/fs-610676.mp3", vol: 0.7, len: 18 }, // record scratch -> silence
  { at: 216, file: "sfx/pop.wav", vol: 0.6 },
  { at: 224, file: "sfx/pop.wav", vol: 0.6 },
  { at: 244, file: "audio/sfx/fs-731262.mp3", vol: 0.5, len: 20 }, // boing: phone out
  { at: T.bleed, file: "audio/sfx/fs-339437.mp3", vol: 1 }, // bass hit
  { at: T.bleed, file: "sfx/boom.wav", vol: 0.7 },
  { at: T.app - 8, file: "sfx/whoosh.wav", vol: 0.5 },
  { at: T.app + 8, file: "audio/sfx/fs-271010.mp3", vol: 0.8, trim: 1.05, len: 15 }, // shutter
  { at: T.app + 66, file: "sfx/swipe.wav", vol: 0.6 },
  { at: T.app + 72, file: "sfx/ding.wav", vol: 0.6 },
  { at: T.app + 130, file: "sfx/swipe.wav", vol: 0.6 },
  { at: T.app + 136, file: "sfx/ding.wav", vol: 0.6 },
  { at: T.app + 156, file: "sfx/pop.wav", vol: 0.6 },
  { at: T.app + 190, file: "sfx/riser.wav", vol: 0.5 },
  { at: T.payoff + 6, file: "audio/sfx/fs-651646.mp3", vol: 0.45, len: 70 }, // cheer
  ...[10, 14, 18, 22, 26, 30].map((d) => ({ at: T.payoff + d, file: "sfx/tick.wav", vol: 0.35 })),
  { at: T.endcard + 22, file: "sfx/stamp.wav", vol: 0.8 }, // logo impact
];

const Sound: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm && (
      <>
        <Sequence from={0} durationInFrames={T.friends}>
          <Audio src={staticFile("audio/bgm-catwalk.mp3")} volume={(f) => interpolate(f, [0, 20, T.friends - 6, T.friends], [0, 0.4, 0.4, 0], clamp)} />
        </Sequence>
        <Sequence from={T.bleed}>
          <Audio src={staticFile("audio/bgm-catwalk.mp3")} startFrom={Math.round(16.1 * 30)}
            volume={(f) => interpolate(f, [0, 4, BEN_FRAMES - T.bleed - 40, BEN_FRAMES - T.bleed], [0, 0.42, 0.42, 0], clamp)} />
        </Sequence>
      </>
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={s.len ?? 90}>
        <Audio src={staticFile(s.file)} volume={s.vol ?? 0.7} startFrom={Math.round((s.trim ?? 0) * 30)} />
      </Sequence>
    ))}
  </>
);

/* ───────────────────────── film ───────────────────────── */

export const BenReel: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <Sequence from={0} durationInFrames={T.fails}><Hook /></Sequence>
    <Sequence from={T.fails} durationInFrames={38}><Fail kind="gym" /></Sequence>
    <Sequence from={T.fails + 38} durationInFrames={38}><Fail kind="study" /></Sequence>
    <Sequence from={T.fails + 76} durationInFrames={T.friends - T.fails - 76}><Fail kind="life" /></Sequence>
    <Sequence from={T.friends} durationInFrames={T.app - T.friends}><Prove /></Sequence>
    <Sequence from={T.app} durationInFrames={T.payoff - T.app}><AppReveal /></Sequence>
    <Sequence from={T.payoff} durationInFrames={T.endcard - T.payoff}><Payoff /></Sequence>
    <Sequence from={T.endcard}><EndCard /></Sequence>
    <Captions />
    <Sound bgm={bgm} />
  </AbsoluteFill>
);
