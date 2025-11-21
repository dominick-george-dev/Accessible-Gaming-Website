import { Card } from "../ui/card";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface PieChartCardProps {
  title: string;
  data: any[];
  nameKey: string;
  valueKey: string;
  colors: string[];
}

export function PieChartCard({ title, data, nameKey, valueKey, colors }: PieChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
