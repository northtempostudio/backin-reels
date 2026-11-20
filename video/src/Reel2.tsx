import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, FONT } from "./Brand";
import { Cutout } from "./Phone";
import {
  Banner, CaptionTrack, Chip, Confetti, Emojis, Float, GREEN, Hero, Level, ORANGE, Outro, Person, RED, Sfx, Shot, clamp, f, useSpr,
} from "./Reel";
import V from "./skip.json";

// Scene starts follow the narrator's words.
const at = (word: string) => V.words.find((w) => w.w.toLowerCase().startsWith(word))!.s;
const T = {
  caught: at("my") - 0.05, crew: at("on") - 0.05, went: at("so") - 0.05, proof: at("posted") - 0.05,
  approved: at("approved") - 0.05, streak: at("streak") - 0.05, outro: at("join") - 0.1,
};
const END = Math.max(V.words[V.words.length - 1].e + 2.2, T.outro + 3.5);

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const s = useSpr(0, { damping: 13, stiffness: 160, mass: 0.6 });
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Img src={staticFile("PhotoGym.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${interpolate(frame, [0, dur], [1.25, 1.08])})`, filter: "brightness(0.55) saturate(0.8)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent 45%, rgba(0,0,0,0.75))" }} />
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 850, fontSize: 92,
        letterSpacing: -2.5, lineHeight: 1.05, color: "white", opacity: s, transform: `translateY(${(1 - s) * 40}px)`, textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
        I tried to skip<br />the gym today.
      </div>
    </AbsoluteFill>
  );
};

/** The lock screen filling up with the group chat. */
const MSGS = [
  { who: "Maya", photo: "SelfieWater", text: "no gym proof yet? 👀" },
  { who: "Sam", photo: "SelfieHike", text: "your streak dies at midnight 💀" },
  { who: "Jordan", photo: "SelfieRead", text: "lol he's skipping" },
  { who: "BackIn", photo: "", text: "3 friends are waiting on your proof" },
];
const Caught: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const gap = Math.max(6, Math.floor((dur - 14) / MSGS.length));
  const shake = MSGS.some((_, i) => frame >= 4 + i * gap && frame < 4 + i * gap + 5) ? Math.sin(frame * 3) * 5 : 0;
  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <Img src={staticFile("SelfieGym.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.45)", transform: "scale(1.2)" }} />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily: FONT, color: "white" }}>
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.8 }}>Tuesday, November 19</div>
        <div style={{ fontSize: 200, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>6:42</div>
      </div>
      {MSGS.map((m, i) => {
        const s = useSpr(4 + i * gap, { damping: 14, stiffness: 190, mass: 0.6 });
        const below = MSGS.filter((_, k) => k > i && frame >= 4 + k * gap).length;
        return (
          <div key={i} style={{ position: "absolute", left: 50, right: 50, top: 640 + (MSGS.length - 1 - i) * 0 + below * 0,
            transform: `translateY(${(MSGS.length - 1 - i) * -0 + (i * 175)}px) scale(${0.9 + 0.1 * s})`, opacity: s,
            display: "flex", gap: 22, alignItems: "center", padding: "24px 28px", borderRadius: 38, background: "rgba(40,42,52,0.78)",
            border: "1.5px solid rgba(255,255,255,0.1)", fontFamily: FONT, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            {m.photo ? <Img src={staticFile(`${m.photo}.jpg`)} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover" }} />
              : <Img src={staticFile("icon.png")} style={{ width: 84, height: 84, borderRadius: 20 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 800, color: "white" }}>
                <span>{m.photo ? `${m.who} · Morning Crew` : "BackIn"}</span><span style={{ fontWeight: 500, opacity: 0.6, fontSize: 28 }}>now</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>{m.text}</div>
            </div>
          </div>
        );
      })}
      {MSGS.map((_, i) => <Sfx key={i} at={4 + i * gap} name="buzz" volume={0.55} />)}
    </AbsoluteFill>
  );
};

const GROUPS = { x: 20, y: 410, w: 844, h: 690 };
const Crew: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill>
    <Backdrop />
    <Hero from={33.6} dur={dur} x={-170} width={520} turn={1} />
    <Float at={8} x={430} y={560} ry={-16} z={120} dur={dur}><Cutout from={34.4} crop={GROUPS} width={600} radius={36} still /></Float>
    <Chip at={22} color={RED} x={470} y={1230}>Alex hasn't checked in</Chip>
    <Sfx at={0} name="whoosh" /><Sfx at={8} name="pop" volume={0.5} /><Sfx at={22} name="buzz" volume={0.6} />
  </AbsoluteFill>
);

const Went: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [dur - 10, dur - 8, dur], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Img src={staticFile("SelfieGym.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${interpolate(frame, [0, dur], [1.35, 1.1], { easing: Easing.out(Easing.cubic) })})` }} />
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
      <Sfx at={0} name="boom" volume={0.8} /><Sfx at={dur - 10} name="shutter" volume={1} />
    </AbsoluteFill>
  );
};

const POST = { x: 40, y: 770, w: 804, h: 920 };
const Proof: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill>
    <Backdrop />
    <Hero from={2.75} dur={dur} x={170} width={560} turn={-1} />
    <Person photo="SelfieGym" w={330} h={430} style={{ left: 50, top: 420, transform: "rotate(-6deg)" }} />
    <Sfx at={0} name="whoosh" />
  </AbsoluteFill>
);

const Approved: React.FC<{ dur: number }> = ({ dur }) => {
  const s = useSpr(0, { damping: 11, stiffness: 150, mass: 0.7 });
  return (
    <AbsoluteFill>
      <Backdrop glow={1.2} />
      <AbsoluteFill style={{ background: "radial-gradient(700px 700px at 540px 900px, rgba(34,197,94,0.3), transparent 70%)" }} />
      <Person photo="SelfieGym" w={620} h={820} style={{ left: 230, top: 520, transform: `rotate(-4deg) scale(${0.6 + 0.4 * s})`, opacity: s,
        borderColor: GREEN, boxShadow: `0 50px 90px rgba(0,0,0,0.6), 0 0 90px ${GREEN}` }} />
      <Confetti at={4} x={540} y={900} n={60} />
      <Emojis at={8} x={540} y={820} list={["💪", "🔥", "👏"]} />
      <Banner at={2} x={60} y={260} w={960} tint={GREEN} title="Approved ✓" body="Maya, Sam and Jordan approved your gym session" />
      <Sfx at={0} name="swipe" /><Sfx at={4} name="ding" volume={0.8} />
    </AbsoluteFill>
  );
};

const FLAME = { x: 60, y: 470, w: 764, h: 860 };
const Saved: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop glow={0.4} />
      <AbsoluteFill style={{ background: `radial-gradient(760px 760px at 540px 860px, rgba(255,140,0,${0.3 + 0.15 * Math.sin(frame / 6)}), transparent 70%)` }} />
      <Float at={0} x={160} y={420} z={150} dur={dur} glow="rgba(255,140,0,0.6)"><Cutout from={16.75} crop={FLAME} width={760} radius={44} /></Float>
      <Sfx at={0} name="boom" volume={0.7} /><Sfx at={6} name="ding" volume={0.5} />
    </AbsoluteFill>
  );
};

const SCENES: [React.FC<{ dur: number }>, number, number][] = [
  [Hook, 0, T.caught], [Caught, T.caught, T.crew], [Crew, T.crew, T.went], [Went, T.went, T.proof],
  [Proof, T.proof, T.approved], [Approved, T.approved, T.streak], [Saved, T.streak, T.outro], [Outro, T.outro, END],
];
export const REEL2_FRAMES = f(END);

export const BackInReel2: React.FC<{ sfx: boolean; voice?: boolean }> = ({ sfx, voice = true }) => (
  <Level.Provider value={sfx ? (voice ? 0.45 : 1) : 0}>
    <AbsoluteFill style={{ background: "#040915" }}>
      {SCENES.map(([Scene, a, b], i) => (
        <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)}>
          <Shot dur={f(b) - f(a)}><Scene dur={f(b) - f(a)} /></Shot>
        </Sequence>
      ))}
      <CaptionTrack words={V.words} from={T.crew} to={T.outro} />
      {voice && <Audio src={staticFile(V.audio)} />}
    </AbsoluteFill>
  </Level.Provider>
);
