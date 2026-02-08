/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { MagazineCover } from "@/components/magazine/MagazineCover";
import { MagazineCoverInteractive } from "@/components/magazine/MagazineCoverInteractive"; 
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { FeatureArticle } from "@/components/magazine/FeatureArticle";
import { MagazineChart } from "@/components/magazine/MagazineChart";

// Export the System Prompt
export { DATAZINE_SYSTEM_PROMPT } from "@/lib/system-prompt";

/**
 * TOOLS CONFIGURATION
 * Switched to "Instant Mode" for Hackathon Performance
 */
export const tools: TamboTool[] = [
  // 1. SALES DATA (Instant - No API Call)
  {
    name: "querySalesData",
    description: "Fetch sales data instantly. Returns revenue, growth, and insights.",
    tool: async ({ period }: { period: string }) => {
      // Simulate a quick "thinking" pause for realism (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        period,
        revenue: 850000,
        revenueFormatted: "$850k",
        growth: 185.5,
        growthFormatted: "+185.5%",
        orders: 3400,
        topCategory: "AI Chips",
        topRegion: "Neo-Tokyo",
        topRegionShare: "42%",
        insight: "Unprecedented demand in neural sectors."
      };
    },
    inputSchema: z.object({
      period: z.string().describe("Period like '2024-25', 'FY 2024-25'")
    }),
    outputSchema: z.object({
      period: z.string(),
      revenue: z.number(),
      revenueFormatted: z.string(),
      growth: z.number(),
      growthFormatted: z.string(),
      orders: z.number(),
      topCategory: z.string(),
      topRegion: z.string(),
      topRegionShare: z.string(),
      insight: z.string()
    })
  },

  // 2. CHART DATA (Fixed Labels - No "A/B")
  {
  name: "getChartData",
  description: "Get detailed chart data. Returns specific names (North, Tech, Q1) instead of generic letters.",
  tool: async ({ chartType }: { chartType: 'regional' | 'category' | 'growth' | 'quarterly' }) => {
    // 1. REGIONAL (Pie Chart Data)
    if (chartType === "regional") {
      return [
        { name: "North", value: 35000 },
        { name: "South", value: 25000 },
        { name: "East", value: 25000 },
        { name: "West", value: 15000 },
      ];
    }
    // 2. CATEGORY (Bar Chart Data)
    if (chartType === "category") {
      return [
        { name: "AI Chips", value: 60000 },
        { name: "Software", value: 20000 },
        { name: "Services", value: 10000 },
        { name: "Hardware", value: 10000 },
      ];
    }
    // 3. GROWTH (Line Chart Data)
    if (chartType === "growth") {
      return [
         { name: "2023", value: 100000 },
         { name: "2024", value: 180000 },
         { name: "2025", value: 250000 },
      ];
    }
    // 4. FALLBACK (Safe Defaults)
    return [
       { name: "Q1", value: 12000 },
       { name: "Q2", value: 19000 },
       { name: "Q3", value: 15000 },
       { name: "Q4", value: 22000 },
    ];
  },
  inputSchema: z.object({
    period: z.string().optional(),
    chartType: z.enum(["regional", "category", "growth", "quarterly"]),
  }),
  outputSchema: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    })
  ),
  },

  // 3. STORY GENERATOR (Fixed Content - No empty strings)
  {
    name: "generateStory",
    description: "Generate the feature article text.",
    tool: async () => {
      return {
        title: "THE AI REVOLUTION IS HERE",
        subtitle: "How Neural Chips Took Over The Market",
        content: "In a stunning turn of events, the AI Chips category has completely dominated the fiscal landscape for 2025. What started as a niche experiment in our R&D labs has now become the primary revenue driver for Cloud Craft LLP. The North Region, traditionally known for conservative spending, led the charge with a massive 35% adoption rate.\n\nAnalysts predict this trend isn't slowing down. 'We are seeing a fundamental shift in how enterprises consume compute power,' says our lead data scientist. With Q4 numbers smashing all previous records, the question isn't if we should double down, but how fast we can scale production to meet this insatiable demand.",
        author: "DataZine Bot",
        date: "Feb 2026"
      };
    },
    inputSchema: z.object({
      data: z.any().optional(),
      angle: z.string().optional()
    }),
    outputSchema: z.object({
      title: z.string(),
      subtitle: z.string(),
      content: z.string(),
      author: z.string(),
      date: z.string()
    })
  },

  // (Optional: Keep population tools if needed for other demos)
  {
    name: "countryPopulation",
    description: "Get population stats",
    tool: getCountryPopulations,
    inputSchema: z.object({ continent: z.string().optional() }),
    outputSchema: z.any(),
  }
];

/**
 * COMPONENTS CONFIGURATION
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    component: Graph,
    propsSchema: graphSchema,
    description: "Renders charts"
  },
  {
    name: "DataCard",
    component: DataCard,
    propsSchema: dataCardSchema,
    description: "Renders data cards"
  },
  // 1. INTERACTIVE COVER
  {
    name: "MagazineCoverInteractive",
    description: `
      THE HERO COMPONENT for DataZine. 
      Use this to present the FINAL SUMMARY or COVER of the magazine.
      ALWAYS put this at the TOP of a generated magazine.
    `,
    component: MagazineCoverInteractive,
    propsSchema: z.object({
      title: z.string().describe("Main headline (e.g. 'REVENUE EXPLOSION!')"),
      subtitle: z.string().describe("Sub-headline (e.g. 'FY 2024-25 Review')"),
      issueNumber: z.string().optional().describe("Issue # (e.g. 'Vol. 42')"),
      funFact: z.string().optional().describe("A hidden easter egg fact about the data"),
      metrics: z.array(z.object({
        label: z.string(),
        value: z.string(),
        trend: z.enum(['up', 'down']).optional()
      })).describe("List of 3 key metrics")
    })
  },
  // 2. FEATURE ARTICLE
  {
    name: "FeatureArticle",
    description: "Magazine feature article with comic styling.",
    component: FeatureArticle,
    propsSchema: z.object({
      title: z.string(),
      content: z.string(),
      subtitle: z.string().optional(),
      author: z.string().optional(),
      date: z.string().optional()
    })
  },
  // 3. COMIC CHART
  {
    name: "MagazineChart",
    description: "Magazine style chart. Call getChartData first to get the data array.",
    component: MagazineChart,
    propsSchema: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      data: z.array(z.object({ 
        name: z.string(), 
        value: z.number() 
      })),
      type: z.enum(['bar', 'line', 'pie'])
    })
  },
  // (Legacy Cover - kept for safety)
  {
    name: "MagazineCover",
    description: "Legacy Cover. Prefer MagazineCoverInteractive.",
    component: MagazineCover,
    propsSchema: z.object({
      title: z.string(),
      tagline: z.string(),
      period: z.string(),
      heroMetric: z.string(),
      growth: z.string().optional(),
      theme: z.enum(['business', 'tech', 'playful']).optional()
    })
  }
];