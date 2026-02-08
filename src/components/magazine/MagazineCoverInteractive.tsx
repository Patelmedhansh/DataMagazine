"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, ArrowRight, Info } from "lucide-react";

interface CoverProps {
  title: string;
  subtitle: string;
  issueNumber?: string;
  funFact?: string;
  metrics: { label: string; value: string; trend?: "up" | "down" }[];
}

export function MagazineCoverInteractive({ 
  title = "DATA ZINE", 
  subtitle = "The Year in Review", 
  issueNumber = "#01", 
  funFact, 
  metrics = [] 
}: CoverProps) {
  const [showFact, setShowFact] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 font-sans text-ink-black selection:bg-vintage-yellow">
      {/* THE COVER CONTAINER */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative border-4 border-ink-black bg-newsprint p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        {/* Halftone Texture Overlay */}
        <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between border-b-2 border-ink-black pb-4 mb-6 font-heading text-xl text-gray-500">
          <span>ISSUE {issueNumber}</span>
          <span>CLOUD CRAFT LLP</span>
        </div>

        {/* MAIN TITLE (EXPLOSION) */}
        <div className="relative mb-12 text-center">
            <motion.h1 
              className="font-hero text-8xl text-vintage-red drop-shadow-[4px_4px_0px_#1a1a1a] rotate-2"
              whileHover={{ scale: 1.05, rotate: 0 }}
            >
              {title}
            </motion.h1>
            <div className="bg-ink-black text-white font-heading text-2xl inline-block px-4 py-1 -rotate-2 mt-2">
              {subtitle}
            </div>
        </div>

        {/* INTERACTIVE METRICS GRID */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="border-2 border-ink-black bg-white p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="font-hero text-3xl text-vintage-blue">{m.value}</div>
              <div className="font-mono text-xs font-bold uppercase mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* HIDDEN FUN FACT (INTERACTIVE) */}
        {funFact && (
          <div className="relative">
             <button 
               onClick={() => setShowFact(!showFact)}
               className="w-full bg-vintage-yellow border-2 border-ink-black p-3 font-heading text-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
             >
               <Sparkles size={20} />
               {showFact ? "CLOSE SECRET" : "TAP FOR SECRET INTEL"}
             </button>
             
             <AnimatePresence>
               {showFact && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="bg-white border-x-2 border-b-2 border-ink-black p-4 font-marker text-vintage-purple text-lg text-center">
                     {funFact}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}

        {/* Footer Decoration */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-vintage-red rounded-full opacity-20" />
      </motion.div>
    </div>
  );
}