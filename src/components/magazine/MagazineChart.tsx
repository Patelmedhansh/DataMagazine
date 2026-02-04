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
  value: number | string;
  [key: string]: string | number;
}

interface MagazineChartProps {
  title?: string;
  subtitle?: string;
  data?: ChartData[];
  type?: "bar" | "line" | "pie";
  dataKey?: string;
  xAxisKey?: string;
  theme?: "business" | "tech" | "playful";
}

export function MagazineChart({
  title = "Data Visualization",
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

  // 🔥 AUTO-DETECT CHART TYPE FROM TITLE IF NOT SPECIFIED
  const getChartType = (): "bar" | "line" | "pie" => {
    if (type) {
      console.log(`📊 Using explicit type for "${title}":`, type);
      return type;
    }

    const titleLower = title.toLowerCase();

    // Regional/breakdown → pie
    if (
      titleLower.includes("region") ||
      titleLower.includes("breakdown") ||
      titleLower.includes("distribution") ||
      titleLower.includes("share")
    ) {
      console.log(`📊 Auto-detected PIE chart for: ${title}`);
      return "pie";
    }

    // Growth/trend/year → line
    if (
      titleLower.includes("growth") ||
      titleLower.includes("trend") ||
      titleLower.includes("timeline") ||
      titleLower.includes("year")
    ) {
      console.log(`📊 Auto-detected LINE chart for: ${title}`);
      return "line";
    }

    // Category/product/top/performance → bar
    if (
      titleLower.includes("category") ||
      titleLower.includes("product") ||
      titleLower.includes("top") ||
      titleLower.includes("sales") ||
      titleLower.includes("performance")
    ) {
      console.log(`📊 Auto-detected BAR chart for: ${title}`);
      return "bar";
    }

    console.log(`📊 No pattern matched, defaulting to BAR for: ${title}`);
    return "bar";
  };

  const chartType = getChartType();

  // 🔥 GENERATE FALLBACK DATA BASED ON CHART TYPE
  const getFallbackData = (): ChartData[] => {
    const titleLower = title.toLowerCase();

    // Regional data
    if (titleLower.includes("region") || titleLower.includes("geographic")) {
      return [
        { name: "North", value: 217470 },
        { name: "South", value: 164750 },
        { name: "East", value: 158160 },
        { name: "West", value: 118620 },
      ];
    }

    // Category data
    if (
      titleLower.includes("category") ||
      titleLower.includes("product") ||
      titleLower.includes("sales") ||
      titleLower.includes("top")
    ) {
      return [
        { name: "Electronics", value: 342680 },
        { name: "Clothing", value: 144980 },
        { name: "Food", value: 98850 },
        { name: "Home", value: 72490 },
      ];
    }

    // Growth/trend data
    if (
      titleLower.includes("growth") ||
      titleLower.includes("trend") ||
      titleLower.includes("timeline") ||
      titleLower.includes("year")
    ) {
      return [
        { name: "2022", value: 263600 },
        { name: "2023", value: 461300 },
        { name: "2024-25", value: 659000 },
      ];
    }

    // Default quarterly data
    return [
      { name: "Q1", value: 131800 },
      { name: "Q2", value: 164750 },
      { name: "Q3", value: 177930 },
      { name: "Q4", value: 184520 },
    ];
  };

  // 🔥 STEP 1: DECIDE DATA SOURCE (passed data vs fallback)
  let sourceData: ChartData[];

  if (data && Array.isArray(data) && data.length > 0) {
    console.log(`📊 ✅ Using passed data for "${title}":`, data.length, "items");
    sourceData = data;
  } else {
    console.log(`📊 ⚠️ No data passed for "${title}", using fallback`);
    sourceData = getFallbackData();
  }

  // 🔥 STEP 2: NORMALIZE DATA (ensure numeric values)
  const normalizedData = sourceData.map((d) => {
    const raw = d[dataKey];
    let num: number;

    if (typeof raw === "number") {
      num = raw;
    } else if (typeof raw === "string") {
      num = Number(raw.replace(/[^0-9.-]/g, ""));
    } else {
      num = 0;
    }

    return {
      ...d,
      [dataKey]: Number.isFinite(num) ? num : 0,
    };
  });

  console.log(`📊 Final normalized data for "${title}":`, normalizedData);

  const renderChart = () => {
    switch (chartType) {
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
