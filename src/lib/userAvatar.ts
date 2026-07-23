// Deterministic avatar (color + label) derived from a user id string.
// Ensures every participant in a room has a stable visual marker so that
// rooms with more than two people remain readable.

const PALETTE: { bg: string; fg: string }[] = [
  { bg: "hsl(0 70% 55%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(25 90% 55%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(45 90% 50%)", fg: "hsl(30 40% 15%)" },
  { bg: "hsl(90 55% 45%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(150 55% 42%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(175 65% 42%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(200 80% 52%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(225 75% 60%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(260 65% 62%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(290 65% 58%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(320 70% 58%)", fg: "hsl(0 0% 100%)" },
  { bg: "hsl(340 75% 55%)", fg: "hsl(0 0% 100%)" },
];

const ANIMALS = [
  "🦊", "🐼", "🐧", "🐨", "🦁", "🐯", "🐶", "🐱",
  "🐰", "🐻", "🐮", "🐸", "🐵", "🦄", "🐙", "🦉",
  "🐢", "🦕", "🐳", "🦩", "🦔", "🐺", "🐷", "🐝",
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface UserAvatar {
  bg: string;
  fg: string;
  emoji: string;
  initials: string;
}

export function getUserAvatar(userId: string): UserAvatar {
  const h = hash(userId || "anon");
  const color = PALETTE[h % PALETTE.length];
  const emoji = ANIMALS[Math.floor(h / PALETTE.length) % ANIMALS.length];
  const initials = (userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2) || "??").toUpperCase();
  return { bg: color.bg, fg: color.fg, emoji, initials };
}

export function getUserLabel(userId: string, self: boolean): string {
  if (self) return "我";
  return `用户 ${userId.slice(0, 4)}`;
}
