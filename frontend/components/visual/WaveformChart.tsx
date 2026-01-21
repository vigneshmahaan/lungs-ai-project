"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WaveformChart({ waveform }: { waveform: number[] }) {
  const data = waveform.map((v, i) => ({ i, v }));
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey="i" tick={false} />
          <YAxis width={28} domain={[-1, 1]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value) => [Number(value).toFixed(3), "amp"]}
            labelFormatter={(label) => `sample ${label}`}
          />
          <Line type="monotone" dataKey="v" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

