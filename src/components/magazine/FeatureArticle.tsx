import React from 'react';

interface FeatureArticleProps {
  title: string;
  subtitle?: string;
  content: string;
  author?: string;
  date?: string;
  theme?: 'business' | 'tech' | 'playful';
}

export function FeatureArticle({
  title,
  subtitle,
  content,
  author = "DataZine Analytics",
  date,
  theme = 'business'
}: FeatureArticleProps) {
  return (
    <div className={`magazine-article magazine-article--${theme}`}>
      {/* Article Header */}
      <div className="article-header">
        <h2 className="article-title">{title}</h2>
        {subtitle && <p className="article-subtitle">{subtitle}</p>}
        
        <div className="article-meta">
          <span className="article-author">{author}</span>
          {date && (
            <>
              <span className="article-separator">•</span>
              <span className="article-date">{date}</span>
            </>
          )}
        </div>
      </div>

      {/* Article Body - 2 Column Layout */}
      <div className="article-body">
        <p className="article-dropcap">{content}</p>
      </div>

      {/* Article Footer */}
      <div className="article-footer">
        <div className="article-line"></div>
      </div>
    </div>
  );
}
