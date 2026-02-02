import React from 'react';

interface MagazineCoverProps {
  title: string;
  tagline: string;
  period: string;
  heroMetric: string;
  growth?: string;
  theme?: 'business' | 'tech' | 'playful';
}

export function MagazineCover({
  title,
  tagline,
  period,
  heroMetric,
  growth,
  theme = 'business'
}: MagazineCoverProps) {
  return (
    <div className={`magazine-cover magazine-cover--${theme}`}>
      {/* Header */}
      <div className="magazine-header">
        <div className="magazine-logo">DATAZINE</div>
        <div className="magazine-issue">Vol. {period}</div>
      </div>

      {/* Main Content */}
      <div className="magazine-content">
        {/* Hero Title */}
        <h1 className="magazine-title">{title}</h1>
        
        {/* Tagline */}
        <p className="magazine-tagline">{tagline}</p>

        {/* Hero Metric */}
        <div className="magazine-metric">
          <div className="metric-value">{heroMetric}</div>
          {growth && (
            <div className="metric-growth">{growth}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="magazine-footer">
        <div className="magazine-date">{period}</div>
        <div className="magazine-category">Business Analytics</div>
      </div>
    </div>
  );
}
