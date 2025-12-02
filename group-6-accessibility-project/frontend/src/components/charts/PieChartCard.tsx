import { Card } from "../ui/card";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Badge } from "../ui/badge"; // assuming you have this component

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={nameKey}
                labelLine={false}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={item[nameKey]}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                    aria-hidden="true"
                  />
                  <span>{item[nameKey]}</span>
                </div>
                <Badge variant="secondary">{item[valueKey]} accessibility features</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}