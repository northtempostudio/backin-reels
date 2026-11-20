import React from "react";
import { Composition } from "remotion";
import { BackInReel, REEL_FRAMES } from "./Reel";
import { BackInReel2, REEL2_FRAMES } from "./Reel2";
import { BackInReel3, REEL3_FRAMES } from "./Reel3";
import { BenReel, BEN_FRAMES } from "./Ben";
import { BackInReel4, REEL4_FRAMES } from "./Reel4";
import { ProReel, PRO_FRAMES } from "./Pro";

export const FPS = 30;

export const Root: React.FC = () => (
  <>
  <Composition id="ProA" component={ProReel} durationInFrames={PRO_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ look: "A" as const, bgm: true }} />
  <Composition id="ProB" component={ProReel} durationInFrames={PRO_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ look: "B" as const, bgm: true }} />
  <Composition id="ProC" component={ProReel} durationInFrames={PRO_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ look: "C" as const, bgm: true }} />
  <Composition id="BenReel" component={BenReel} durationInFrames={BEN_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ bgm: true }} />
  <Composition
    id="BackInReel4"
    component={BackInReel4}
    durationInFrames={REEL4_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ sfx: true, voice: true }}
  />
  <Composition
    id="BackInReel3"
    component={BackInReel3}
    durationInFrames={REEL3_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ sfx: true, voice: true }}
  />
  <Composition
    id="BackInReel2"
    component={BackInReel2}
    durationInFrames={REEL2_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ sfx: true, voice: true }}
  />
  <Composition
    id="BackInReel"
    component={BackInReel}
    durationInFrames={REEL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ sfx: true }}
  />
  </>
);
