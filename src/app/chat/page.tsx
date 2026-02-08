"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      {/* THE EDITOR'S DESK CONTAINER */}
      <div className="h-screen w-full bg-newsprint bg-grid-vintage flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Ambient Background Elements */}
        <div className="absolute top-0 left-0 w-full h-16 bg-ink-black opacity-5 z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 p-4 font-marker text-gray-300 text-6xl opacity-20 rotate-12 pointer-events-none select-none">
          DRAFTING...
        </div>

        {/* The Main Chat Sheet */}
        <div className="w-full max-w-5xl h-full md:h-[95%] bg-white border-x-4 border-ink-black shadow-2xl relative z-10 flex flex-col">
          
          {/* Header / Toolbar Look */}
          <div className="h-12 border-b-4 border-ink-black bg-vintage-yellow flex items-center px-4 justify-between shrink-0">
             <span className="font-heading text-xl tracking-widest">UNIT: EDITORIAL-AI</span>
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-ink-black animate-pulse" />
               <span className="font-mono text-xs font-bold">SYSTEM ONLINE</span>
             </div>
          </div>

          {/* The Chat Area */}
          <div className="flex-1 overflow-hidden relative">
             <MessageThreadFull className="h-full" />
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}