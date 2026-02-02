/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at [https://tambo.co/docs](https://tambo.co/docs)
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { MagazineCover } from "@/components/magazine/MagazineCover";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { FeatureArticle } from "@/components/magazine/FeatureArticle";
import { MagazineChart } from "@/components/magazine/MagazineChart";



/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  // SALES DATA TOOL - Calls API route (not Prisma directly)
  {
    name: "querySalesData",
    description: "Fetch sales data for a specific period (year, quarter, or month). Returns revenue, growth %, top products, and regional breakdown.",
    tool: async ({ period }: { period: string }) => {
      // Call API route instead of using Prisma directly
      const response = await fetch(`/api/sales?period=${encodeURIComponent(period)}`);
      
      if (!response.ok) {
        return { error: "Failed to fetch sales data" };
      }
      
      return await response.json();
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
  },   // ADD AFTER querySalesData tool  
  {
    name: "getChartData",
    description: "Get formatted chart data for regional breakdown, category analysis, or growth trends",
    tool: async ({ period, chartType }: { period: string; chartType: 'regional' | 'category' | 'growth' }) => {
      const response = await fetch(`/api/sales?period=${encodeURIComponent(period)}`);
      
      if (!response.ok) {
        return { error: "Failed to fetch data" };
      }
      
      const salesData = await response.json();
      
      // Format data based on chart type
      if (chartType === 'regional') {
        // Mock regional data (you can enhance API to return this)
        return [
          { name: 'North', value: Math.round(salesData.revenue * 0.33) },
          { name: 'South', value: Math.round(salesData.revenue * 0.25) },
          { name: 'East', value: Math.round(salesData.revenue * 0.24) },
          { name: 'West', value: Math.round(salesData.revenue * 0.18) }
        ];
      }
      
      if (chartType === 'category') {
        return [
          { name: 'Electronics', value: Math.round(salesData.revenue * 0.52) },
          { name: 'Clothing', value: Math.round(salesData.revenue * 0.22) },
          { name: 'Food', value: Math.round(salesData.revenue * 0.15) },
          { name: 'Home', value: Math.round(salesData.revenue * 0.11) }
        ];
      }
      
      if (chartType === 'growth') {
        const year = parseInt(period.match(/(\d{4})/)?.[1] || '2024');
        return [
          { name: `${year-2}`, value: Math.round(salesData.revenue * 0.4) },
          { name: `${year-1}`, value: Math.round(salesData.revenue * 0.7) },
          { name: `${year}`, value: salesData.revenue }
        ];
      }
      
      return [];
    },
    inputSchema: z.object({
      period: z.string().describe("Period like '2024-25'"),
      chartType: z.enum(['regional', 'category', 'growth']).describe("Type of chart data needed")
    }),
    outputSchema: z.array(z.object({
      name: z.string(),
      value: z.number()
    }))
  },

  {
    name: "generateStory",
    description: "Generate compelling magazine article content from sales data insights",
    tool: async ({ data, angle }: { data: any; angle?: string }) => {
      // This is where AI will generate the story
      // For now, we'll create a template-based story
      const growth = data.growth || 0;
      const revenue = data.revenueFormatted || data.revenue;
      const topCategory = data.topCategory || 'Products';
      const topRegion = data.topRegion || 'North';
      const period = data.period || 'this period';
      
      let storyAngle = angle || (growth > 25 ? 'explosive-growth' : 'steady-performance');
      
      const stories = {
        'explosive-growth': `The fiscal year ${period} will be remembered as a watershed moment in our company's history. Revenue surged to an impressive ${revenue}, representing a remarkable ${growth}% increase from the previous year. This extraordinary growth wasn't accidental—it was the result of strategic planning, market insight, and flawless execution. The ${topCategory} category emerged as our strongest performer, demonstrating the power of focused product strategy. Our ${topRegion} region continued its impressive performance, accounting for a significant portion of total sales. The team's ability to identify emerging trends and respond with agility set us apart from competitors. This success creates a strong foundation for future growth and validates our strategic direction.`,
        
        'regional-dominance': `The ${topRegion} region's performance in ${period} redefined what's possible in regional sales execution. With ${revenue} in total revenue and ${growth}% growth, the region demonstrated exceptional market penetration and customer engagement. ${topCategory} products led the charge, capturing significant market share through strategic positioning and competitive pricing. The success wasn't limited to a single product line—consistent performance across categories showed the strength of our regional strategy. Customer feedback revealed high satisfaction with both product quality and service delivery. Looking ahead, the ${topRegion} playbook will serve as a model for other regions seeking similar success.`,
        
        'category-leadership': `${topCategory} emerged as the undisputed category leader in ${period}, driving ${revenue} in revenue and contributing significantly to our ${growth}% overall growth. Market dynamics shifted in our favor as consumer preferences aligned perfectly with our product lineup. Strategic pricing adjustments, inventory optimization, and targeted marketing campaigns created a perfect storm of sales success. The ${topRegion} region led category adoption, but strong performance across all regions indicated broad market appeal. Customer data revealed high repeat purchase rates and strong brand loyalty. This category's success provides valuable insights for product development and market expansion strategies.`
      };
      
      return {
        content: stories[storyAngle as keyof typeof stories] || stories['explosive-growth'],
        suggestedTitle: growth > 30 
          ? "The Year That Changed Everything"
          : growth > 20
          ? `${topRegion} Region Achieves Breakthrough Performance`
          : `Steady Growth Drives ${period} Success`,
        suggestedSubtitle: `How strategic decisions led to ${growth}% growth in ${period}`
      };
    },
    inputSchema: z.object({
      data: z.any().describe("Sales data object from querySalesData"),
      angle: z.enum(['explosive-growth', 'regional-dominance', 'category-leadership']).optional()
    }),
    outputSchema: z.object({
      content: z.string(),
      suggestedTitle: z.string(),
      suggestedSubtitle: z.string()
    })
  }

];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // MAGAZINE COVER COMPONENT
  {
    name: "MagazineCover",
    description: `
      Create EXPLOSIVE magazine covers from sales data!
      
      HEADLINE RULES:
      - Growth > 30%: "RECORD BREAKING!", "EXPLOSION!", "DOMINATION!"
      - Growth 15-30%: "MASSIVE GROWTH!", "SURGE!", "ROCKET!"
      - Growth < 15%: "SOLID PERFORMANCE!", "STEADY GROWTH!"
      
      Always use ALL CAPS for titles and include specific percentages!
      
      Examples:
      - "FY 2024-25: REVENUE EXPLOSION!"
      - "Q4 2024: 35% GROWTH SHATTERS RECORDS!"
    `,
    component: MagazineCover,
    propsSchema: z.object({
      title: z.string().describe("DRAMATIC headline in ALL CAPS"),
      tagline: z.string().describe("Subheadline with specific data insights"),
      period: z.string().describe("Period like 'FY 2024-25'"),
      heroMetric: z.string().describe("Big number like '$2.4M'"),
      growth: z.string().optional().describe("Growth like '+35%'"),
      theme: z.enum(['business', 'tech', 'playful']).optional().default('business')
    })
  }   // ADD AFTER MagazineCover component
   ,{
    name: "FeatureArticle",
    description: `
      Create magazine-style feature articles with 2-column layout.
      
      CONTENT RULES:
      - Write 150-200 words of engaging narrative
      - Include specific data insights and numbers
      - Professional journalism tone
      - Connect data to real business insights
      
      TITLE RULES:
      - Compelling, newsworthy headlines
      - Capture the main story angle
      - Use active voice
      
      Examples:
      - "The Year That Changed Everything"
      - "How North Region Achieved Domination"
      - "Electronics Revolution: The Q4 Story"
    `,
    component: FeatureArticle,
    propsSchema: z.object({
      title: z.string().describe("Compelling article headline"),
      subtitle: z.string().optional().describe("Supporting subheadline"),
      content: z.string().describe("150-200 word article body with data insights"),
      author: z.string().optional().describe("Author name"),
      date: z.string().optional().describe("Publication date"),
      theme: z.enum(['business', 'tech', 'playful']).optional().default('business')
    })
  },   // ADD AFTER FeatureArticle
    {
    name: "MagazineChart",
    description: `
      Create beautiful data visualizations for magazines.
      
      IMPORTANT: Use getChartData tool FIRST to get properly formatted chart data!
      
      CHART TYPES:
      - bar: Regional or category comparison
      - pie: Market share distribution  
      - line: Growth trends over time
      
      Always call getChartData with the right chartType before rendering!
    `,
    component: MagazineChart,
    propsSchema: z.object({
      title: z.string().describe("Chart title"),
      subtitle: z.string().optional().describe("Chart subtitle"),
      data: z.array(z.object({
        name: z.string(),
        value: z.number()
      })).describe("Chart data from getChartData tool"),
      type: z.enum(['bar', 'line', 'pie']).describe("Chart type"),
      dataKey: z.string().optional().default('value'),
      xAxisKey: z.string().optional().default('name'),
      theme: z.enum(['business', 'tech', 'playful']).optional().default('business')
    })
  }


];
