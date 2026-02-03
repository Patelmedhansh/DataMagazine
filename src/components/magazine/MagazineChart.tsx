import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  value: number | string; // allow both, we’ll normalize
  [key: string]: string | number;
}

interface MagazineChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type: "bar" | "line" | "pie";
  dataKey?: string;
  xAxisKey?: string;
  theme?: "business" | "tech" | "playful";
}

export function MagazineChart({
  title,
  subtitle,
  data,
  type,
  dataKey = "value",
  xAxisKey = "name",
  theme = "business",
}: MagazineChartProps) {
  // Theme colors
  const THEME_COLORS: Record<string, string[]> = {
    business: ["#d4af37", "#1a1a1a", "#8b7355", "#c9b037", "#6b5d4f"],
    tech: ["#0066cc", "#00ff88", "#0052a3", "#00cc6a", "#003d7a"],
    playful: ["#ff006e", "#ffd23f", "#cc0058", "#e6b800", "#99004a"],
  };

  const colors = THEME_COLORS[theme] || THEME_COLORS.business;


  

  // Normalize data: ensure numeric values, filter out invalid points
  const normalizedData = (data || [])
  .map((d, idx) => {
    const raw = d[dataKey];
    const num =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
        ? Number(raw.replace(/[^0-9.-]/g, ""))
        : NaN;

    const result = {
      ...d,
      [dataKey]: Number.isFinite(num) ? num : 0,
    };

   
    return result;
  })
  .filter((d) => Number.isFinite(d[dataKey] as number));



const hasData =
  normalizedData.length > 0 &&
  normalizedData.some((d) => (d[dataKey] as number) !== 0);



  // Safety check
  if (!hasData) {
    return (
      <div className={`magazine-chart magazine-chart--${theme}`}>
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <div className="chart-body">
          <p
            style={{
              textAlign: "center",
              padding: "40px",
              opacity: 0.5,
            }}
          >
            No chartable data available
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey={xAxisKey}
                style={{ fontSize: "12px", fontFamily: "Inter" }}
              />
              <YAxis
                style={{ fontSize: "12px", fontFamily: "Inter" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "Inter",
                }}
              />
              <Bar
                dataKey={dataKey}
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey={xAxisKey}
                style={{ fontSize: "12px", fontFamily: "Inter" }}
              />
              <YAxis
                style={{ fontSize: "12px", fontFamily: "Inter" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "Inter",
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={3}
                dot={{ fill: colors[0], r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={normalizedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {normalizedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "Inter",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`magazine-chart magazine-chart--${theme}`}>
      {/* Chart Header */}
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>

      {/* Chart Body */}
      <div className="chart-body">{renderChart()}</div>

      {/* Chart Footer */}
      <div className="chart-footer">
        <div className="chart-caption">
          Data visualization • {normalizedData.length} data points
        </div>
      </div>
    </div>
  );
}
