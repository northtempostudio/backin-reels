import { BEN_FRAMES, BenReel, T, CAPTIONS, SFX, Hook, Fail, Prove, AppReveal, Payoff, EndCard, CaptionUnit } from "./Ben";

const shot = (id: string, label: string, from: number, to: number, component: any, props?: Record<string, unknown>) =>
  ({ id, label, from, duration: to - from, component, ...(props ? { props } : {}) });

export const WORKBENCH = {
  name: "BackIn · Ben starts tomorrow",
  fps: 30, width: 1080, height: 1920,
  total: BEN_FRAMES,
  background: "#f6f1e6",
  shots: [
    shot("hook", "S1 Calendar + snooze", 0, T.fails, Hook),
    { ...shot("gym", "S2a Gym fail", T.fails, T.fails + 38, Fail, { kind: "gym" }), cardId: "fail", cardName: "Fail gag" },
    { ...shot("study", "S2b Study fail", T.fails + 38, T.fails + 76, Fail, { kind: "study" }), cardId: "fail", cardName: "Fail gag" },
    { ...shot("life", "S2c Fix-life fail", T.fails + 76, T.friends, Fail, { kind: "life" }), cardId: "fail", cardName: "Fail gag" },
    shot("prove", "S3 Friends + ink bleed", T.friends, T.app, Prove),
    shot("app", "S4 BackIn app", T.app, T.payoff, AppReveal),
    shot("payoff", "S5 Ben cheers", T.payoff, T.endcard, Payoff),
    shot("end", "S6 End card", T.endcard, BEN_FRAMES, EndCard),
  ],
  transitions: [],
  captions: CAPTIONS.map((c, i) => ({
    id: `cap${i}`, label: c.text, from: c.from, duration: c.to - c.from, component: CaptionUnit,
    props: { text: c.text, paper: c.paper, from: c.from },
    schema: [
      { type: "textarea", key: "text", label: "Text", default: "" },
      { type: "boolean", key: "paper", label: "Paper style", default: false },
    ],
    cardId: "caption", cardName: "Caption",
  })),
  overlays: [],
  sfx: SFX.map((s) => ({ from: s.at, duration: s.len ?? 90, src: s.file, volume: s.vol ?? 0.7, ...(s.trim ? { startFrom: Math.round(s.trim * 30) } : {}) })),
  bgm: [
    { from: 0, duration: T.friends, src: "audio/bgm-catwalk.mp3", volume: 0.4 },
    { from: T.bleed, duration: BEN_FRAMES - T.bleed, src: "audio/bgm-catwalk.mp3", volume: 0.42, startFrom: Math.round(16.1 * 30) },
  ],
  order: ["transitions", "captions", "overlays"],
  original: BenReel,
};
