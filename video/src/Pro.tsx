// BackIn Pro reel: one voiceover (Jessica), one timeline, three looks (A Soft Film, B Midnight Glow, C Pop Sticker).
import React from "react";
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import VO from "./pro.json";

export const PRO_FRAMES = 870; // 29 s
const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const wordAt = (w: string, nth = 0) => f(VO.words.filter((x) => x.w.toLowerCase().replace(/[^a-z-]/g, "") === w)[nth].s);

// Scene boundaries, pinned to Jessica's words.
export const T = {
  hook: 0,
  gone: wordAt("those"),
  deleted: wordAt("deleted"),
  pro: wordAt("backin"),
  forever: wordAt("forever"),
  insights: wordAt("see"),
  rhythm: wordAt("rhythm"),
  best: wordAt("best"),
  calendar: wordAt("drop"),
  calWord: wordAt("calendar"),
  icons: wordAt("pick"),
  groups: wordAt("join"),
  support: wordAt("priority"),
  offer: wordAt("first"),
  sixDollars: wordAt("dollars"),
  perMonth: wordAt("dollar"),
  end: wordAt("link"),
};

type Look = "A" | "B" | "C";
const SANS = `-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
const SERIF = `"New York", "Iowan Old Style", Georgia, serif`;

const THEME = {
  A: { bg: "#F4EEE4", ink: "#1B1B1B", sub: "#6B6259", accent: "#1A7BFF", card: "#FFFFFF", warn: "#E5484D", music: "audio/house-vibez.mp3" },
  B: { bg: "#060D12", ink: "#F7F7F8", sub: "#9CB3C9", accent: "#2F7BFF", card: "rgba(24,42,56,0.92)", warn: "#E5484D", music: "audio/tonight-hiphop.mp3" },
  C: { bg: "#FFE9D6", ink: "#111111", sub: "#333333", accent: "#1A7BFF", card: "#FFFFFF", warn: "#FF5A4E", music: "audio/bgm-catwalk.mp3" },
};
// Look C changes background color every scene.
const C_BG = { hook: "#FFE9D6", gone: "#FFE0E0", pro: "#DCEBFF", insights: "#E4FFE9", calendar: "#FFF3C4", icons: "#EEE3FF", groups: "#DCF6FF", offer: "#FFD34D", end: "#FFD34D" };

const PHOTOS = ["PhotoGym", "SelfieRead", "PhotoWater", "PhotoHike", "SelfieGym", "PhotoRead", "SelfieHike", "SelfieWater", "PhotoGym"];
const ICONS = ["default", "violet-gold", "midnight-mint", "light-coral", "black-gold", "sunset-navy", "emerald-white", "blue-white", "violet-mint",
  "sunset-white", "black-blue", "blue-gold", "emerald-gold", "light-blue", "midnight-coral", "violet-white", "black-white", "blue-navy",
  "emerald-navy", "light-black", "midnight-gold"];

// ---------- helpers ----------
// Scenes live inside <Sequence>, so useCurrentFrame() restarts at 0. ABS adds the scene start back,
// letting every scene time things against Jessica's absolute word timings.
const Offset = React.createContext(0);
const useAbs = () => useCurrentFrame() + React.useContext(Offset);
const usePop = (at: number, damping = 12, stiffness = 170) => {
  const frame = useAbs();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, stiffness, mass: 0.7 } });
};
const fadeIn = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Grain: React.FC<{ strength?: number; mode?: "multiply" | "overlay" }> = ({ strength = 0.16, mode = "multiply" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      opacity: strength, mixBlendMode: mode, pointerEvents: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      backgroundPosition: `${(frame * 37) % 200}px ${(frame * 53) % 200}px`,
    }} />
  );
};

const Background: React.FC<{ look: Look; scene: keyof typeof C_BG }> = ({ look, scene }) => {
  const frame = useCurrentFrame();
  if (look === "A") return (<AbsoluteFill style={{ background: THEME.A.bg }}><Grain /></AbsoluteFill>);
  if (look === "C") return (<AbsoluteFill style={{ background: C_BG[scene] }} />);
  const drift = Math.sin(frame / 45) * 70;
  return (
    <AbsoluteFill style={{ background: THEME.B.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 800px at ${540 + drift}px ${820 - drift / 2}px, #0F2735, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(700px 600px at ${300 - drift}px 1500px, rgba(47,123,255,0.22), transparent 70%)` }} />
      <Grain strength={0.06} mode="overlay" />
    </AbsoluteFill>
  );
};

// Headline: look A mixes an italic serif line with a heavy sans line; C uses chunky sans; B gradient second line.
const Headline: React.FC<{ look: Look; top: number; a: string; b: string; at: number; size?: number; instant?: boolean }> = ({ look, top, a, b, at, size = 112, instant }) => {
  const frame = useAbs();
  const q1 = usePop(at), q2 = usePop(at + 5);
  const p1 = instant ? 1 : q1, p2 = instant ? 1 : q2;
  const th = THEME[look];
  const lineA: React.CSSProperties = look === "A"
    ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: size * 0.88, letterSpacing: -1 }
    : { fontFamily: SANS, fontWeight: look === "C" ? 900 : 800, fontSize: size, letterSpacing: -3 };
  const lineB: React.CSSProperties = { fontFamily: SANS, fontWeight: look === "C" ? 900 : 800, fontSize: size, letterSpacing: -3 };
  const grad = look === "B" ? { background: "linear-gradient(90deg,#2F7BFF,#4FD8E8)", WebkitBackgroundClip: "text", color: "transparent" } : {};
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", color: th.ink, lineHeight: 1.04, opacity: instant ? 1 : fadeIn(frame, at, 4) }}>
      <div style={{ ...lineA, transform: `translateY(${(1 - p1) * 40}px)`, opacity: p1 }}>{a}</div>
      <div style={{ ...lineB, ...grad, transform: `translateY(${(1 - p2) * 40}px)`, opacity: p2 }}>{b}</div>
    </div>
  );
};

const Chip: React.FC<{ look: Look; text: string; at: number; top: number; bg?: string; color?: string; rotate?: number; size?: number }> = ({ look, text, at, top, bg, color, rotate = 0, size = 38 }) => {
  const p = usePop(at, 10, 200);
  const c = look === "C";
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{
        fontFamily: SANS, fontWeight: c ? 900 : 700, fontSize: size, padding: c ? "16px 34px" : "14px 32px",
        borderRadius: c ? 24 : 999, background: bg ?? THEME[look].accent, color: color ?? "#fff",
        border: c ? "6px solid #111" : undefined, boxShadow: c ? "8px 10px 0 #111" : look === "A" ? "0 12px 30px rgba(0,0,0,.12)" : "0 0 40px rgba(47,123,255,.45)",
        transform: `scale(${p}) rotate(${rotate}deg)`,
      }}>{text}</div>
    </div>
  );
};

const Photo: React.FC<{ look: Look; name: string; w: number; h: number; style?: React.CSSProperties }> = ({ look, name, w, h, style }) => {
  const frame: React.CSSProperties = look === "A"
    ? { background: "#fff", padding: "18px 18px 64px", boxShadow: "0 26px 50px rgba(60,40,20,.25)" }
    : look === "C"
      ? { background: "#fff", padding: "16px 16px 56px", border: "6px solid #111", boxShadow: "12px 14px 0 #111" }
      : { borderRadius: 40, overflow: "hidden", boxShadow: "0 0 100px rgba(79,216,232,.3)" };
  return (
    <div style={{ position: "absolute", width: w, height: h, ...frame, ...style }}>
      <Img src={staticFile(`${name}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: look === "B" ? 0 : 4 }} />
    </div>
  );
};

const Card: React.FC<{ look: Look; style: React.CSSProperties; children: React.ReactNode }> = ({ look, style, children }) => {
  const s: React.CSSProperties = look === "B"
    ? { background: THEME.B.card, border: "2px solid rgba(130,170,195,.5)", borderRadius: 44 }
    : look === "C"
      ? { background: "#fff", border: "6px solid #111", borderRadius: 36, boxShadow: "12px 14px 0 #111" }
      : { background: "#fff", borderRadius: 40, boxShadow: "0 24px 60px rgba(60,40,20,.14)" };
  return <div style={{ position: "absolute", padding: 44, ...s, ...style }}>{children}</div>;
};

// ---------- scenes ----------
const Hook: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, T.gone], [1.08, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Background look={look} scene="hook" />
      {look === "C" ? (
        <div style={{ transform: `scale(${zoom})`, position: "absolute", inset: 0 }}>
          <Photo look="C" name="PhotoGym" w={420} h={540} style={{ left: 100, top: 300, transform: "rotate(-8deg)" }} />
          <Photo look="C" name="SelfieRead" w={420} h={540} style={{ left: 540, top: 250, transform: "rotate(7deg)" }} />
          <Photo look="C" name="SelfieHike" w={420} h={540} style={{ left: 320, top: 560, transform: "rotate(-2deg)" }} />
          <div style={{ position: "absolute", left: 120, top: 220, transform: "rotate(-6deg)", fontFamily: SANS, fontWeight: 900, fontSize: 50, background: "#FF5A4E", color: "#fff", padding: "12px 28px", borderRadius: 22, border: "6px solid #111", boxShadow: "8px 10px 0 #111" }}>Storage full</div>
        </div>
      ) : look === "A" ? (
        <div style={{ transform: `scale(${zoom})`, position: "absolute", inset: 0 }}>
          <Photo look="A" name="PhotoGym" w={430} h={560} style={{ left: 110, top: 330, transform: "rotate(-7deg)" }} />
          <Photo look="A" name="PhotoRead" w={430} h={560} style={{ left: 530, top: 260, transform: "rotate(6deg)" }} />
          <Photo look="A" name="SelfieHike" w={430} h={560} style={{ left: 320, top: 640, transform: "rotate(-2deg)" }} />
        </div>
      ) : (
        <div style={{ transform: `scale(${zoom})`, position: "absolute", inset: 0 }}>
          <Photo look="B" name="SelfieGym" w={680} h={900} style={{ left: 200, top: 260 }} />
        </div>
      )}
      <Headline look={look} top={1150} a="Your camera roll" b="is lying to you." at={0} size={108} instant />
    </AbsoluteFill>
  );
};

const Gone: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  const crush = interpolate(frame, [T.deleted, T.deleted + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Background look={look} scene="gone" />
      <Headline look={look} top={180} a="Those progress pics?" b="" at={T.gone} size={96} />
      <div style={{ position: "absolute", left: 130, top: 420, display: "grid", gridTemplateColumns: "repeat(3, 260px)", gap: 20 }}>
        {PHOTOS.map((p, i) => {
          const at = T.gone + i * 2;
          const inn = spring({ frame: frame - at, fps: FPS, config: { damping: 14, stiffness: 180 } });
          const lag = interpolate(frame, [T.deleted + i * 1.2, T.deleted + 12 + i * 1.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
          return (
            <div key={i} style={{ width: 260, height: 320, borderRadius: look === "C" ? 18 : 26, overflow: "hidden", border: look === "C" ? "5px solid #111" : undefined,
              transform: `scale(${inn * lag}) rotate(${(1 - lag) * (i % 2 ? 20 : -20)}deg)`, opacity: lag, filter: `grayscale(${1 - lag})` }}>
              <Img src={staticFile(`${p}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </div>
      <Chip look={look} text="Deleted · 1,284 photos" at={T.deleted} top={780} bg={THEME[look].warn} size={56} rotate={-3} />
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 52, color: THEME[look].sub, opacity: 1 - crush * 0 }}>
        {frame >= T.deleted + 10 ? "Storage full. Day 1 is gone." : ""}
      </div>
    </AbsoluteFill>
  );
};

const Forever: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  return (
    <AbsoluteFill>
      <Background look={look} scene="pro" />
      <Chip look={look} text="BackIn Pro" at={T.pro} top={170} bg={look === "C" ? "#111" : undefined} />
      <Headline look={look} top={280} a="Memories," b="kept forever." at={T.pro + 6} size={120} />
      <div style={{ position: "absolute", left: 130, top: 590, display: "grid", gridTemplateColumns: "repeat(3, 260px)", gap: 20 }}>
        {PHOTOS.slice(0, 6).map((p, i) => {
          const s = spring({ frame: frame - (T.pro + 10 + i * 3), fps: FPS, config: { damping: 12, stiffness: 160 } });
          return (
            <div key={i} style={{ width: 260, height: 340, borderRadius: look === "C" ? 18 : 28, overflow: "hidden", position: "relative",
              border: look === "C" ? "5px solid #111" : undefined, boxShadow: look === "B" ? "0 0 40px rgba(79,216,232,.25)" : undefined, transform: `scale(${s})` }}>
              <Img src={staticFile(`${p}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 14, bottom: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: "#fff", background: "rgba(0,0,0,.45)", padding: "6px 14px", borderRadius: 999 }}>
                Day {[1, 12, 30, 61, 120, 180][i]}
              </div>
            </div>
          );
        })}
      </div>
      <Chip look={look} text="∞  Never expires while you're Pro" at={T.forever} top={1340} bg={look === "A" ? "#fff" : look === "C" ? "#FF7A59" : undefined} color={look === "A" ? "#1B1B1B" : "#fff"} size={46} rotate={look === "C" ? -3 : 0} />
    </AbsoluteFill>
  );
};

const Insights: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  const th = THEME[look];
  const bars = [0.3, 0.45, 0.95, 0.6, 0.4, 0.2];
  const hi = look === "B" ? "linear-gradient(#4FD8E8,#2F7BFF)" : th.accent;
  const lo = look === "B" ? "#24404F" : look === "A" ? "#E7E0D5" : "#D9D9D9";
  return (
    <AbsoluteFill>
      <Background look={look} scene="insights" />
      <Headline look={look} top={170} a="Insights that" b="know you." at={T.insights} size={112} />
      <Card look={look} style={{ left: 90, top: 540, width: 850, height: 560, opacity: fadeIn(frame, T.rhythm - 6) }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: th.sub }}>Rhythm · when you actually show up</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 320, marginTop: 40 }}>
          {bars.map((b, i) => {
            const g = spring({ frame: frame - (T.rhythm + i * 2), fps: FPS, config: { damping: 14, stiffness: 120 } });
            return <div key={i} style={{ flex: 1, height: `${b * 100 * g}%`, borderRadius: look === "C" ? 10 : 16, background: i === 2 ? hi : lo,
              border: look === "C" ? "4px solid #111" : undefined, boxShadow: i === 2 && look === "B" ? "0 0 40px rgba(79,216,232,.6)" : undefined }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 600, fontSize: 30, color: th.sub, marginTop: 16 }}>
          {["6a", "9a", "12p", "3p", "6p", "9p"].map((t) => <span key={t}>{t}</span>)}
        </div>
      </Card>
      {[{ k: "Trends", v: "+38%", at: T.insights + 10, x: 90 }, { k: "Best time", v: "7:40a", at: T.best, x: 530 }].map((c) => (
        <div key={c.k} style={{ transform: `scale(${spring({ frame: frame - c.at, fps: FPS, config: { damping: 11, stiffness: 180 } })})` }}>
          <Card look={look} style={{ left: c.x, top: 1150, width: 410, height: 280 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: th.sub }}>{c.k}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, color: look === "B" && c.k !== "Trends" ? "#4FD8E8" : look === "B" ? th.ink : look === "A" && c.k === "Trends" ? th.accent : "#111", letterSpacing: -3 }}>{c.v}</div>
          </Card>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Calendar: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  const th = THEME[look];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const events = [
    { d: 0, row: 0, t: "Gym · 7:30", c: "#1A7BFF" }, { d: 1, row: 1, t: "Read · 9pm", c: "#8B5CF6" }, { d: 2, row: 0, t: "Gym · 7:30", c: "#1A7BFF" },
    { d: 3, row: 2, t: "Water", c: "#10B981" }, { d: 4, row: 0, t: "Gym · 7:30", c: "#1A7BFF" }, { d: 5, row: 1, t: "Hike", c: "#F97316" }, { d: 6, row: 1, t: "Read · 9pm", c: "#8B5CF6" },
  ];
  const colW = 108;
  return (
    <AbsoluteFill>
      <Background look={look} scene="calendar" />
      <Headline look={look} top={170} a="Habits, right on" b="your calendar." at={T.calendar} size={112} />
      <Card look={look} style={{ left: 70, top: 500, width: 880, height: 820, padding: 36 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: look === "B" ? th.ink : "#111", marginBottom: 24 }}>This week</div>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map((d, i) => (
            <div key={i} style={{ width: colW, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, color: th.sub }}>{d}<div style={{ fontSize: 44, color: look === "B" ? th.ink : "#111" }}>{17 + i}</div></div>
          ))}
        </div>
        <div style={{ position: "relative", height: 620, marginTop: 20 }}>
          {[0, 1, 2, 3].map((r) => <div key={r} style={{ position: "absolute", left: 0, right: 0, top: r * 150, height: 2, background: look === "B" ? "#1E2E38" : "#EEE" }} />)}
          {events.map((e, i) => {
            const at = T.calendar + 6 + i * 4;
            const drop = spring({ frame: frame - at, fps: FPS, config: { damping: 11, stiffness: 160 } });
            return (
              <div key={i} style={{ position: "absolute", left: e.d * (colW + 8), top: 20 + e.row * 150 - (1 - drop) * 300, width: colW, height: 120, borderRadius: 18,
                background: e.c, opacity: drop, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 24, padding: 12, lineHeight: 1.15,
                border: look === "C" ? "4px solid #111" : undefined }}>{e.t}</div>
            );
          })}
        </div>
      </Card>
      <Chip look={look} text="Reminders that actually land" at={T.calWord} top={1360} bg={look === "A" ? "#fff" : look === "C" ? "#111" : undefined} color={look === "A" ? "#1B1B1B" : "#fff"} size={42} />
    </AbsoluteFill>
  );
};

const Icons: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  return (
    <AbsoluteFill>
      <Background look={look} scene="icons" />
      <Headline look={look} top={170} a="Make it yours." b="21 app icons." at={T.icons} size={112} />
      <div style={{ position: "absolute", left: 66, top: 560, display: "grid", gridTemplateColumns: "repeat(7, 112px)", columnGap: 14, rowGap: 34 }}>
        {ICONS.map((n, i) => {
          const s = spring({ frame: frame - (T.icons + 4 + i * 1.5), fps: FPS, config: { damping: 10, stiffness: 220 } });
          return <Img key={n} src={staticFile(`pro/icons/${n}.png`)} style={{ width: 112, height: 112, borderRadius: "22.5%", transform: `scale(${s})`, opacity: s > 0.08 ? 1 : 0,
            boxShadow: look === "C" ? "5px 6px 0 #111" : look === "B" ? "0 10px 30px rgba(0,0,0,.5)" : "0 10px 22px rgba(0,0,0,.18)", border: look === "C" ? "3px solid #111" : undefined }} />;
        })}
      </div>
      <Card look={look} style={{ left: 300, top: 1010, width: 420, height: 230, padding: 30, display: "flex", alignItems: "center", gap: 24, opacity: fadeIn(frame, T.icons + 40) }}>
        <Img src={staticFile("pro/icons/violet-gold.png")} style={{ width: 150, height: 150, borderRadius: "22.5%" }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: look === "B" ? "#F7F7F8" : "#111", lineHeight: 1.1 }}>Your home<br/>screen</div>
      </Card>
    </AbsoluteFill>
  );
};

const Groups: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  const th = THEME[look];
  const faces = ["SelfieGym", "SelfieRead", "SelfieHike", "SelfieWater"];
  const groups = ["Gym crew", "Book club", "Hydrate gang", "5am club"];
  return (
    <AbsoluteFill>
      <Background look={look} scene="groups" />
      <Headline look={look} top={170} a="More groups." b="Priority support." at={T.groups} size={112} />
      {groups.map((g, i) => {
        const s = spring({ frame: frame - (T.groups + 6 + i * 4), fps: FPS, config: { damping: 12, stiffness: 170 } });
        return (
          <div key={g} style={{ transform: `translateX(${(1 - s) * (i % 2 ? 600 : -600)}px)` }}>
            <Card look={look} style={{ left: 110, top: 520 + i * 175, width: 820, height: 140, padding: "24px 34px", display: "flex", alignItems: "center", gap: 26 }}>
              <Img src={staticFile(`${faces[i]}.jpg`)} style={{ width: 92, height: 92, borderRadius: 999, objectFit: "cover", border: look === "C" ? "4px solid #111" : undefined }} />
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: look === "B" ? th.ink : "#111" }}>{g}</div>
              <div style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 700, fontSize: 32, color: th.sub }}>{[6, 4, 9, 3][i]} friends</div>
            </Card>
          </div>
        );
      })}
      <Chip look={look} text="⚡ Priority support · you skip the line" at={T.support} top={1260} bg={look === "C" ? "#FFD34D" : look === "A" ? "#1B1B1B" : undefined} color={look === "C" ? "#111" : "#fff"} size={42} rotate={look === "C" ? 2 : 0} />
    </AbsoluteFill>
  );
};

const Offer: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useAbs();
  const th = THEME[look];
  const price = usePop(T.sixDollars - 8, 9, 200);
  const month = usePop(T.perMonth, 10, 200);
  const fill = interpolate(frame, [T.offer, T.offer + 40], [0, 0.23], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const ink = look === "B" ? th.ink : "#111";
  return (
    <AbsoluteFill>
      <Background look={look} scene="offer" />
      <Chip look={look} text="FIRST 100 PEOPLE ONLY" at={T.offer} top={240} bg={look === "A" ? "#fff" : look === "C" ? "#fff" : "rgba(79,216,232,.15)"} color={look === "B" ? "#4FD8E8" : "#111"} size={44} rotate={look === "C" ? -3 : 0} />
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 330, letterSpacing: -14,
        color: look === "C" ? "#111" : th.accent, transform: `scale(${price})`, lineHeight: 1 }}>$6</div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76, color: ink, opacity: price }}>
        {look === "A" ? <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>for </span> : "for "}6 months of Pro
      </div>
      <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${month}) rotate(${look === "C" ? -4 : 0}deg)`, fontFamily: SANS, fontWeight: 900, fontSize: 64, padding: "18px 40px", borderRadius: look === "C" ? 24 : 999,
          background: look === "C" ? "#1A7BFF" : look === "B" ? "linear-gradient(90deg,#2F7BFF,#4FD8E8)" : th.accent, color: "#fff",
          border: look === "C" ? "6px solid #111" : undefined, boxShadow: look === "C" ? "8px 10px 0 #111" : undefined }}>= $1 a month</div>
      </div>
      <div style={{ position: "absolute", top: 1130, left: 160, right: 160 }}>
        <div style={{ height: 24, borderRadius: 12, background: look === "B" ? "#15262F" : "rgba(0,0,0,.1)", overflow: "hidden", border: look === "C" ? "4px solid #111" : undefined }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", background: look === "B" ? "linear-gradient(90deg,#2F7BFF,#4FD8E8)" : th.accent }} />
        </div>
        <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 36, color: th.sub, marginTop: 18 }}>Early access spots are going</div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC<{ look: Look }> = ({ look }) => {
  const p = usePop(T.end - 4, 11, 160);
  const th = THEME[look];
  return (
    <AbsoluteFill>
      <Background look={look} scene="end" />
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${p})` }}>
        <div style={{ position: "relative", width: 640, height: 184 }}>
          <Img src={staticFile("wordmark-base.svg")} style={{ position: "absolute", width: "100%", filter: look === "B" ? undefined : "invert(1)" }} />
          <Img src={staticFile("wordmark-accent.svg")} style={{ position: "absolute", width: "100%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 970, left: 0, right: 0, textAlign: "center", fontFamily: look === "A" ? SERIF : SANS, fontStyle: look === "A" ? "italic" : "normal",
        fontWeight: look === "A" ? 400 : 800, fontSize: 64, color: look === "B" ? th.ink : "#111", opacity: p }}>Pro · $6 for 6 months</div>
      <Chip look={look} text="Link in bio" at={T.end} top={1140} bg={look === "A" ? "#1B1B1B" : undefined} size={58} />
    </AbsoluteFill>
  );
};

// ---------- captions (Instagram is watched muted) ----------
const PHRASES = (() => {
  // Break at punctuation; split anything longer than 7 words into even halves.
  const groups: (typeof VO.words)[] = [];
  let cur: typeof VO.words = [];
  for (const w of VO.words) { cur.push(w); if (/[.,?]$/.test(w.w)) { groups.push(cur); cur = []; } }
  if (cur.length) groups.push(cur);
  const out: { text: string; s: number; e: number }[] = [];
  for (const g of groups) {
    const parts = Math.ceil(g.length / 7), size = Math.ceil(g.length / parts);
    for (let i = 0; i < g.length; i += size) {
      const c = g.slice(i, i + size);
      out.push({ text: c.map((x) => x.w).join(" "), s: f(c[0].s), e: f(c[c.length - 1].e) });
    }
  }
  return out.map((p, i) => ({ ...p, e: Math.max(p.e, (out[i + 1]?.s ?? p.e + 20) - 1) }));
})();

const Captions: React.FC<{ look: Look }> = ({ look }) => {
  const frame = useCurrentFrame();
  const p = PHRASES.find((x) => frame >= x.s && frame <= x.e);
  if (!p || frame >= T.end) return null;
  const s: React.CSSProperties = look === "B"
    ? { background: "rgba(6,13,18,.7)", color: "#F7F7F8", border: "2px solid rgba(85,117,135,.4)" }
    : look === "C" ? { background: "#fff", color: "#111", border: "5px solid #111", boxShadow: "6px 8px 0 #111" }
      : { background: "rgba(27,27,27,.88)", color: "#fff" };
  return (
    <div style={{ position: "absolute", top: 1480, left: 70, right: 130, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, padding: "14px 30px", borderRadius: 22, textAlign: "center", ...s }}>{p.text.replace(/twenty-one/i, "21")}</div>
    </div>
  );
};

// ---------- sound ----------
export const SFX: { at: number; file: string; vol: number }[] = [
  { at: 2, file: "fs-271010.mp3", vol: 0.5 }, // shutter on hook
  { at: T.deleted, file: "fs-334200.mp3", vol: 0.8 }, // crumple
  { at: T.pro, file: "fs-71852.mp3", vol: 0.45 }, // whoosh
  { at: T.forever, file: "fs-511485.mp3", vol: 0.45 }, // sparkle
  { at: T.insights, file: "fs-71852.mp3", vol: 0.4 },
  { at: T.rhythm, file: "fs-253956.mp3", vol: 0.5 },
  { at: T.best, file: "fs-253956.mp3", vol: 0.5 },
  { at: T.calendar, file: "fs-71852.mp3", vol: 0.4 },
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({ at: T.calendar + 6 + i * 4, file: "fs-253956.mp3", vol: 0.28 })),
  { at: T.icons, file: "fs-731262.mp3", vol: 0.35 }, // boing
  { at: T.groups, file: "fs-71852.mp3", vol: 0.4 },
  { at: T.support, file: "fs-253956.mp3", vol: 0.5 },
  { at: T.offer, file: "fs-71852.mp3", vol: 0.45 },
  { at: T.sixDollars - 6, file: "fs-209578.mp3", vol: 0.55 }, // cha-ching
  { at: T.end - 4, file: "fs-511485.mp3", vol: 0.45 },
];

const SCENES: { from: number; to: number; C: React.FC<{ look: Look }> }[] = [
  { from: T.hook, to: T.gone, C: Hook },
  { from: T.gone, to: T.pro, C: Gone },
  { from: T.pro, to: T.insights, C: Forever },
  { from: T.insights, to: T.calendar, C: Insights },
  { from: T.calendar, to: T.icons, C: Calendar },
  { from: T.icons, to: T.groups, C: Icons },
  { from: T.groups, to: T.offer, C: Groups },
  { from: T.offer, to: T.end - 6, C: Offer },
  { from: T.end - 6, to: PRO_FRAMES, C: End },
];

// Quick soft cut: each scene fades/zooms in over 5 frames.
const SceneIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: t, transform: `scale(${1.04 - 0.04 * t})` }}>{children}</AbsoluteFill>;
};

export const ProReel: React.FC<{ look: Look; bgm: boolean }> = ({ look, bgm }) => {
  const frame = useCurrentFrame();
  const musicVol = interpolate(frame, [0, 6, T.end, T.end + 20, PRO_FRAMES - 15, PRO_FRAMES], [0, 0.13, 0.13, 0.25, 0.25, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: THEME[look].bg }}>
      {SCENES.map(({ from, to, C }, i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <Offset.Provider value={from}>{i === 0 ? <C look={look} /> : <SceneIn><C look={look} /></SceneIn>}</Offset.Provider>
        </Sequence>
      ))}
      <Captions look={look} />
      <Audio src={staticFile(VO.audio)} volume={1} />
      {bgm && <Audio src={staticFile(THEME[look].music)} volume={musicVol} />}
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={90}>
          <Audio src={staticFile(`audio/sfx/${s.file}`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
