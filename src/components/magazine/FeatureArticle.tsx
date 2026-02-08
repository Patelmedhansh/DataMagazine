"use client";

import React from 'react';

interface FeatureArticleProps {
  title: string;
  subtitle?: string;
  content?: string | any; // Accept 'any' to handle AI mistakes
  body?: string;
  author?: string;
  date?: string;
}

export function FeatureArticle({
  title = "DATA REPORT",
  subtitle,
  content,
  body,
  author = "DataZine AI",
  date = "Feb 2026"
}: FeatureArticleProps) {
  
  // 1. SAFETY: Resolve the content text
  let articleText = "Generating article content...";
  
  if (typeof content === "string") articleText = content;
  else if (typeof body === "string") articleText = body;
  else if (typeof content === "object") articleText = JSON.stringify(content); // Fallback for bad data

  // 2. SAFETY: Default title if missing
  const displayTitle = title || "MARKET UPDATE";

  return (
    <div className="w-full my-8 relative p-6 bg-[#f5f3e8] border-y-4 border-double border-[#1a1a1a] shadow-sm">
      
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-[#1a1a1a] pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-[#1a1a1a] text-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
              EXCLUSIVE
            </span>
            <span className="font-mono text-xs uppercase text-gray-500">
              {date} • By {author}
            </span>
        </div>
        
        <h2 className="font-sans font-black text-5xl md:text-6xl text-[#1a1a1a] leading-[0.9] mb-2 uppercase tracking-tighter">
          {displayTitle}
        </h2>
        
        {subtitle && (
          <p className="font-sans text-xl text-[#e63946] italic font-bold">
            {subtitle}
          </p>
        )}
      </div>

      {/* Body Text */}
      <div className="prose prose-p:font-mono prose-p:text-justify prose-p:text-sm md:prose-p:text-base max-w-none text-[#1a1a1a] columns-1 md:columns-2 gap-8 leading-relaxed">
        <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px] first-letter:text-[#1a1a1a]">
          {articleText}
        </p>
      </div>

      {/* Footer Mark */}
      <div className="flex justify-center mt-6 opacity-50">
        <div className="w-2 h-2 bg-[#1a1a1a] rotate-45" />
        <div className="w-2 h-2 bg-[#1a1a1a] rotate-45 mx-1" />
        <div className="w-2 h-2 bg-[#1a1a1a] rotate-45" />
      </div>
    </div>
  );
}