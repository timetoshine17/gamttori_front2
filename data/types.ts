// data/types.ts
export type SceneBG =
  | { type: "sky"; time: "morning" | "noon" | "sunset" | "night" }
  | { type: "yard"; time?: "morning" | "noon" | "afternoon" | "sunset" | "night" }
  | { type: "storm" }
  | { type: "summerCanopy" }
  | { type: "flashback" };

export type SceneLine = {
  speaker?: "감또리" | "나비" | "개미" | "파랑새" | "참새가족" | "나레이션" | "아기참새1" | "아기참새2";
  text?: string;
  aside?: string;
  action?: "wave" | "stretch" | "lookUp" | "holdLeaf" | "smile" | "grit";
};

export type Scene = {
  id: string;
  background: SceneBG;
  sfx?: ("birds" | "breeze" | "thunder")[];
  lines: SceneLine[];
  poemTrigger?: boolean;
};

export type DayEntry = {
  day: number;
  stage: "과거-봄" | "여름" | "폭풍의 밤" | "첫 번째 열매";
  title: string;
  block?: 4 | 5 | 6;
  reward?: string;
  scenes: Scene[];
};
