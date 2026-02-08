"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, TrendingUp } from "lucide-react";

// --- Mock "Living Data" Components ---

const AnimatedLineChart = () => (
  <div className="border border-neutral-800 p-2 h-32 flex items-end gap-1 overflow-hidden bg-neutral-100/50 relative">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="w-full bg-neutral-800"
        initial={{ height: "10%" }}
        animate={{ height: `${Math.random() * 80 + 10}%` }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          delay: i * 0.1,
        }}
      />
    ))}
    <div className="absolute top-0 left-0 text-[10px] font-mono bg-neutral-800 text-white px-1">
      FIG 1.1: MARKET VOLATILITY
    </div>
  </div>
);

const RollingTicker = () => (
  <div className="border-y-2 border-neutral-900 py-1 overflow-hidden whitespace-nowrap font-mono text-sm uppercase tracking-widest bg-neutral-200">
    <motion.div
      animate={{ x: [0, -1000] }}
      transition={{ ease: "linear", duration: 20, repeat: Infinity }}
      className="inline-block"
    >
      +++ DATA ZINE GENERATED +++ AI DRIVEN INSIGHTS +++ REAL-TIME ANALYTICS +++
      MARKET TRENDS RISING +++ GLOBAL DATA FLOW +++ NEW ISSUE AVAILABLE +++
    </motion.div>
  </div>
);

// --- Main Page Component ---

export default function Home() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col font-serif">
      {/* Header Section */}
      <header className="border-b-4 border-neutral-900 pb-4 mb-8 text-center relative">
        <div className="flex justify-between items-end border-b border-neutral-900 pb-2 mb-2 font-mono text-xs md:text-sm uppercase tracking-wider">
          <span>Vol. 01 — Issue 42</span>
          <span>{currentDate}</span>
          <span>Price: FREE</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-2 scale-y-110">
          DATA MAGAZINE
        </h1>
        
        <div className="flex justify-center items-center gap-4 text-sm font-bold italic font-mono mt-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            LIVE GENERATION
          </span>
          <span>•</span>
          <span>AI POWERED JOURNALISM</span>
        </div>
      </header>

      <RollingTicker />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 flex-1">
        
        {/* Left Column: Teaser Articles */}
        <div className="md:col-span-3 space-y-8 border-r border-neutral-300 pr-4 hidden md:block">
          <article>
            <h3 className="text-xl font-bold mb-2 leading-tight">
              The Rise of Generative Interfaces
            </h3>
            <div className="h-1 w-12 bg-neutral-900 mb-2" />
            <p className="text-sm text-neutral-600 font-serif leading-relaxed text-justify">
              How AI is transforming static dashboards into dynamic, conversational narratives. 
              We explore the mechanics behind Tambo's engine.
            </p>
          </article>
          
          <article className="border-t border-neutral-300 pt-4">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-neutral-500">
              <TrendingUp size={14} />
              <span>MARKET WATCH</span>
            </div>
            <AnimatedLineChart />
            <p className="text-xs font-mono mt-2 text-justify opacity-60">
              Real-time data simulation showing increased user engagement metrics across all sectors.
            </p>
          </article>
        </div>

        {/* Center Column: Hero & Call to Action */}
        <div className="md:col-span-6 flex flex-col items-center justify-center text-center py-12 md:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <div className="border-2 border-neutral-900 p-2 mb-8">
              <div className="border border-neutral-900 p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <PieChart className="w-16 h-16 mx-auto mb-4 text-neutral-800" />
                <h2 className="text-3xl font-bold mb-4 italic">
                  "Your Data, Narrated."
                </h2>
                <p className="text-neutral-600 mb-8 font-serif">
                  Transform raw analytics into a compelling magazine format. 
                  Ask questions, generate charts, and publish your story.
                </p>
                
                <Link 
                  href="/chat"
                  className="group relative inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-4 text-lg font-bold tracking-widest hover:bg-red-700 transition-all w-full"
                >
                  START EDITING
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: "Ad" Space / Secondary Data */}
        <div className="md:col-span-3 border-l border-neutral-300 pl-4 hidden md:flex flex-col gap-6">
          <div className="border-4 border-double border-neutral-300 p-4 text-center bg-neutral-100">
            <h4 className="font-mono font-bold text-lg mb-2">HACKATHON EDITION</h4>
            <p className="text-xs font-serif italic mb-4">
              Built for the "The UI Strikes Back" event.
            </p>
            <div className="w-16 h-16 bg-neutral-900 rounded-full mx-auto text-white flex items-center justify-center font-bold text-xl">
              2026
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
             <div className="font-mono text-xs space-y-1 text-neutral-400">
                <p>LAT: 22.3072° N</p>
                <p>LON: 73.1812° E</p>
                <p>LOC: VADODARA, IN</p>
                <p>SYS: ONLINE</p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-neutral-900 pt-4 mt-8 flex justify-between items-center font-mono text-xs text-neutral-500 uppercase">
        <p>© 2026 CLOUDCRAFT LLP. All rights reserved.</p>
        <p>Printed in React & Next.js</p>
      </footer>
    </main>
  );
}