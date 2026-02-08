"use client";

import React from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface MagazineChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type: "bar" | "line" | "pie";
}

const COLORS = ["#e63946", "#f77f00", "#fcbf49", "#2a9d8f", "#8338ec"];

// 1. COMIC TOOLTIP
const ComicTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
        <p className="font-mono text-xs font-bold uppercase border-b border-black mb-1">{label}</p>
        <p className="text-[#e63946] font-bold text-lg">
          {payload[0].value.toLocaleString()} units
        </p>
      </div>
    );
  }
  return null;
};

// 2. COMIC LEGEND
const ComicLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-mono uppercase">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <span className="w-3 h-3 border border-black" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function MagazineChart({
  title,
  subtitle,
  data = [],
  type,
}: MagazineChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-black font-mono opacity-50">
        NO DATA TO DISPLAY
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
              <YAxis tick={{ fontFamily: 'monospace', fontSize: 10 }} />
              <Tooltip content={<ComicTooltip />} cursor={{ fill: '#f5f3e8', opacity: 0.5 }} />
              <Bar dataKey="value" name="Units Sold" fill="#e63946" stroke="#1a1a1a" strokeWidth={2}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fontFamily: 'monospace', fontSize: '10px' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
              <YAxis tick={{ fontFamily: 'monospace', fontSize: 10 }} />
              <Tooltip content={<ComicTooltip />} />
              <Legend content={<ComicLegend />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Growth Trend"
                stroke="#1a1a1a" 
                strokeWidth={3} 
                dot={{ fill: "#fcbf49", stroke: "#1a1a1a", strokeWidth: 2, r: 5 }} 
                activeDot={{ r: 8, fill: "#e63946" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="#1a1a1a"
                strokeWidth={2}
                // FIXED: 'name' is now optional string (name?: string) to match Recharts types
                label={({ name, percent }: { name?: string; percent?: number }) => 
                  `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#1a1a1a', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ComicTooltip />} />
              <Legend content={<ComicLegend />} />
            </PieChart>
          </ResponsiveContainer>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full my-6 bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* Title Badge */}
      <div className="absolute -top-4 left-4 bg-[#fcbf49] border-2 border-[#1a1a1a] px-4 py-1 transform -rotate-2 z-10">
        <h3 className="font-sans font-black text-xl tracking-wider text-[#1a1a1a] uppercase">
          {title}
        </h3>
      </div>
      
      {/* Subtitle */}
      {subtitle && (
         <div className="mt-4 mb-2 ml-1 text-sm font-mono text-gray-500 italic">
           — {subtitle}
         </div>
      )}

      {/* Chart Area */}
      <div className="mt-6 w-full bg-[#f5f3e8]/50 border border-[#1a1a1a]/10 rounded p-2">
        {renderChart()}
      </div>

      {/* Footer Note */}
      <div className="mt-2 text-right">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          Fig 1.{Math.floor(Math.random() * 99)} • Source: DataZine
        </span>
      </div>
    </div>
  );
}