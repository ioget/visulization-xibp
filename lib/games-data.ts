export interface GameData {
  id: string;
  opponent: string;
  date: string;
  ourScore: number;
  theirScore: number;
  eyebrow: string;
}

export const pastGames: GameData[] = [
  {
    id: "bourges-sep14",
    opponent: "Bourges Basket",
    date: "14 September 2026",
    ourScore: 74,
    theirScore: 68,
    eyebrow: "Final · 14 September 2026",
  },
  {
    id: "lyon-sep7",
    opponent: "Lyon ASVEL",
    date: "7 September 2026",
    ourScore: 66,
    theirScore: 71,
    eyebrow: "Final · 7 September 2026",
  },
  {
    id: "landes-aug30",
    opponent: "Basket Landes",
    date: "30 August 2026",
    ourScore: 79,
    theirScore: 60,
    eyebrow: "Final · 30 August 2026",
  },
];
