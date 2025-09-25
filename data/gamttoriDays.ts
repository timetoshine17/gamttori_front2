import { DayEntry } from "./types";

export const GAMTORI_DAYS: DayEntry[] = [
  {
    day: 1,
    stage: "과거-봄",
    title: "첫 만남",
    scenes: [
      {
        id: "1-1",
        background: { type: "yard", time: "morning" },
        lines: [
          { speaker: "나레이션", text: "푸른 하늘, 아늑한 마당 한 켠. 햇살 아래 감나무 씨앗 하나가 심긴다." },
        ],
      },
      {
        id: "1-2",
        background: { type: "yard" },
        lines: [{ speaker: "감또리", text: "안녕하세요? 제 이름은 감또리라고 해요." }],
      },
      {
        id: "1-3",
        background: { type: "yard" },
        lines: [{ speaker: "감또리", text: "저는 시 읽는 것을 좋아해요. 앞으로 시를 읽고 제가 싹을 틔울 수 있게 도와주세요!" }],
      },
    ],
  },

  {
    day: 2,
    stage: "과거-봄",
    title: "감또리의 하루",
    scenes: [
      {
        id: "2-1",
        background: { type: "yard", time: "morning" },
        lines: [{ speaker: "감또리", text: "좋은 아침이에요!" }],
      },
      {
        id: "2-2",
        background: { type: "sky", time: "noon" },
        sfx: ["birds"],
        lines: [{ speaker: "나레이션", text: "맑은 하늘 위로 새들이 날아간다." }],
      },
      {
        id: "2-3",
        background: { type: "sky", time: "sunset" },
        lines: [{ speaker: "감또리", text: "너무 아름다워요! 저는 매일 해질녘을 기다려요." }],
      },
      {
        id: "2-4",
        background: { type: "sky", time: "night" },
        lines: [],
      },
    ],
  },

  {
    day: 3,
    stage: "과거-봄",
    title: "하루에 한 낱말씩",
    scenes: [
      {
        id: "3-1",
        background: { type: "yard", time: "morning" },
        lines: [
          { speaker: "감또리", text: "안녕, 좋은 하루!", action: "wave" },
          { speaker: "개미", text: "오늘도 열심히 일해야지!" },
          { speaker: "감또리", aside: "'열심히!'" },
        ],
      },
      {
        id: "3-2",
        background: { type: "yard" },
        lines: [
          { speaker: "감또리", text: "안녕! 오늘 무슨 좋은 일 있어?" },
          { speaker: "나비", text: "봄이 와서 들에 꽃들이 잔뜩 피었어, 나는 오늘 정말 행복해." },
          { speaker: "감또리", aside: "'행복!'" },
        ],
      },
      {
        id: "3-3",
        background: { type: "sky", time: "sunset" },
        lines: [{ speaker: "감또리", text: "개미에게는 오늘 하루가 '열심히'였고, 나비에게 오늘 하루는 '행복'이었어요. 그렇다면…" }],
      },
    ],
  },

  {
    day: 4,
    stage: "과거-봄",
    title: "좋아하는 계절",
    scenes: [
      {
        id: "4-1",
        background: { type: "yard", time: "morning" },
        lines: [
          { speaker: "감또리", text: "안녕!" },
          { speaker: "나비", text: "좋은 아침!" },
          { speaker: "감또리", text: "나비야, 너는 어떤 계절을 가장 좋아해?" },
          { speaker: "나비", text: "나는 봄이 제일 좋아! 꽃이 많이 피니까." },
        ],
      },
      {
        id: "4-2",
        background: { type: "yard", time: "sunset" },
        lines: [
          { speaker: "감또리", text: "안녕, 얘들아!" },
          { speaker: "참새가족", text: "안녕, 감또리야." },
          { speaker: "감또리", text: "너희들은 어느 계절을 가장 좋아하니?" },
          { speaker: "아기참새1", text: "나는 가을이 제일 좋아. 논에서 익은 낟알을 주워먹을 수 있으니까." },
          { speaker: "아기참새2", text: "나는 여름이 좋은데. 더울 때 하늘을 날다가 잎사귀가 많은 나무 그늘 밑에서 쉬다 보면 기분이 좋거든." },
          { speaker: "감또리", text: "각자 다른 계절을 좋아하는구나?" },
        ],
      },
    ],
  },

  {
    day: 5,
    stage: "과거-봄",
    title: "그 계절의 놀이",
    scenes: [
      {
        id: "5-1",
        background: { type: "yard", time: "afternoon" },
        lines: [
          { speaker: "감또리", text: "나는 사계절 중에 봄이 제일 좋은데… 봄에만 즐길 수 있는 놀이가 없을까?" },
          { speaker: "나레이션", text: "벚꽃잎이 흩날리고, 감또리가 미소 짓는다." },
        ],
      },
      {
        id: "5-2",
        background: { type: "yard", time: "night" },
        lines: [
          { speaker: "나레이션", text: "벚꽃잎이 눈처럼 쏟아지는 밤. 감또리의 표정이 점점 밝아진다." },
          { speaker: "감또리", text: "아름다워… 봄에만 만나볼 수 있는 건 벚꽃놀이였구나." },
        ],
      },
    ],
  },

  {
    day: 6,
    stage: "과거-봄",
    title: "그 계절의 기억",
    scenes: [
      {
        id: "6-1",
        background: { type: "yard", time: "morning" },
        lines: [
          { speaker: "감또리", text: "(독백) 벌써 땅 위로 올라온 지 오래 지났구나. 이제까지의 봄은 정말 즐거웠어." },
        ],
      },
      {
        id: "6-2",
        background: { type: "flashback" },
        lines: [
          { speaker: "나레이션", text: "회상 속에 개미, 나비, 참새 가족, 그리고 감또리가 본 풍경들이 스쳐 지나간다." },
          { speaker: "감또리", text: "이제까지 만난 친구들과의 기억이 내게 큰 힘이 되어주는 것 같아." },
        ],
      },
    ],
  },

  {
    day: 7,
    stage: "과거-봄",
    title: "나뭇잎 편지",
    scenes: [
      {
        id: "7-1",
        background: { type: "yard", time: "morning" },
        lines: [
          { speaker: "감또리", text: "(기지개를 켜며) 따사로운 아침이야. 왠지 좋은 일이 생길 것만 같은걸." },
        ],
      },
      {
        id: "7-2",
        background: { type: "yard" },
        lines: [
          { speaker: "파랑새", text: "감또리야, 너한테 편지 왔어." },
          { speaker: "감또리", text: "정말?" },
          { speaker: "나레이션", text: "파랑새가 가방에서 나뭇잎 편지를 꺼내 건넨다." },
          { speaker: "감또리", text: "밤또리가 보낸 편지구나!" },
        ],
      },
    ],
  },
];
