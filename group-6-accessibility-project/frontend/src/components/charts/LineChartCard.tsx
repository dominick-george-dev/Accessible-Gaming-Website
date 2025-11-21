import { Card } from "../ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartCardProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export function LineChartCard({
  title,
  data,
  xKey,
  yKey,
  color = "#10b981",
}: LineChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
