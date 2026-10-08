export interface ComparisonTableRow {
  label: string;
  home: string;
  away: string;
  read: string;
  read_class: "us" | "opp" | "neu";
  home_hi: boolean;
  away_hi: boolean;
}

/** Renders the home/away comparison rows report/pre_match_data.py and
 * report/post_match_data.py both already produce via their shared
 * `_row_dict` helper (label, formatted home/away values, a coaching-language
 * "read" badge, and which side -- if either -- has the edge). Shared by the
 * Pre-Match and Post-Match pages since both send this exact row shape. */
export function ComparisonTable({ rows }: { rows: ComparisonTableRow[] }) {
  if (rows.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-border last:border-0">
            <td className="py-2.5 pr-3 text-text-secondary">{row.label}</td>
            <td className={`py-2.5 px-2 text-right tabular-nums ${row.home_hi ? "font-bold text-brand-blue" : "text-text-primary"}`}>
              {row.home}
            </td>
            <td className={`py-2.5 px-2 text-right tabular-nums ${row.away_hi ? "font-bold text-brand-orange" : "text-text-primary"}`}>
              {row.away}
            </td>
            <td className="py-2.5 pl-3 text-right">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  row.read_class === "us"
                    ? "bg-brand-blue/10 text-brand-blue"
                    : row.read_class === "opp"
                      ? "bg-brand-orange/10 text-brand-orange"
                      : "bg-surface-secondary text-text-secondary"
                }`}
              >
                {row.read}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
