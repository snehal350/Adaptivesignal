import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface RewardPoint {
  episode: number;
  reward: number;
}

interface Props {
  data: RewardPoint[];
}

export function RewardChart({ data }: Props) {
  if (data.length === 0) return null;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262b47" />
          <XAxis
            dataKey="episode"
            stroke="#9aa0c3"
            fontSize={11}
            label={{ value: "Episode", position: "insideBottom", offset: -2, fill: "#9aa0c3", fontSize: 11 }}
          />
          <YAxis stroke="#9aa0c3" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#171b2e", border: "1px solid #333a5c", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e8eaf5" }}
          />
          <Line
            type="monotone"
            dataKey="reward"
            stroke="#4fd1c5"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
