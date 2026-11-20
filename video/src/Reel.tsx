import React from "react";
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { BLUE, Backdrop, FONT, Wordmark } from "./Brand";
import { Cutout, Phone } from "./Phone";
import N from "./narration.json";

export const FPS = 30;
export const GREEN = "#22C55E";
export const RED = "#FF3B30";
export const ORANGE = "#FF9F0A";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const f = (sec: number) => Math.round(sec * FPS);
const C = N.cues;

// Sound effects sit under the narrator.
export const Level = React.createContext(1);
export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.8 }) => {
  const level = React.useContext(Level);
  return level ? (
    <Sequence from={at} durationInFrames={45}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * level} />
    </Sequence>
  ) : null;
};

export const useSpr = (at: number, config = { damping: 14, stiffness: 120, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config });
};

/** Every scene comes in out of a blur and leaves into one. */
export const Shot: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 9], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = interpolate(frame, [dur - 6, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{
      transform: `scale(${1 + enter * 0.1 - exit * 0.05})`, filter: `blur(${enter * 22 + exit * 16}px)`,
      opacity: 1 - exit * 0.6,
    }}>{children}</AbsoluteFill>
  );
};

/** A piece of the real app lifted off the screen and floating in 3D. */
export const Float: React.FC<{
  at: number; x: number; y: number; ry?: number; rx?: number; z?: number; children: React.ReactNode; glow?: string; dur: number;
}> = ({ at, x, y, ry = 0, rx = 0, z = 0, children, glow = "rgba(26,123,255,0.45)", dur }) => {
  const frame = useCurrentFrame();
  const s = useSpr(at, { damping: 13, stiffness: 110, mass: 0.9 });
  const drift = interpolate(frame, [at, dur], [0, 1], clamp);
  const bob = Math.sin((frame - at) / 14) * 8;
  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity: Math.min(1, s * 1.6),
      transform: `perspective(2000px) translateZ(${(1 - s) * -600 + z}px) translateY(${(1 - s) * 120 + bob}px) rotateY(${ry * (1 - drift * 0.4)}deg) rotateX(${rx}deg) scale(${0.7 + 0.3 * s})`,
      filter: `drop-shadow(0 50px 70px rgba(0,0,0,0.6)) drop-shadow(0 0 50px ${glow})`,
    }}>{children}</div>
  );
};

export const Chip: React.FC<{ at: number; color: string; children: React.ReactNode; x: number; y: number }> = ({ at, color, children, x, y }) => {
  const s = useSpr(at, { damping: 10, stiffness: 200, mass: 0.6 });
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `scale(${s})`, opacity: s, fontFamily: FONT, fontWeight: 800, fontSize: 40,
      color: "white", background: color, padding: "16px 30px", borderRadius: 999, boxShadow: `0 0 50px ${color}AA, 0 20px 40px rgba(0,0,0,0.5)`,
    }}>{children}</div>
  );
};

/** The phone, swinging in and turning slowly. */
export const Hero: React.FC<{ from: number; dur: number; width?: number; x?: number; y?: number; turn?: number }> = ({ from, dur, width = 580, x = 0, y = 40, turn = 1 }) => {
  const frame = useCurrentFrame();
  const s = useSpr(0, { damping: 16, stiffness: 90, mass: 1 });
  const t = interpolate(frame, [0, dur], [0, 1]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 2400 }}>
      <div style={{
        transform: `translate(${x}px, ${(1 - s) * 700 + y}px) rotateY(${((1 - s) * 40 + 8 - t * 16) * turn}deg) rotateX(${6 - t * 5}deg) rotateZ(${(1 - s) * -6 * turn}deg) scale(${0.96 + t * 0.06})`,
      }}>
        <Phone from={from} width={width} sheen={t} />
      </div>
    </AbsoluteFill>
  );
};


// ── People reacting ─────────────────────────────────────
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** A person, as a tilted photo card. */
export const Person: React.FC<{ photo: string; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; filter?: string }> = ({ photo, w, h, style, children, filter }) => (
  <div style={{ position: "absolute", width: w, height: h, borderRadius: 40, overflow: "hidden", border: "6px solid rgba(255,255,255,0.92)",
    boxShadow: "0 50px 90px rgba(0,0,0,0.6)", background: "#111", ...style }}>
    <Img src={staticFile(`${photo}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter }} />
    {children}
  </div>
);

/** iOS-style banner. */
export const Banner: React.FC<{ at: number; title: string; body: string; tint: string; x: number; y: number; w: number }> = ({ at, title, body, tint, x, y, w }) => {
  const s = useSpr(at, { damping: 14, stiffness: 170, mass: 0.7 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: s, transform: `translateY(${(1 - s) * -70}px) scale(${0.9 + 0.1 * s})`,
      display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: 32, background: "rgba(28,30,38,0.86)",
      backdropFilter: "blur(30px)", border: "1.5px solid rgba(255,255,255,0.12)", boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${tint}55`, fontFamily: FONT }}>
      <Img src={staticFile("icon.png")} style={{ width: 64, height: 64, borderRadius: 15 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: tint }}>{title}</div>
        <div style={{ fontSize: 27, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
};

export const Confetti: React.FC<{ at: number; x: number; y: number; n?: number }> = ({ at, x, y, n = 46 }) => {
  const t = useCurrentFrame() - at;
  if (t < 0 || t > 50) return null;
  const colors = [GREEN, "#FFD60A", BLUE, "#FF6FB5", "white", ORANGE];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = rnd(i) * Math.PI * 2, v = 14 + rnd(i + 99) * 26;
        const px = x + Math.cos(a) * v * t * 0.9, py = y + Math.sin(a) * v * t * 0.9 - 6 * t + 0.55 * t * t;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: 14 + rnd(i + 7) * 12, height: 8 + rnd(i + 3) * 8,
          background: colors[i % colors.length], borderRadius: 3, opacity: interpolate(t, [32, 50], [1, 0], clamp),
          transform: `rotate(${t * (8 + rnd(i) * 20)}deg)` }} />;
      })}
    </>
  );
};

/** Emoji drifting up (or sinking down). */
export const Emojis: React.FC<{ at: number; x: number; y: number; list: string[]; sink?: boolean }> = ({ at, x, y, list, sink }) => {
  const t = useCurrentFrame() - at;
  if (t < 0) return null;
  return (
    <>
      {list.map((e, i) => {
        const tt = t - i * 4;
        if (tt < 0) return null;
        const s = spring({ frame: tt, fps: FPS, config: { damping: 9, stiffness: 160 } });
        const dy = sink ? tt * 5 : -tt * 7;
        return <div key={i} style={{ position: "absolute", left: x + (i - (list.length - 1) / 2) * 110 + Math.sin(tt / 6 + i) * 14, top: y + dy,
          fontSize: 96, transform: `scale(${s}) rotate(${(rnd(i) - 0.5) * 30}deg)`, opacity: interpolate(tt, [30, 50], [1, 0], clamp) }}>{e}</div>;
      })}
    </>
  );
};

// ── Scenes ──────────────────────────────────────────────
const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const hit = f(0.95);
  const shake = frame >= hit && frame < hit + 9 ? Math.sin(frame * 2.7) * 16 * (1 - (frame - hit) / 9) : 0;
  const stamp = interpolate(frame - hit, [0, 5, 9], [3, 0.92, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const t1 = useSpr(0, { damping: 13, stiffness: 160, mass: 0.6 });
  return (
    <AbsoluteFill style={{ background: "black", transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <Img src={staticFile("SelfieGym.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${interpolate(frame, [0, dur], [1.2, 1.06])})`, filter: frame >= hit ? "saturate(0.7)" : undefined }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.7))" }} />
      <AbsoluteFill style={{ background: RED, opacity: interpolate(frame, [hit, hit + 2, hit + 10], [0, 0.35, 0], clamp) }} />
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 850, fontSize: 88,
        letterSpacing: -2.5, lineHeight: 1.05, color: "white", opacity: t1, transform: `translateY(${(1 - t1) * 40}px)`, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
        My friends just<br />rejected my workout.
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: RED, border: `10px solid ${RED}`, borderRadius: 24, padding: "0 36px",
          transform: `rotate(-12deg) scale(${stamp})`, opacity: frame >= hit ? 1 : 0, background: "rgba(0,0,0,0.3)", boxShadow: `0 0 70px ${RED}88` }}>
          REDO ✕
        </div>
      </AbsoluteFill>
      <Sfx at={hit} name="stamp" volume={1} /><Sfx at={hit} name="boom" volume={0.7} />
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop glow={1.5} />
      <Wordmark size={1.05} />
      <AbsoluteFill style={{ background: "white", opacity: interpolate(frame, [0, 2, 10], [0.8, 0.5, 0], clamp) }} />
      <Sfx at={0} name="boom" volume={0.8} /><Sfx at={0} name="ding" volume={0.35} />
    </AbsoluteFill>
  );
};

const Feed: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const base = 1.34; // footage second at the start of this scene
  const approve = f(4.05 - base);
  // The friend's swipe, then a green streak down to the poster.
  const swipe = interpolate(frame, [approve - 14, approve], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const beam = interpolate(frame, [approve, approve + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const glow = interpolate(frame, [approve + 8, approve + 14, approve + 40], [0, 1, 0.35], clamp);
  const friendIn = useSpr(4, { damping: 13, stiffness: 120, mass: 0.8 });
  const posterIn = useSpr(12, { damping: 13, stiffness: 120, mass: 0.8 });
  const pop = interpolate(frame, [approve + 8, approve + 13, approve + 22], [1, 1.08, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Hero from={base} dur={dur} x={-200} width={520} turn={1} />
      {/* The friend reviewing */}
      <Person photo="SelfieWater" w={300} h={380} style={{ left: 700, top: 270, transform: `rotate(6deg) scale(${friendIn}) translateY(${(1 - friendIn) * 200}px)`, opacity: friendIn }}>
        <div style={{ position: "absolute", left: 40 + swipe * 170, top: 250 - Math.sin(swipe * Math.PI) * 40, width: 70, height: 70, borderRadius: 35,
          background: "rgba(255,255,255,0.9)", boxShadow: "0 0 0 12px rgba(255,255,255,0.25)", opacity: frame > approve - 16 && frame < approve + 4 ? 1 : 0 }} />
        <div style={{ position: "absolute", inset: 0, background: GREEN, opacity: swipe * 0.35 * (frame < approve + 10 ? 1 : 0) }} />
      </Person>
      {/* The streak between them */}
      <div style={{ position: "absolute", left: 830, top: 650, width: 14, height: 300 * beam, borderRadius: 7,
        background: `linear-gradient(${GREEN}, rgba(34,197,94,0))`, boxShadow: `0 0 30px ${GREEN}`, opacity: frame < approve + 22 ? 1 : 0 }} />
      {/* The one who posted */}
      <Person photo="SelfieGym" w={430} h={560} style={{ left: 600, top: 900, transform: `rotate(-5deg) scale(${posterIn * pop}) translateY(${(1 - posterIn) * 300}px)`,
        opacity: posterIn, boxShadow: `0 50px 90px rgba(0,0,0,0.6), 0 0 ${90 * glow}px ${GREEN}`, borderColor: glow > 0.2 ? GREEN : "rgba(255,255,255,0.92)" }} />
      <Confetti at={approve + 10} x={810} y={1150} />
      <Emojis at={approve + 14} x={770} y={1050} list={["💪", "🔥", "👏"]} />
      <Banner at={approve + 10} x={430} y={760} w={620} tint={GREEN} title="Approved ✓" body="Your gym session counts. +1 day" />
      <Sfx at={0} name="whoosh" /><Sfx at={4} name="pop" volume={0.5} /><Sfx at={12} name="pop" volume={0.5} />
      <Sfx at={approve - 12} name="swipe" /><Sfx at={approve + 10} name="ding" volume={0.7} />
    </AbsoluteFill>
  );
};

const Redo: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const base = 7.3;
  const sent = f(8.3 - base);
  const sad = interpolate(frame, [sent, sent + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const inS = useSpr(4, { damping: 13, stiffness: 120, mass: 0.8 });
  const shake = frame >= sent && frame < sent + 10 ? Math.sin(frame * 3) * 10 * (1 - (frame - sent) / 10) : 0;
  return (
    <AbsoluteFill>
      <Backdrop glow={1 - sad * 0.7} />
      <AbsoluteFill style={{ background: `radial-gradient(800px 900px at 330px 900px, rgba(255,59,48,${0.08 + 0.18 * sad}), transparent 70%)` }} />
      <Hero from={base} dur={dur} x={200} width={520} turn={-1} />
      <Person photo="SelfieRead" w={470} h={620} filter={`grayscale(${sad}) brightness(${1 - sad * 0.35}) contrast(${1 + sad * 0.1})`}
        style={{ left: 60, top: 640, opacity: inS,
          transform: `translateX(${shake}px) translateY(${(1 - inS) * 300 + sad * 40}px) rotate(${-4 + sad * -7}deg) scale(${inS * (1 - sad * 0.05)})`,
          borderColor: sad > 0.3 ? RED : "rgba(255,255,255,0.92)", boxShadow: `0 50px 90px rgba(0,0,0,0.6), 0 0 ${70 * sad}px ${RED}88` }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(40,60,110,${0.45 * sad}), rgba(10,15,30,${0.5 * sad}))` }} />
        {/* Rain over the gloom */}
        {sad > 0 && Array.from({ length: 34 }, (_, i) => {
          const y = ((frame * (22 + rnd(i) * 10) + rnd(i + 5) * 700) % 760) - 80;
          return <div key={i} style={{ position: "absolute", left: rnd(i + 11) * 470, top: y, width: 3, height: 60, borderRadius: 2,
            background: "rgba(190,215,255,0.55)", transform: "rotate(12deg)", opacity: sad }} />;
        })}
      </Person>
      <Emojis at={sent + 6} x={295} y={560} list={["😩"]} sink />
      <Banner at={sent} x={40} y={420} w={600} tint={RED} title="Sent back ↺" body="Your friends want a redo. Again." />
      <Sfx at={0} name="whoosh" /><Sfx at={sent - 6} name="swipe" /><Sfx at={sent} name="buzz" volume={0.75} /><Sfx at={sent} name="stamp" volume={0.4} />
    </AbsoluteFill>
  );
};

const FLAME = { x: 60, y: 470, w: 764, h: 860 };
const Streak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const base = 16.15;
  const pop = f(0.55);
  const burst = interpolate(frame - pop, [0, 22], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.4} />
      <AbsoluteFill style={{ background: `radial-gradient(760px 760px at 540px 860px, rgba(255,140,0,${0.25 + 0.15 * Math.sin(frame / 6)}), transparent 70%)` }} />
      <Hero from={base} dur={dur} width={520} y={120} turn={1} />
      <div style={{ position: "absolute", left: 540 - 380, top: 470, width: 760, height: 760, borderRadius: 380, border: `8px solid ${ORANGE}`,
        opacity: (1 - burst) * (frame >= pop ? 1 : 0), transform: `scale(${0.3 + burst * 1.1})` }} />
      <Float at={pop} x={170} y={330} z={200} dur={dur} glow="rgba(255,140,0,0.6)">
        <Cutout from={base} crop={FLAME} width={740} radius={44} />
      </Float>
      <Sfx at={0} name="whoosh" />
      {[4, 9, 14].map((t) => <Sfx key={t} at={t} name="tick" volume={0.6} />)}
      <Sfx at={pop} name="boom" volume={0.8} /><Sfx at={pop} name="ding" volume={0.5} />
    </AbsoluteFill>
  );
};

const CARD = { x: 20, y: 390, w: 844, h: 990 };
const Progress: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill>
    <Backdrop glow={1.1} />
    <Float at={0} x={10} y={250} ry={22} rx={6} z={-60} dur={dur}><Cutout from={21.8} crop={CARD} still width={540} radius={36} /></Float>
    <Float at={6} x={520} y={520} ry={-22} rx={6} z={-60} dur={dur}><Cutout from={25.4} crop={CARD} still width={540} radius={36} /></Float>
    <Float at={12} x={230} y={800} rx={8} z={140} dur={dur}><Cutout from={23.9} crop={CARD} still width={620} radius={38} /></Float>
    <Sfx at={0} name="whoosh" />{[0, 6, 12].map((t) => <Sfx key={t} at={t} name="pop" volume={0.5} />)}
  </AbsoluteFill>
);

const GROUPS = { x: 20, y: 410, w: 844, h: 690 };
const Groups: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const rows = [
    { name: "You", photo: "SelfieHike", pts: 27, medal: "🥇" },
    { name: "Maya", photo: "SelfieGym", pts: 24, medal: "🥈" },
    { name: "Sam", photo: "SelfieWater", pts: 19, medal: "🥉" },
  ];
  return (
    <AbsoluteFill>
      <Backdrop />
      <Float at={0} x={60} y={250} ry={14} rx={4} dur={dur}><Cutout from={34.4} crop={GROUPS} still width={720} radius={40} /></Float>
      <Float at={8} x={420} y={870} ry={-14} z={160} dur={dur}>
        <div style={{ width: 560, padding: 30, borderRadius: 40, background: "rgba(14,22,44,0.95)", border: "1.5px solid rgba(255,255,255,0.14)", fontFamily: FONT, color: "white" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: BLUE, letterSpacing: 3 }}>30-DAY CHALLENGE</div>
          <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.7, marginBottom: 14 }}>Last place buys coffee ☕️</div>
          {rows.map((r, k) => {
            const s = spring({ frame: frame - 14 - k * 4, fps: FPS, config: { damping: 13 } });
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 0", opacity: s, transform: `translateX(${(1 - s) * 60}px)` }}>
                <div style={{ fontSize: 38, width: 48 }}>{r.medal}</div>
                <Img src={staticFile(`${r.photo}.jpg`)} style={{ width: 60, height: 60, borderRadius: 30, objectFit: "cover" }} />
                <div style={{ flex: 1, fontSize: 38, fontWeight: 750 }}>{r.name}</div>
                <div style={{ fontSize: 38, fontWeight: 850 }}>{r.pts}</div>
              </div>
            );
          })}
        </div>
      </Float>
      <Sfx at={0} name="whoosh" /><Sfx at={8} name="pop" volume={0.6} />
    </AbsoluteFill>
  );
};

export const Outro: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const cta = useSpr(10, { damping: 12, stiffness: 140, mass: 0.7 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop glow={1.5} />
      <div style={{ position: "absolute", top: 150, width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
        opacity: cta, transform: `translateY(${Math.sin(frame / 4) * 12}px)` }}>
        <div style={{ fontSize: 100, lineHeight: 1 }}>👆</div>
        <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 60, color: "white", marginTop: 8 }}>Link in bio</div>
      </div>
      <div style={{ transform: "translateY(-40px)" }}><Wordmark size={1} /></div>
      <div style={{ position: "absolute", top: 1320, opacity: cta, transform: `scale(${(0.7 + 0.3 * cta) * (1 + Math.sin(frame / 6) * 0.025)})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 64, color: "white", background: BLUE, padding: "30px 68px", borderRadius: 999,
          boxShadow: "0 0 90px rgba(26,123,255,0.65)" }}>Join the waitlist</div>
      </div>
      <Sfx at={0} name="whoosh" /><Sfx at={10} name="ding" volume={0.5} />
    </AbsoluteFill>
  );
};

/** TikTok-style captions: the phrase being spoken, the current word lit. */
const Captions: React.FC = () => <CaptionTrack words={N.words} from={C.logo} to={C.outro} />;

export const CaptionTrack: React.FC<{ words: { w: string; s: number }[]; from: number; to: number }> = ({ words: raw, from, to }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const words = raw.map((w, i) => ({ ...w, e: raw[i + 1]?.s ?? w.s + 0.5 }));
  // Phrases end at punctuation.
  const phrases: (typeof words)[] = [];
  let cur: typeof words = [];
  for (const w of words) { cur.push(w); if (/[.,?!]$/.test(w.w)) { phrases.push(cur); cur = []; } }
  if (cur.length) phrases.push(cur);
  const live = phrases.find((p) => t >= p[0].s - 0.05 && t < Math.min(p[p.length - 1].s + 0.9, (phrases[phrases.indexOf(p) + 1]?.[0].s ?? 99) - 0.05));
  if (!live || t < from || t >= to) return null;
  const s0 = interpolate(t - live[0].s, [0, 0.12], [0.85, 1], clamp);
  return (
    <div style={{ position: "absolute", bottom: 250, left: 70, right: 70, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px",
      transform: `scale(${s0})` }}>
      {live.map((w, i) => {
        const on = t >= w.s - 0.03;
        const now = on && t < w.e;
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 68, letterSpacing: -1.5, color: now ? "#5EB0FF" : "white",
            opacity: on ? 1 : 0.35, transform: `scale(${now ? 1.06 : 1})`, display: "inline-block",
            textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 30px rgba(0,0,0,0.6)" }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const SCENES: [React.FC<{ dur: number }>, number, number][] = [
  [Hook, 0, C.logo], [Logo, C.logo, C.feed], [Feed, C.feed, C.redo], [Redo, C.redo, C.streak],
  [Streak, C.streak, C.progress], [Progress, C.progress, C.groups], [Groups, C.groups, C.outro], [Outro, C.outro, C.end],
];
export const REEL_FRAMES = f(C.end);

export const BackInReel: React.FC<{ sfx: boolean; voice?: boolean }> = ({ sfx, voice = false }) => (
  <Level.Provider value={sfx ? (voice && N.audio ? 0.45 : 1) : 0}>
    <AbsoluteFill style={{ background: "#040915" }}>
      {SCENES.map(([Scene, a, b], i) => (
        <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
          <Shot dur={f(b) - f(a)}><Scene dur={f(b) - f(a)} /></Shot>
        </Sequence>
      ))}
      <Captions />
      {voice && N.audio && N.clips.map((c, i) => (
        <Sequence key={i} from={f(c.at)} durationInFrames={f(c.to - c.from) + 2}>
          <Audio src={staticFile(N.audio)} startFrom={f(c.from)} endAt={f(c.to)} volume={(fr) => interpolate(fr, [0, 2, f(c.to - c.from) - 2, f(c.to - c.from)], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  </Level.Provider>
);
