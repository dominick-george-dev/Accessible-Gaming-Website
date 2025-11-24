import { Card } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartCardProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export function BarChartCard({ title, data, xKey, yKey, color = "#3b82f6" }: BarChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
