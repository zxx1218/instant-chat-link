export interface ChatTheme {
  id: string;
  name: string;
  swatch: string[]; // for preview dots
  background: string; // CSS background value for the chat surface
  bubbleSelf: string; // hsl values (no hsl()) for --chat-bubble-self
  bubbleOther: string;
  bubbleSelfFg: string;
  bubbleOtherFg: string;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: "aurora",
    name: "极光蓝",
    swatch: ["#0f2540", "#1e88e5", "#22d3ee"],
    background:
      "radial-gradient(ellipse at top, hsl(220 30% 18%) 0%, hsl(220 25% 8%) 100%)",
    bubbleSelf: "200 100% 55%",
    bubbleOther: "220 15% 22%",
    bubbleSelfFg: "0 0% 100%",
    bubbleOtherFg: "210 20% 95%",
  },
  {
    id: "sunset",
    name: "落日橙",
    swatch: ["#2b1338", "#f97316", "#f43f5e"],
    background:
      "radial-gradient(ellipse at top left, hsl(20 60% 22%) 0%, hsl(320 40% 10%) 55%, hsl(260 30% 8%) 100%)",
    bubbleSelf: "22 95% 58%",
    bubbleOther: "285 20% 22%",
    bubbleSelfFg: "0 0% 100%",
    bubbleOtherFg: "30 30% 95%",
  },
  {
    id: "forest",
    name: "森林绿",
    swatch: ["#0b2a1e", "#10b981", "#84cc16"],
    background:
      "radial-gradient(ellipse at top, hsl(155 40% 15%) 0%, hsl(160 35% 7%) 100%)",
    bubbleSelf: "158 70% 42%",
    bubbleOther: "160 20% 20%",
    bubbleSelfFg: "0 0% 100%",
    bubbleOtherFg: "150 20% 95%",
  },
  {
    id: "lavender",
    name: "梦幻紫",
    swatch: ["#1f1030", "#a855f7", "#ec4899"],
    background:
      "radial-gradient(ellipse at top, hsl(275 45% 20%) 0%, hsl(270 35% 8%) 100%)",
    bubbleSelf: "280 80% 62%",
    bubbleOther: "275 20% 22%",
    bubbleSelfFg: "0 0% 100%",
    bubbleOtherFg: "280 25% 95%",
  },
  {
    id: "mono",
    name: "极简灰",
    swatch: ["#111111", "#3f3f46", "#e5e5e5"],
    background:
      "radial-gradient(ellipse at top, hsl(0 0% 14%) 0%, hsl(0 0% 5%) 100%)",
    bubbleSelf: "0 0% 92%",
    bubbleOther: "0 0% 18%",
    bubbleSelfFg: "0 0% 8%",
    bubbleOtherFg: "0 0% 95%",
  },
  {
    id: "sakura",
    name: "樱花粉",
    swatch: ["#2a1520", "#f472b6", "#fda4af"],
    background:
      "radial-gradient(ellipse at top, hsl(340 40% 20%) 0%, hsl(340 30% 8%) 100%)",
    bubbleSelf: "335 85% 65%",
    bubbleOther: "335 20% 22%",
    bubbleSelfFg: "0 0% 100%",
    bubbleOtherFg: "340 25% 96%",
  },
];

export const DEFAULT_THEME_ID = "aurora";

export function getTheme(id: string): ChatTheme {
  return CHAT_THEMES.find((t) => t.id === id) ?? CHAT_THEMES[0];
}
