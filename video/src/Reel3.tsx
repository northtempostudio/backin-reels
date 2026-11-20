import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { BLUE, Backdrop, FONT } from "./Brand";
import { CaptionTrack, Confetti, GREEN, Level, ORANGE, Outro, RED, Sfx, Shot, clamp, f, useSpr } from "./Reel";
import { Bubble, CHEER, PHONE, SEATED, SELFIE, STAND, Stick, walk } from "./Stick";
import V from "./stick.json";

const W = V.words;
const st = (i: number) => W[i].s - 0.05;
const T = { skip: st(3), friends: st(9), notice: st(15), goes: st(19), snaps: st(22), approve: st(25), streak: st(29), outro: st(31) };
const END = W[W.length - 1].e + 1.8;
const GROUND = 1380;
const FRIENDS = [
  { name: "Maya", color: "#FF6FB5", x: 210 },
  { name: "Sam", color: "#4ADE80", x: 540 },
  { name: "Jordan", color: "#FFB547", x: 870 },
];

const Stage: React.FC<{ children: React.ReactNode; html?: React.ReactNode; glow?: number; tint?: string }> = ({ children, html, glow = 0.8, tint }) => (
  <AbsoluteFill>
    <Backdrop glow={glow} />
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
    <rect x={-160} y={-5} width={14} height={14} fill="#1A2238" /><rect x={146} y={-5} width={14} height={14} fill="#1A2238" />
  </g>
);

const Pill: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; color?: string }> = ({ at, x, y, children, color = BLUE }) => {
  const s = useSpr(at, { damping: 11, stiffness: 180, mass: 0.6 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${s})`, opacity: s, fontFamily: FONT, fontWeight: 850,
      fontSize: 44, color: "white", background: color, padding: "14px 30px", borderRadius: 999, boxShadow: `0 0 40px ${color}88`, whiteSpace: "nowrap" }}>{children}</div>
  );
};

// ── Scenes ──
const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const arrive = Math.min(1, frame / (dur * 0.55));
  const x = interpolate(arrive, [0, 1], [-80, 540]);
  const walking = arrive < 1;
  return (
    <Stage html={<Pill at={Math.round(dur * 0.5)} x={540} y={760}>This is Alex 👋</Pill>}>
      <Floor />
      <Stick x={x} y={GROUND} s={2.3} mood="happy" pose={walking ? walk(frame) : PHONE} phone glow={walking ? 0 : 1} phoneRot={walking ? 20 : -15} />
      <Sfx at={0} name="whoosh" /><Sfx at={Math.round(dur * 0.5)} name="pop" />
    </Stage>
  );
};

const Skip: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const b = useSpr(8, { damping: 11, stiffness: 170, mass: 0.6 });
  return (
    <Stage html={<>
      <Bubble x={560} y={720} s={b} think tail="left">gym? nah 😴</Bubble>
      <div style={{ position: "absolute", left: 330, top: 840, fontSize: 70, opacity: interpolate(frame, [20, 30], [0, 1], clamp), transform: `translateY(${-Math.sin(frame / 8) * 12}px)` }}>💤</div>
    </>}>
      <Floor />
      <Couch x={540} y={GROUND} s={1.9} />
      <Stick x={520} y={GROUND - 30} s={2.2} mood="smug" pose={{ ...SEATED, lean: -16 + Math.sin(frame / 12) * 2 }} phone phoneRot={-30} />
      <Sfx at={0} name="whoosh" /><Sfx at={8} name="pop" />
    </Stage>
  );
};

/** Three friends up top with BackIn on their phones; Alex on the couch below. */
const Crew: React.FC<{ mood: "happy" | "suspicious" | "excited"; pop?: boolean; alexMood: "smug" | "shocked" | "happy"; children?: React.ReactNode; html?: React.ReactNode; swipe?: boolean }> = ({ mood, pop, alexMood, children, html, swipe }) => {
  const frame = useCurrentFrame();
  return (
    <Stage tint={mood === "suspicious" ? "radial-gradient(900px 600px at 540px 600px, rgba(255,59,48,0.14), transparent 70%)" : undefined} html={html}>
      <Floor y={900} /><Floor y={1500} />
      {FRIENDS.map((fr, i) => {
        const s = pop ? spring({ frame: frame - 4 - i * 5, fps: 30, config: { damping: 12, stiffness: 150 } }) : 1;
        const sw = swipe ? interpolate(frame, [8 + i * 6, 14 + i * 6, 22 + i * 6], [0, 1, 0.2], clamp) : 0;
        const pose = mood === "excited" ? { ...PHONE, armB: [-120, -150] as [number, number] } : PHONE;
        return <Stick key={i} x={fr.x} y={900} s={1.45 * s} facing={i === 2 ? -1 : 1} color={fr.color} mood={mood} pose={{ ...pose, armF: [30 + sw * 50, 122 - sw * 40] }} phone glow={1} />;
      })}
      <Couch x={540} y={1500} s={1.3} />
      <Stick x={525} y={1480} s={1.5} mood={alexMood} pose={SEATED} phone phoneRot={alexMood === "shocked" ? -30 + Math.sin(frame * 2.5) * 12 : -30} sweat={alexMood === "shocked"} glow={alexMood === "shocked" ? 1 : 0} />
      {children}
    </Stage>
  );
};

const FriendsOn: React.FC<{ dur: number }> = () => (
  <Crew mood="happy" pop alexMood="smug" html={<>
    {FRIENDS.map((fr, i) => <div key={i} style={{ position: "absolute", left: fr.x, top: 930, transform: "translateX(-50%)", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: fr.color }}>{fr.name}</div>)}
    <Pill at={18} x={540} y={300}><span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}><Img src={staticFile("icon.png")} style={{ width: 52, height: 52, borderRadius: 12 }} />all on BackIn</span></Pill>
  </>}>
    {FRIENDS.map((_, i) => <Sfx key={i} at={4 + i * 5} name="pop" volume={0.5} />)}
  </Crew>
);

const LINES = ["where's your proof? 👀", "streak dies tonight 💀", "lol he's skipping 😂"];
const Notice: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <Crew mood="suspicious" alexMood="shocked" html={<>
      {FRIENDS.map((fr, i) => {
        const s = spring({ frame: frame - 3 - i * 9, fps: 30, config: { damping: 11, stiffness: 180, mass: 0.6 } });
        const y = [250, 400, 550][i];
        return <Bubble key={i} x={i === 2 ? fr.x - 470 : fr.x - 60} y={y} s={s} tail={i === 2 ? "right" : "left"} color={i === 1 ? "#FFD9D6" : "white"}>{LINES[i]}</Bubble>;
      })}
      <div style={{ position: "absolute", left: 640, top: 1150, width: 70, height: 70, borderRadius: 35, background: RED, color: "white", fontFamily: FONT, fontWeight: 900, fontSize: 40,
        display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: frame - 6, fps: 30, config: { damping: 9 } })})` }}>3</div>
    </>}>
      {FRIENDS.map((_, i) => <Sfx key={i} at={3 + i * 9} name="buzz" volume={0.6} />)}
    </Crew>
  );
};

const Gym: React.FC = () => (
  <g opacity={0.9}>
    <rect x={640} y={980} width={330} height={400} rx={14} fill="none" stroke="#3A4870" strokeWidth={10} />
    {[1080, 1180, 1280].map((y) => <line key={y} x1={640} y1={y} x2={970} y2={y} stroke="#3A4870" strokeWidth={8} />)}
    {[700, 800, 900].map((x, i) => [1060, 1160, 1260].map((y) => <rect key={`${x}${y}`} x={x - 22} y={y - 10} width={44} height={20} rx={6} fill="#5B6478" />))}
    <text x={805} y={950} textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize={60} fill="#3A4870">GYM</text>
  </g>
);

const Goes: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const walkEnd = Math.round(dur * 0.4);
  const x = interpolate(frame, [0, walkEnd], [-80, 380], clamp);
  const lifting = frame > walkEnd;
  const curl = (Math.sin((frame - walkEnd) / 4) + 1) / 2;
  return (
    <Stage html={lifting ? <div style={{ position: "absolute", left: 160, top: 700, fontSize: 110, transform: `scale(${spring({ frame: frame - walkEnd - 4, fps: 30, config: { damping: 9 } })})` }}>💪</div> : null}>
      <Floor /><Gym />
      <Stick x={x} y={GROUND} s={2.3} mood={lifting ? "determined" : "sad"} sweat={lifting}
        pose={lifting ? { ...STAND, armF: [10, 10 + curl * 150] } : walk(frame)} prop={lifting ? "dumbbell" : undefined} />
      <Sfx at={0} name="whoosh" />{lifting && <Sfx at={walkEnd + 4} name="boom" volume={0.6} />}
    </Stage>
  );
};

const Snaps: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shot = 12;
  const flash = interpolate(frame, [shot, shot + 2, shot + 10], [0, 1, 0], clamp);
  const fly = interpolate(frame, [shot + 10, dur - 4], [0, 1], clamp);
  return (
    <Stage html={<>
      <AbsoluteFill style={{ background: "white", opacity: flash * 0.8 }} />
      {frame > shot + 8 && (
        <div style={{ position: "absolute", left: 640 + fly * 200, top: 700 - fly * 520, transform: `scale(${1 - fly * 0.5}) rotate(${fly * 12}deg)`, opacity: 1 - fly * 0.3,
          width: 200, height: 260, borderRadius: 26, background: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 100 }}>🏋️</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#0B1428" }}>proof ✈️</div>
        </div>
      )}
    </>}>
      <Floor /><Gym />
      <Stick x={460} y={GROUND} s={2.3} mood="happy" pose={SELFIE} phone glow={1} phoneRot={-170} />
      <Sfx at={shot} name="shutter" volume={1} /><Sfx at={shot + 10} name="whoosh" />
    </Stage>
  );
};

const Approve: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <Crew mood="excited" swipe alexMood="happy" html={<>
      {FRIENDS.map((fr, i) => {
        const s = spring({ frame: frame - 14 - i * 6, fps: 30, config: { damping: 9, stiffness: 180 } });
        return <div key={i} style={{ position: "absolute", left: fr.x - 45, top: 440, width: 90, height: 90, borderRadius: 45, background: GREEN, color: "white", fontSize: 56, fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, boxShadow: `0 0 40px ${GREEN}` }}>✓</div>;
      })}
      <Pill at={30} x={540} y={250} color={GREEN}>Approved ✓</Pill>
      <Confetti at={30} x={540} y={1150} n={50} />
    </>}>
      {FRIENDS.map((_, i) => <React.Fragment key={i}><Sfx at={8 + i * 6} name="swipe" volume={0.6} /><Sfx at={14 + i * 6} name="ding" volume={0.45} /></React.Fragment>)}
    </Crew>
  );
};

const Streak: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const n = frame < 10 ? 29 : 30;
  const hit = 10;
  const burst = interpolate(frame - hit, [0, 20], [0, 1], clamp);
  const pulse = interpolate(frame, [hit, hit + 4, hit + 12], [1, 1.25, 1], clamp);
  const jump = Math.abs(Math.sin(frame / 5)) * 50;
  return (
    <Stage glow={0.4} tint={`radial-gradient(700px 700px at 540px 600px, rgba(255,140,0,${0.3 + 0.1 * Math.sin(frame / 6)}), transparent 70%)`} html={
      <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pulse})` }}>
        <div style={{ position: "absolute", top: 40, width: 520, height: 520, borderRadius: 260, border: `10px solid ${ORANGE}`, opacity: (1 - burst) * (frame >= hit ? 1 : 0), transform: `scale(${0.4 + burst})` }} />
        <div style={{ fontSize: 200, lineHeight: 1 }}>🔥</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 200, color: "white", lineHeight: 1, letterSpacing: -6 }}>{n}</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: ORANGE, letterSpacing: 4 }}>DAY STREAK</div>
      </div>}>
      <Floor />
      <Stick x={540} y={GROUND - jump} s={2.2} mood="excited" pose={CHEER} />
      {FRIENDS.map((fr, i) => i !== 1 && <Stick key={i} x={i === 0 ? 170 : 910} y={GROUND - Math.abs(Math.sin(frame / 5 + i)) * 30} s={1.4} facing={i === 0 ? 1 : -1} color={fr.color} mood="excited" pose={CHEER} />)}
      <Sfx at={hit} name="boom" volume={0.8} /><Sfx at={hit} name="ding" volume={0.5} />
    </Stage>
  );
};

const End: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Outro dur={dur} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {[{ c: "white", x: 220 }, ...FRIENDS.map((f2, i) => ({ c: f2.color, x: 420 + i * 200 }))].map((p, i) => (
          <Stick key={i} x={p.x} y={1840} s={1.0} color={p.c} mood="excited" pose={{ ...STAND, armF: [150 + Math.sin(frame / 4 + i) * 20, 165] }} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const SCENES: [React.FC<{ dur: number }>, number, number][] = [
  [Intro, 0, T.skip], [Skip, T.skip, T.friends], [FriendsOn, T.friends, T.notice], [Notice, T.notice, T.goes],
  [Goes, T.goes, T.snaps], [Snaps, T.snaps, T.approve], [Approve, T.approve, T.streak], [Streak, T.streak, T.outro], [End, T.outro, END],
];
export const REEL3_FRAMES = f(END);

export const BackInReel3: React.FC<{ sfx: boolean; voice?: boolean }> = ({ sfx, voice = true }) => (
  <Level.Provider value={sfx ? (voice ? 0.45 : 1) : 0}>
    <AbsoluteFill style={{ background: "#040915" }}>
      {SCENES.map(([Scene, a, b], i) => (
        <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
          <Shot dur={f(b) - f(a)}><Scene dur={f(b) - f(a)} /></Shot>
        </Sequence>
      ))}
      <CaptionTrack words={W} from={0} to={T.outro} />
      {voice && <Audio src={staticFile(V.audio)} />}
    </AbsoluteFill>
  </Level.Provider>
);
