import { MiniTrend } from "./MiniTrend";

export function GameFlow() {
  return (
    <div>
      <MiniTrend values={[18, 26, 22, 34, 38, 42, 47, 52, 58, 62, 65, 69, 74]} />
      <div className="mt-2 flex justify-between text-[10px] text-text-secondary">
        <span>Q1</span>
        <span>Q2</span>
        <span>Q3</span>
        <span>FINAL</span>
      </div>
    </div>
  );
}
