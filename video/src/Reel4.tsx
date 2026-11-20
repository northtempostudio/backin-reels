import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { BLUE, Backdrop, FONT } from "./Brand";
import { CaptionTrack, Confetti, GREEN, Level, ORANGE, Outro, RED, Sfx, Shot, clamp, f, useSpr } from "./Reel";
import { Bubble, CHEER, Face, Mood, PHONE, SEATED, STAND, Stick, walk } from "./Stick";
import V from "./stick.json";

/**
 * Reel 4: the stick-figure skit re-cut on the same narration (stick.json),
 * with face close-ups, reactions and phone screens the viewer "uses".
 */
const W = V.words;
const st = (i: number) => W[i].s - 0.05;
const END = W[W.length - 1].e + 1.8;
const GROUND = 1380;
const ALEX = "white";
const FRIENDS = [
  { name: "Maya", color: "#FF6FB5" },
  { name: "Sam", color: "#4ADE80" },
  { name: "Jordan", color: "#FFB547" },
];

// ── Building blocks ──
const sp = (frame: number, at: number, damping = 11, stiffness = 170) => spring({ frame: frame - at, fps: 30, config: { damping, stiffness, mass: 0.6 } });

/** A big stick-figure head with shoulders: the close-up. */
const Head: React.FC<{ x: number; y: number; r: number; color: string; mood: Mood; tilt?: number; lit?: number; sweat?: boolean; id: string }> = ({ x, y, r, color, mood, tilt = 0, lit = 0, sweat, id }) => {
  const k = r / 31;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt})`}>
      <defs>
        <radialGradient id={`lit-${id}`} cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor={BLUE} stopOpacity={0.55 * lit} />
          <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M ${-r * 1.9} ${r * 2.6} Q ${-r * 1.4} ${r * 1.55} 0 ${r * 1.5} Q ${r * 1.4} ${r * 1.55} ${r * 1.9} ${r * 2.6}`} fill="none" stroke={color} strokeWidth={r * 0.2} strokeLinecap="round" />
      <line x1={0} y1={r * 0.95} x2={0} y2={r * 1.5} stroke={color} strokeWidth={r * 0.2} strokeLinecap="round" />
      <circle r={r} fill="#0B1428" stroke={color} strokeWidth={r * 0.1} />
      {lit > 0 && <circle r={r * 0.95} fill={`url(#lit-${id})`} />}
      <g transform={`scale(${k * 1.3}) translate(-13,1)`}><Face mood={mood} c={color} /></g>
      {sweat && <path transform={`translate(${-r * 0.7},${-r * 0.55}) scale(${k * 1.4})`} d="M 0 -12 Q -7 0 0 6 Q 7 0 0 -12 Z" fill="#7FC4FF" />}
    </g>
  );
};

/** Rays behind a reaction, slowly turning. */
const Rays: React.FC<{ color: string; n?: number; cx?: number; cy?: number; o?: number }> = ({ color, n = 18, cx = 540, cy = 760, o = 0.16 }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${cx},${cy}) rotate(${frame * 0.6})`} opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, b = a + Math.PI / n;
        return <path key={i} d={`M 0 0 L ${Math.cos(a) * 1600} ${Math.sin(a) * 1600} L ${Math.cos(b) * 1600} ${Math.sin(b) * 1600} Z`} fill={color} />;
      })}
    </g>
  );
};

/** Camera that punches in on `at` and can shake. */
const Cam: React.FC<{ children: React.ReactNode; at?: number; punch?: number; shake?: number; push?: number; dur?: number }> = ({ children, at = 0, punch = 0.18, shake = 0, push = 0.06, dur = 30 }) => {
  const frame = useCurrentFrame();
  const p = 1 + punch * (1 - sp(frame, at, 13, 220)) * (frame >= at ? 1 : 0);
  const drift = 1 + push * Math.min(1, frame / Math.max(1, dur));
  const sx = shake ? Math.sin(frame * 2.7) * shake : 0, sy = shake ? Math.cos(frame * 3.3) * shake * 0.6 : 0;
  return <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${p * drift})` }}>{children}</AbsoluteFill>;
};

const Stage: React.FC<{ children?: React.ReactNode; html?: React.ReactNode; glow?: number; tint?: string; bg?: string }> = ({ children, html, glow = 0.8, tint, bg }) => (
  <AbsoluteFill>
    {bg ? <AbsoluteFill style={{ background: bg }} /> : <Backdrop glow={glow} />}
    {tint && <AbsoluteFill style={{ background: tint }} />}
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
    {html}
  </AbsoluteFill>
);

const Floor: React.FC<{ y?: number }> = ({ y = GROUND }) => <line x1={60} y1={y + 6} x2={1020} y2={y + 6} stroke="rgba(255,255,255,0.25)" strokeWidth={5} strokeLinecap="round" />;

const Couch: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-150} width={300} height={90} rx={30} fill="#2A3554" />
    <rect x={-170} y={-75} width={340} height={70} rx={24} fill="#3A4870" />
    <rect x={-190} y={-120} width={50} height={115} rx={22} fill="#2A3554" /><rect x={140} y={-120} width={50} height={115} rx={22} fill="#2A3554" />
  </g>
);

const Gym: React.FC = () => (
  <g opacity={0.9}>
    <rect x={640} y={980} width={330} height={400} rx={14} fill="none" stroke="#3A4870" strokeWidth={10} />
    {[1080, 1180, 1280].map((y) => <line key={y} x1={640} y1={y} x2={970} y2={y} stroke="#3A4870" strokeWidth={8} />)}
    {[700, 800, 900].map((x) => [1060, 1160, 1260].map((y) => <rect key={`${x}${y}`} x={x - 22} y={y - 10} width={44} height={20} rx={6} fill="#5B6478" />))}
    <text x={805} y={950} textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize={60} fill="#3A4870">GYM</text>
  </g>
);

const Pill: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; color?: string; size?: number }> = ({ at, x, y, children, color = BLUE, size = 44 }) => {
  const s = useSpr(at, { damping: 11, stiffness: 180, mass: 0.6 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${s})`, opacity: Math.min(1, s), fontFamily: FONT, fontWeight: 850,
      fontSize: size, color: "white", background: color, padding: "14px 30px", borderRadius: 999, boxShadow: `0 0 40px ${color}88`, whiteSpace: "nowrap" }}>{children}</div>
  );
};

/** A pop-in emoji that bobs. */
const Pop: React.FC<{ at: number; x: number; y: number; e: string; size?: number; rot?: number }> = ({ at, x, y, e, size = 120, rot = 0 }) => {
  const frame = useCurrentFrame();
  const s = sp(frame, at, 8, 200);
  return <div style={{ position: "absolute", left: x, top: y, fontSize: size, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot + Math.sin(frame / 6) * 6}deg) translateY(${Math.sin(frame / 7) * 8}px)`, opacity: Math.min(1, s * 2) }}>{e}</div>;
};

/** A fingertip that travels to a point and taps, with a ripple. */
const Finger: React.FC<{ from: [number, number]; to: [number, number]; at: number; travel?: number; drag?: [number, number]; dragDur?: number }> = ({ from, to, at, travel = 10, drag, dragDur = 10 }) => {
  const frame = useCurrentFrame();
  const m = interpolate(frame, [at - travel, at], [0, 1], clamp);
  const e = 1 - Math.pow(1 - m, 3);
  let x = from[0] + (to[0] - from[0]) * e, y = from[1] + (to[1] - from[1]) * e;
  if (drag) {
    const d = interpolate(frame, [at + 2, at + 2 + dragDur], [0, 1], clamp);
    x += (drag[0] - to[0]) * d; y += (drag[1] - to[1]) * d;
  }
  const press = frame >= at && frame < at + 4 + (drag ? dragDur : 0) ? 0.88 : 1;
  const rip = interpolate(frame - at, [0, 14], [0, 1], clamp);
  return (
    <>
      {frame >= at && rip < 1 && <div style={{ position: "absolute", left: to[0] - 60, top: to[1] - 60, width: 120, height: 120, borderRadius: 60, border: "6px solid white", opacity: 1 - rip, transform: `scale(${0.3 + rip})` }} />}
      <div style={{ position: "absolute", left: x - 40, top: y - 10, fontSize: 110, transform: `scale(${press}) rotate(-12deg)`, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))", opacity: interpolate(frame, [at - travel - 4, at - travel], [0, 1], clamp) }}>👆</div>
    </>
  );
};

/** A big phone on screen that holds an app view. */
const BigPhone: React.FC<{ children: React.ReactNode; y?: number; tilt?: number }> = ({ children, y = 170, tilt = 0 }) => {
  const frame = useCurrentFrame();
  const s = sp(frame, 0, 14, 160);
  return (
    <div style={{ position: "absolute", left: 540 - 330, top: y, width: 660, height: 1240, borderRadius: 90, background: "linear-gradient(145deg,#5a5f6b,#1d2027 30%,#3b3f48 70%,#15171c)", padding: 4,
      transform: `translateY(${(1 - s) * 400}px) rotate(${tilt + (1 - s) * 8}deg)`, boxShadow: "0 60px 140px rgba(0,0,0,0.7), 0 0 120px rgba(26,123,255,0.25)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 86, background: "#000", padding: 18, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 70, overflow: "hidden", background: "linear-gradient(180deg,#0B1428,#081022)", fontFamily: FONT, color: "white" }}>
          <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", width: 190, height: 56, borderRadius: 28, background: "#000", zIndex: 5 }} />
          <div style={{ position: "absolute", top: 100, left: 40, right: 40, display: "flex", alignItems: "center", gap: 16 }}>
            <Img src={staticFile("icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
            <div style={{ fontWeight: 850, fontSize: 46 }}>Back<span style={{ color: BLUE }}>In</span></div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

/** A small stick avatar (for app rows and bubbles). */
const Avatar: React.FC<{ color: string; mood: Mood; size?: number }> = ({ color, mood, size = 90 }) => (
  <svg width={size} height={size} viewBox="-40 -40 80 80" style={{ display: "block" }}>
    <circle r={34} fill="#0B1428" stroke={color} strokeWidth={5} />
    <g transform="translate(-13,2) scale(0.95)"><Face mood={mood} c={color} /></g>
  </svg>
);

// ── Scenes ──
const IntroFace: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wink = frame > 8 && frame < 15;
  return (
    <Cam dur={dur} push={0.08}>
      <Stage bg="radial-gradient(900px 900px at 540px 760px, #1A3A7A, #040915 75%)" html={<Pill at={6} x={540} y={300} size={56}>This is Alex 👋</Pill>}>
        <Rays color={BLUE} o={0.12} />
        <Head id="i" x={540} y={780} r={300} color={ALEX} mood={wink ? "smug" : "happy"} tilt={Math.sin(frame / 6) * 4} />
      </Stage>
      <Sfx at={0} name="whoosh" /><Sfx at={6} name="pop" />
    </Cam>
  );
};

const IntroWide: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur * 0.6], [-60, 540], clamp);
  const walking = frame < dur * 0.6;
  return (
    <Stage>
      <Floor />
      <Stick x={x} y={GROUND} s={2.3} mood="happy" pose={walking ? walk(frame) : PHONE} phone glow={walking ? 0 : 1} phoneRot={walking ? 20 : -15} />
    </Stage>
  );
};

const SkipWide: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <Stage html={<Pill at={4} x={540} y={420} color={RED}>Gym day 🏋️</Pill>}>
      <Floor /><Couch x={540} y={GROUND} s={1.9} />
      <Stick x={520} y={GROUND - 30} s={2.2} mood="sleepy" pose={{ ...SEATED, lean: -16 + Math.sin(frame / 12) * 2 }} phone phoneRot={-30} />
      <Sfx at={0} name="whoosh" /><Sfx at={4} name="buzz" volume={0.4} />
    </Stage>
  );
};

const SkipFace: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Cam dur={dur} at={0} push={0.1}>
      <Stage bg="radial-gradient(900px 900px at 540px 800px, #2A2550, #040915 75%)" html={<>
        <Bubble x={430} y={250} s={sp(frame, 4)} think tail="left">gym? nah 😴</Bubble>
        <Pop at={12} x={830} y={620} e="💤" size={110} />
        <Pop at={18} x={230} y={560} e="🛋️" size={100} rot={-10} />
      </>}>
        <Head id="sf" x={520} y={860} r={290} color={ALEX} mood="smug" tilt={-8 + Math.sin(frame / 10) * 3} />
      </Stage>
      <Sfx at={4} name="pop" />
    </Cam>
  );
};

/** Three friends, three stacked close-ups lit by their phones. */
const FriendsOn: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const iconAt = f(st(14) - st(9));
  return (
    <Stage bg="#040915" html={<>
      {FRIENDS.map((fr, i) => {
        const s = sp(frame, 2 + i * 7, 12, 160);
        return (
          <div key={i} style={{ position: "absolute", left: i === 1 ? 650 : 120, top: 160 + i * 440, transform: `scale(${s})`, fontFamily: FONT, fontWeight: 850, fontSize: 60, color: fr.color }}>{fr.name}</div>
        );
      })}
      <Pill at={iconAt} x={540} y={1440} size={50}><span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}><Img src={staticFile("icon.png")} style={{ width: 58, height: 58, borderRadius: 14 }} />all on BackIn</span></Pill>
    </>}>
      {FRIENDS.map((fr, i) => {
        const s = sp(frame, 2 + i * 7, 12, 160);
        const y0 = 40 + i * 440;
        const slide = (1 - s) * (i === 1 ? -1100 : 1100);
        return (
          <g key={i} transform={`translate(${slide},0)`}>
            <clipPath id={`p${i}`}><rect x={30} y={y0} width={1020} height={410} rx={50} /></clipPath>
            <rect x={30} y={y0} width={1020} height={410} rx={50} fill={fr.color} opacity={0.14} />
            <g clipPath={`url(#p${i})`}>
              <Head id={`f${i}`} x={i === 1 ? 330 : 750} y={y0 + 230} r={150} color={fr.color} mood={frame > iconAt ? "excited" : "happy"} lit={1} tilt={(i === 1 ? -1 : 1) * 6 + Math.sin(frame / 7 + i) * 3} />
              <g transform={`translate(${i === 1 ? 560 : 520},${y0 + 330}) rotate(${i === 1 ? 14 : -14})`}>
                <rect x={-50} y={-90} width={100} height={180} rx={20} fill="#05080F" stroke={fr.color} strokeWidth={6} />
                <rect x={-40} y={-78} width={80} height={156} rx={12} fill="#0E2A5C" />
                <image href={staticFile("icon.png")} x={-24} y={-24} width={48} height={48} />
              </g>
            </g>
          </g>
        );
      })}
      {FRIENDS.map((_, i) => <Sfx key={i} at={2 + i * 7} name="whoosh" volume={0.35} />)}
      <Sfx at={iconAt} name="ding" volume={0.5} />
    </Stage>
  );
};

/** POV: the app shows Alex hasn't posted proof. */
const NoProof: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const secs = Math.max(0, 59 - Math.floor(frame / 3));
  const flash = Math.floor(frame / 6) % 2 === 0;
  return (
    <Stage tint="radial-gradient(900px 900px at 540px 800px, rgba(255,59,48,0.16), transparent 70%)" html={
      <BigPhone>
        <div style={{ position: "absolute", top: 220, left: 36, right: 36, borderRadius: 40, background: "rgba(255,255,255,0.07)", padding: 32, border: `3px solid ${flash ? RED : "rgba(255,59,48,0.4)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Avatar color={ALEX} mood="smug" size={100} />
            <div><div style={{ fontWeight: 850, fontSize: 44 }}>Alex · Gym</div><div style={{ fontSize: 32, opacity: 0.7 }}>today, 7:00 PM</div></div>
          </div>
          <div style={{ marginTop: 34, height: 380, borderRadius: 28, background: "rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ fontSize: 120 }}>📷</div>
            <div style={{ fontWeight: 850, fontSize: 52, color: RED }}>No proof yet</div>
          </div>
          <div style={{ marginTop: 30, fontWeight: 900, fontSize: 64, textAlign: "center", color: RED, fontVariantNumeric: "tabular-nums" }}>⏰ 00:{String(secs).padStart(2, "0")}</div>
        </div>
      </BigPhone>
    }>
      <Sfx at={4} name="buzz" volume={0.6} />
      {[10, 20].map((t) => <Sfx key={t} at={t} name="tick" volume={0.5} />)}
    </Stage>
  );
};

const LINES = ["where's your proof? 👀", "streak dies tonight 💀", "lol skipping again 😂"];
/** Rapid-fire suspicious close-ups, one friend per beat. */
const Notice: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const per = Math.floor(dur / 3);
  const i = Math.min(2, Math.floor(frame / per));
  const fr = FRIENDS[i];
  const local = frame - i * per;
  return (
    <Cam at={i * per} punch={0.22} dur={per}>
      <Stage bg={`radial-gradient(900px 900px at 540px 820px, ${fr.color}44, #040915 75%)`} html={
        <Bubble x={i === 2 ? 120 : 380} y={300} s={sp(local, 2, 10, 220)} tail={i === 2 ? "left" : "left"} color={i === 1 ? "#FFD9D6" : "white"}>{LINES[i]}</Bubble>
      }>
        <Rays color={fr.color} o={0.1} cy={860} />
        <Head id={`n${i}`} x={i === 1 ? 600 : 480} y={880} r={300} color={fr.color} mood="suspicious" lit={1} tilt={(i % 2 ? -1 : 1) * 10} />
      </Stage>
      {[0, 1, 2].map((k) => <Sfx key={k} at={k * per} name="buzz" volume={0.55} />)}
    </Cam>
  );
};

const Panic: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Cam punch={0.3} shake={14} dur={dur}>
      <Stage bg="radial-gradient(900px 900px at 540px 820px, rgba(255,59,48,0.45), #040915 75%)" html={<Pop at={2} x={850} y={430} e="😳" size={150} />}>
        <Rays color={RED} o={0.14} cy={860} />
        <Head id="pa" x={540} y={880} r={320} color={ALEX} mood="shocked" sweat tilt={Math.sin(frame * 2) * 4} />
      </Stage>
      <Sfx at={0} name="stamp" volume={0.7} />
    </Cam>
  );
};

const Goes: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const walkEnd = Math.round(dur * 0.5);
  const x = interpolate(frame, [0, walkEnd], [-80, 380], clamp);
  const lifting = frame > walkEnd;
  const curl = (Math.sin((frame - walkEnd) / 3) + 1) / 2;
  return (
    <Stage>
      <Floor /><Gym />
      <Stick x={x} y={GROUND} s={2.3} mood={lifting ? "determined" : "sad"} pose={lifting ? { ...STAND, armF: [10, 10 + curl * 150] } : walk(frame, 0.6)} prop={lifting ? "dumbbell" : undefined} sweat={lifting} />
      <Sfx at={0} name="whoosh" />
    </Stage>
  );
};

const GoFace: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Cam punch={0.25} dur={dur} shake={frame < 8 ? 6 : 0}>
      <Stage bg="radial-gradient(900px 900px at 540px 820px, rgba(255,140,0,0.4), #040915 75%)" html={<>
        <Pop at={2} x={220} y={480} e="💪" size={170} rot={-12} />
        <Pop at={6} x={860} y={520} e="🔥" size={140} />
      </>}>
        <Rays color={ORANGE} o={0.18} cy={860} />
        <Head id="gf" x={540} y={880} r={300} color={ALEX} mood="determined" sweat tilt={Math.sin(frame / 3) * 3} />
      </Stage>
      <Sfx at={0} name="boom" volume={0.6} />
    </Cam>
  );
};

/** Selfie POV through the camera: tap the shutter, the photo flies out. */
const Snaps: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shot = f(st(24) - st(22));
  const flash = interpolate(frame, [shot, shot + 2, shot + 10], [0, 1, 0], clamp);
  const fly = interpolate(frame, [shot + 8, dur - 2], [0, 1], clamp);
  const frozen = frame >= shot;
  return (
    <Stage bg="#000" html={<>
      {/* viewfinder corners + REC */}
      {[[90, 170], [990, 170], [90, 1360], [990, 1360]].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x - (i % 2 ? 90 : 0), top: y - (i > 1 ? 90 : 0), width: 90, height: 90,
          borderTop: i < 2 ? "8px solid white" : undefined, borderBottom: i > 1 ? "8px solid white" : undefined, borderLeft: i % 2 === 0 ? "8px solid white" : undefined, borderRight: i % 2 ? "8px solid white" : undefined }} />
      ))}
      <div style={{ position: "absolute", top: 210, left: 140, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 36, color: "white" }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: RED, opacity: Math.floor(frame / 8) % 2 ? 1 : 0.3 }} />PROOF
      </div>
      <div style={{ position: "absolute", left: 540 - 70, top: 1250, width: 140, height: 140, borderRadius: 70, border: "10px solid white", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 100, height: 100, borderRadius: 50, background: "white", transform: `scale(${frame >= shot && frame < shot + 4 ? 0.8 : 1})` }} />
      </div>
      <Finger from={[880, 1700]} to={[560, 1320]} at={shot} travel={12} />
      <AbsoluteFill style={{ background: "white", opacity: flash * 0.85 }} />
      {frozen && fly > 0 && (
        <div style={{ position: "absolute", left: 340 + fly * 320, top: 500 - fly * 420, width: 400, height: 520, borderRadius: 30, background: "white", padding: 16, boxSizing: "border-box",
          transform: `scale(${1 - fly * 0.6}) rotate(${fly * 14}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
          <div style={{ width: "100%", height: 400, borderRadius: 18, background: "radial-gradient(circle at 50% 60%, #3A2A10, #120C06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 160 }}>💪</div>
          <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 40, color: "#0B1428", textAlign: "center", marginTop: 12 }}>sent ✈️</div>
        </div>
      )}
    </>}>
      <rect x={60} y={140} width={960} height={1280} rx={40} fill="url(#gymbg)" />
      <defs><radialGradient id="gymbg" cx="50%" cy="45%" r="70%"><stop offset="0%" stopColor="#3A2A10" /><stop offset="100%" stopColor="#0B0905" /></radialGradient></defs>
      <Head id="sn" x={540} y={760} r={frozen ? 270 : 260 + Math.sin(frame / 4) * 6} color={ALEX} mood={frozen ? "excited" : "happy"} sweat tilt={frozen ? -6 : Math.sin(frame / 5) * 5} />
      <g transform="translate(860,1000) rotate(-20) scale(2.2)">
        <rect x={-30} y={-5} width={60} height={10} rx={4} fill="#9AA4B8" />
        <rect x={-38} y={-18} width={14} height={36} rx={4} fill="#5B6478" /><rect x={24} y={-18} width={14} height={36} rx={4} fill="#5B6478" />
      </g>
      <Sfx at={shot} name="shutter" volume={1} /><Sfx at={shot + 8} name="whoosh" />
    </Stage>
  );
};

/** POV: friends' feed. The proof card gets swiped right, three approvals pop in. */
const Approve: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const swipeAt = 10;
  const sw = interpolate(frame, [swipeAt + 2, swipeAt + 12], [0, 1], clamp);
  const stamp = sp(frame, swipeAt + 4, 9, 260);
  return (
    <Stage tint="radial-gradient(900px 900px at 540px 800px, rgba(52,199,89,0.16), transparent 70%)" html={<>
      <BigPhone>
        <div style={{ position: "absolute", top: 210, left: 40, right: 40, height: 700, borderRadius: 40, background: "white", color: "#0B1428", padding: 24, boxSizing: "border-box",
          transform: `translateX(${sw * 160}px) rotate(${sw * 10}deg)`, boxShadow: `0 0 ${60 * sw}px ${GREEN}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Avatar color="#0B1428" mood="excited" size={80} /><div style={{ fontWeight: 850, fontSize: 40 }}>Alex · Gym ✅</div></div>
          <div style={{ marginTop: 20, height: 520, borderRadius: 24, background: "radial-gradient(circle at 50% 60%, #3A2A10, #120C06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 220 }}>💪</div>
          <div style={{ position: "absolute", top: 260, left: 60, padding: "10px 30px", border: `10px solid ${GREEN}`, borderRadius: 20, color: GREEN, fontWeight: 900, fontSize: 80,
            transform: `rotate(-14deg) scale(${stamp})`, opacity: Math.min(1, stamp), background: "rgba(255,255,255,0.85)" }}>LEGIT</div>
        </div>
        <div style={{ position: "absolute", top: 950, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
          {FRIENDS.map((fr, i) => {
            const s = sp(frame, swipeAt + 10 + i * 5, 9, 200);
            return (
              <div key={i} style={{ position: "relative", transform: `scale(${s})` }}>
                <Avatar color={fr.color} mood="excited" size={130} />
                <div style={{ position: "absolute", right: -8, bottom: -8, width: 54, height: 54, borderRadius: 27, background: GREEN, color: "white", fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
              </div>
            );
          })}
        </div>
      </BigPhone>
      <Finger from={[300, 1700]} to={[420, 760]} at={swipeAt} travel={9} drag={[760, 720]} dragDur={10} />
      <Pill at={swipeAt + 26} x={540} y={90} color={GREEN} size={52}>3/3 approved ✓</Pill>
      <Confetti at={swipeAt + 26} x={540} y={900} n={50} />
    </>}>
      <Sfx at={swipeAt + 2} name="swipe" volume={0.7} /><Sfx at={swipeAt + 4} name="stamp" volume={0.6} />
      {FRIENDS.map((_, i) => <Sfx key={i} at={swipeAt + 10 + i * 5} name="ding" volume={0.45} />)}
    </Stage>
  );
};

const Streak: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const hit = 10;
  const n = frame < hit ? 29 : 30;
  const burst = interpolate(frame - hit, [0, 20], [0, 1], clamp);
  const pulse = interpolate(frame, [hit, hit + 4, hit + 12], [1, 1.25, 1], clamp);
  return (
    <Cam at={hit} punch={0.12}>
      <Stage glow={0.4} tint={`radial-gradient(800px 800px at 540px 500px, rgba(255,140,0,${0.32 + 0.1 * Math.sin(frame / 6)}), transparent 70%)`} html={<>
        <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pulse})` }}>
          <div style={{ position: "absolute", top: 20, width: 480, height: 480, borderRadius: 240, border: `10px solid ${ORANGE}`, opacity: (1 - burst) * (frame >= hit ? 1 : 0), transform: `scale(${0.4 + burst})` }} />
          <div style={{ fontSize: 170, lineHeight: 1 }}>🔥</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 190, color: "white", lineHeight: 1, letterSpacing: -6 }}>{n}</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, color: ORANGE, letterSpacing: 4 }}>DAY STREAK</div>
        </div>
        <Confetti at={hit} x={540} y={500} n={60} />
      </>}>
        <Head id="st" x={540} y={1130} r={190} color={ALEX} mood="excited" tilt={Math.sin(frame / 4) * 6} />
        {FRIENDS.map((fr, i) => i !== 1 && (
          <Head key={i} id={`s${i}`} x={i === 0 ? 190 : 890} y={1250 - Math.abs(Math.sin(frame / 5 + i)) * 40} r={110} color={fr.color} mood="excited" tilt={(i ? -1 : 1) * 12} />
        ))}
        <Sfx at={hit} name="boom" volume={0.8} /><Sfx at={hit} name="ding" volume={0.5} />
      </Stage>
    </Cam>
  );
};

const End: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Outro dur={dur} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {[{ c: ALEX, x: 220 }, ...FRIENDS.map((f2, i) => ({ c: f2.color, x: 420 + i * 200 }))].map((p, i) => (
          <Stick key={i} x={p.x} y={1840 - Math.abs(Math.sin(frame / 5 + i)) * 20} s={1.0} color={p.c} mood="excited" pose={i % 2 ? CHEER : { ...STAND, armF: [150 + Math.sin(frame / 4 + i) * 20, 165] }} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const PANIC = st(19) - 0.5;
const GOFACE = st(21) + 0.35;
const CUTS: [React.FC<{ dur: number }>, number][] = [
  [IntroFace, 0], [IntroWide, 0.95], [SkipWide, st(3)], [SkipFace, st(7)], [FriendsOn, st(9)], [NoProof, st(15)],
  [Notice, st(17)], [Panic, PANIC], [Goes, st(19)], [GoFace, GOFACE], [Snaps, st(22)], [Approve, st(25)], [Streak, st(29)], [End, st(31)],
];
export const REEL4_FRAMES = f(END);

export const BackInReel4: React.FC<{ sfx: boolean; voice?: boolean }> = ({ sfx, voice = true }) => (
  <Level.Provider value={sfx ? (voice ? 0.45 : 1) : 0}>
    <AbsoluteFill style={{ background: "#040915" }}>
      {CUTS.map(([Scene, a], i) => {
        const b = CUTS[i + 1]?.[1] ?? END;
        const d = f(b) - f(a);
        return (
          <Sequence key={i} from={f(a)} durationInFrames={d}>
            <Shot dur={d}><Scene dur={d} /></Shot>
          </Sequence>
        );
      })}
      <CaptionTrack words={W} from={0} to={st(31)} />
      {voice && <Audio src={staticFile(V.audio)} />}
    </AbsoluteFill>
  </Level.Provider>
);
