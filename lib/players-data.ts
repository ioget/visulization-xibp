export interface PlayerData {
  id: string;
  name: string;
  position: string;
  number: string;
  height: string;
  age: string;
  team: string;
  ppg: number;
  rpg: number;
  apg: number;
  fg: string;
  fgDetail: string;
  threeP: string;
  threePDetail: string;
  usage: string;
  usageDetail: string;
  astTov: string;
  astTovDetail: string;
  assisted: number;
  unassisted: number;
}

export const players: PlayerData[] = [
  {
    id: "johannes",
    name: "Marine Johannès",
    position: "Guard",
    number: "23",
    height: "174 cm",
    age: "31 years",
    team: "Toulouse Métropole",
    ppg: 14.8,
    rpg: 3.8,
    apg: 4.2,
    fg: "48.1%",
    fgDetail: "82nd percentile",
    threeP: "36.7%",
    threePDetail: "71st percentile",
    usage: "24.6%",
    usageDetail: "Team: 1st",
    astTov: "2.3",
    astTovDetail: "League: 1.7",
    assisted: 41,
    unassisted: 59,
  },
  {
    id: "fauthoux",
    name: "Marine Fauthoux",
    position: "Guard",
    number: "12",
    height: "170 cm",
    age: "28 years",
    team: "Toulouse Métropole",
    ppg: 12.4,
    rpg: 3.1,
    apg: 6.8,
    fg: "44.6%",
    fgDetail: "68th percentile",
    threeP: "35.2%",
    threePDetail: "64th percentile",
    usage: "21.1%",
    usageDetail: "Team: 3rd",
    astTov: "2.9",
    astTovDetail: "League: 1.7",
    assisted: 33,
    unassisted: 67,
  },
  {
    id: "rupert",
    name: "Iliana Rupert",
    position: "Center",
    number: "15",
    height: "196 cm",
    age: "25 years",
    team: "Toulouse Métropole",
    ppg: 11.9,
    rpg: 7.8,
    apg: 1.4,
    fg: "52.3%",
    fgDetail: "91st percentile",
    threeP: "28.4%",
    threePDetail: "38th percentile",
    usage: "19.4%",
    usageDetail: "Team: 5th",
    astTov: "1.1",
    astTovDetail: "League: 1.7",
    assisted: 74,
    unassisted: 26,
  },
  {
    id: "williams",
    name: "Gabby Williams",
    position: "Forward",
    number: "9",
    height: "180 cm",
    age: "27 years",
    team: "Toulouse Métropole",
    ppg: 10.8,
    rpg: 5.6,
    apg: 3.2,
    fg: "46.8%",
    fgDetail: "74th percentile",
    threeP: "33.9%",
    threePDetail: "57th percentile",
    usage: "22.4%",
    usageDetail: "Team: 2nd",
    astTov: "1.6",
    astTovDetail: "League: 1.7",
    assisted: 52,
    unassisted: 48,
  },
  {
    id: "chartereau",
    name: "Alexia Chartereau",
    position: "Forward",
    number: "5",
    height: "188 cm",
    age: "26 years",
    team: "Toulouse Métropole",
    ppg: 9.7,
    rpg: 6.2,
    apg: 2.0,
    fg: "47.2%",
    fgDetail: "76th percentile",
    threeP: "34.5%",
    threePDetail: "60th percentile",
    usage: "18.9%",
    usageDetail: "Team: 6th",
    astTov: "1.4",
    astTovDetail: "League: 1.7",
    assisted: 61,
    unassisted: 39,
  },
  {
    id: "michel",
    name: "Sarah Michel",
    position: "Guard",
    number: "7",
    height: "168 cm",
    age: "23 years",
    team: "Toulouse Métropole",
    ppg: 7.4,
    rpg: 2.8,
    apg: 2.6,
    fg: "41.9%",
    fgDetail: "45th percentile",
    threeP: "38.1%",
    threePDetail: "79th percentile",
    usage: "16.2%",
    usageDetail: "Team: 4th",
    astTov: "1.8",
    astTovDetail: "League: 1.7",
    assisted: 47,
    unassisted: 53,
  },
];
