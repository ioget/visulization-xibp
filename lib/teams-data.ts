export interface RosterRow {
  player: string;
  pos: "G" | "F" | "C";
  gp: number;
  ppg: number;
  rpg: number;
  apg: number;
  fg: number;
  threeP: number;
}

export interface TeamData {
  id: string;
  name: string;
  abbr: string;
  record: string;
  roster: RosterRow[];
  style: {
    pace: number;
    ortg: number;
    threePFreq: number;
    defReb: number;
  };
  signature: string;
}

export const teams: TeamData[] = [
  {
    id: "toulouse",
    name: "Toulouse Métropole",
    abbr: "TMB",
    record: "7–4",
    roster: [
      { player: "M. Johannès", pos: "G", gp: 11, ppg: 14.8, rpg: 3.8, apg: 4.2, fg: 48.1, threeP: 36.7 },
      { player: "M. Fauthoux", pos: "G", gp: 11, ppg: 12.4, rpg: 3.1, apg: 6.8, fg: 44.6, threeP: 35.2 },
      { player: "I. Rupert", pos: "C", gp: 10, ppg: 11.9, rpg: 7.8, apg: 1.4, fg: 52.3, threeP: 28.4 },
      { player: "G. Williams", pos: "F", gp: 11, ppg: 10.8, rpg: 5.6, apg: 3.2, fg: 46.8, threeP: 33.9 },
      { player: "A. Chartereau", pos: "F", gp: 9, ppg: 9.7, rpg: 6.2, apg: 2.0, fg: 47.2, threeP: 34.5 },
      { player: "S. Michel", pos: "G", gp: 11, ppg: 7.4, rpg: 2.8, apg: 2.6, fg: 41.9, threeP: 38.1 },
    ],
    style: { pace: 71.4, ortg: 108.2, threePFreq: 38.4, defReb: 72.8 },
    signature: "Fast tempo, high perimeter volume, and above-average defensive rebounding.",
  },
  {
    id: "lyon",
    name: "Lyon ASVEL",
    abbr: "LYO",
    record: "8–3",
    roster: [
      { player: "M. Fofana", pos: "G", gp: 11, ppg: 13.6, rpg: 3.2, apg: 5.1, fg: 46.3, threeP: 34.8 },
      { player: "L. Vanloo", pos: "G", gp: 11, ppg: 11.8, rpg: 2.6, apg: 4.4, fg: 43.1, threeP: 37.9 },
      { player: "D. Sarr", pos: "C", gp: 10, ppg: 10.4, rpg: 8.6, apg: 1.0, fg: 55.7, threeP: 0 },
      { player: "H. Kaba", pos: "F", gp: 11, ppg: 9.9, rpg: 5.9, apg: 1.8, fg: 47.9, threeP: 30.2 },
    ],
    style: { pace: 74.2, ortg: 111.4, threePFreq: 36.5, defReb: 70.1 },
    signature: "High tempo with strong interior scoring and elite half-court efficiency.",
  },
  {
    id: "bourges",
    name: "Bourges Basket",
    abbr: "BOU",
    record: "9–2",
    roster: [
      { player: "A. Migno", pos: "G", gp: 11, ppg: 13.6, rpg: 2.9, apg: 3.8, fg: 45.2, threeP: 37.4 },
      { player: "O. Miyem", pos: "F", gp: 11, ppg: 11.4, rpg: 6.1, apg: 2.2, fg: 49.7, threeP: 30.8 },
      { player: "H. Bibang", pos: "C", gp: 10, ppg: 9.8, rpg: 7.2, apg: 1.0, fg: 54.1, threeP: 0 },
      { player: "S. Ogoke", pos: "G", gp: 11, ppg: 8.9, rpg: 2.4, apg: 4.6, fg: 41.3, threeP: 33.6 },
    ],
    style: { pace: 69.1, ortg: 109.6, threePFreq: 33.2, defReb: 74.5 },
    signature: "Controlled pace, disciplined half-court sets, and the league's best defensive glass.",
  },
  {
    id: "landes",
    name: "Basket Landes",
    abbr: "LAN",
    record: "6–5",
    roster: [
      { player: "S. Djaldi-Tabdi", pos: "G", gp: 11, ppg: 10.2, rpg: 3.1, apg: 3.4, fg: 43.8, threeP: 34.2 },
      { player: "A. Battle", pos: "F", gp: 11, ppg: 9.6, rpg: 5.4, apg: 1.9, fg: 46.5, threeP: 29.7 },
      { player: "O. Kacerik", pos: "C", gp: 9, ppg: 8.7, rpg: 6.9, apg: 1.2, fg: 50.3, threeP: 0 },
      { player: "I. Yesilova", pos: "G", gp: 11, ppg: 7.8, rpg: 2.2, apg: 3.0, fg: 40.6, threeP: 31.9 },
    ],
    style: { pace: 68.4, ortg: 104.9, threePFreq: 31.8, defReb: 71.2 },
    signature: "Balanced roster still building shooting consistency and half-court spacing.",
  },
];
