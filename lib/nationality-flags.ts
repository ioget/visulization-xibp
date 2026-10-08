/** players.nationality stores French demonyms (e.g. "Français",
 * "Américain"), sometimes several comma-separated for dual nationality
 * (e.g. "Français, Camerounais") -- this maps the exact set of values
 * confirmed present in the database to an ISO 3166-1 alpha-2 code, from
 * which the flag emoji is computed (never hand-typed, so it can't typo
 * into the wrong flag). An unmapped demonym just renders with no flag,
 * never a wrong guess. */
const DEMONYM_TO_COUNTRY_CODE: Record<string, string> = {
  "Américain": "US",
  "Belge": "BE",
  "Camerounais": "CM",
  "Croate": "HR",
  "Espagnol": "ES",
  "Français": "FR",
  "Ghanéen": "GH",
  "Guinéen": "GN",
  "Italien": "IT",
  "Ivoirien": "CI",
  "Jamaïcain": "JM",
  "Letton": "LV",
  "Luxembourg": "LU",
  "Luxembourgeois": "LU",
  "Nigérian": "NG",
  "Polonais": "PL",
  "Portoricain": "PR",
  "Rwanda": "RW",
  "Rwandais": "RW",
  "Sénégalais": "SN",
  "Serbe": "RS",
  "Slovaque": "SK",
  "Suisse": "CH",
  "Tchèque": "CZ",
};

function flagFromCountryCode(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function nationalityFlags(nationality: string | null): string {
  if (!nationality) return "";
  return nationality
    .split(",")
    .map((part) => part.trim())
    .map((demonym) => DEMONYM_TO_COUNTRY_CODE[demonym])
    .filter((code): code is string => Boolean(code))
    .map(flagFromCountryCode)
    .join(" ");
}
