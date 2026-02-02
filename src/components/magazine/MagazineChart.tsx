import React from 'react';
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
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface MagazineChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie';
  dataKey?: string;
  xAxisKey?: string;
  theme?: 'business' | 'tech' | 'playful';
}

export function MagazineChart({
  title,
  subtitle,
  data,
  type,
  dataKey = 'value',
  xAxisKey = 'name',
  theme = 'business'
}: MagazineChartProps) {
  
  // Theme colors
  const THEME_COLORS: Record<string, string[]> = {
    business: ['#d4af37', '#1a1a1a', '#8b7355', '#c9b037', '#6b5d4f'],
    tech: ['#0066cc', '#00ff88', '#0052a3', '#00cc6a', '#003d7a'],
    playful: ['#ff006e', '#ffd23f', '#cc0058', '#e6b800', '#99004a']
  };

  const colors = THEME_COLORS[theme] || THEME_COLORS.business;

  // Safety check
  if (!data || data.length === 0) {
    return (
      <div className={`magazine-chart magazine-chart--${theme}`}>
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <div className="chart-body">
          <p style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            No data available
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey={xAxisKey} 
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
              />
              <YAxis 
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'Inter'
                }}
              />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey={xAxisKey}
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
              />
              <YAxis 
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'Inter'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={{ fill: colors[0], r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'Inter'
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
      <div className="chart-body">
        {renderChart()}
      </div>

      {/* Chart Footer */}
      <div className="chart-footer">
        <div className="chart-caption">
          Data visualization • {data?.length || 0} data points
        </div>
      </div>
    </div>
  );
}
