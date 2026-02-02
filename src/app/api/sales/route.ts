import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Cache results for 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '2024-25';
    
    // Check cache first
    const cached = cache.get(period);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Parse period
    const yearMatch = period.match(/(\d{4})-?(\d{2,4})?/);
    if (!yearMatch) {
      return NextResponse.json({ error: 'Invalid period format' }, { status: 400 });
    }

    const startYear = parseInt(yearMatch[1]);
    const endYear = yearMatch[2] ? 
      (yearMatch[2].length === 2 ? 2000 + parseInt(yearMatch[2]) : parseInt(yearMatch[2])) 
      : startYear + 1;

    const startDate = new Date(startYear, 3, 1);
    const endDate = new Date(endYear, 2, 31);

    // Single optimized query
    const [totals, prevTotals, topCategory, regions] = await Promise.all([
      // Current period
      prisma.sale.aggregate({
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { revenue: true },
        _count: true
      }),
      
      // Previous period
      prisma.sale.aggregate({
        where: {
          date: {
            gte: new Date(startYear - 1, 3, 1),
            lte: new Date(endYear - 1, 2, 31)
          }
        },
        _sum: { revenue: true }
      }),
      
      // Top category
      prisma.sale.groupBy({
        by: ['productCategory'],
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { revenue: true },
        orderBy: { _sum: { revenue: 'desc' } },
        take: 1
      }),
      
      // Regions
      prisma.sale.groupBy({
        by: ['region'],
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { revenue: true },
        orderBy: { _sum: { revenue: 'desc' } },
        take: 1
      })
    ]);

    const currentRevenue = Number(totals._sum.revenue || 0);
    const previousRevenue = Number(prevTotals._sum.revenue || 0);
    const growth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : "0";

    const topRegion = regions[0];
    const topRegionPercentage = ((Number(topRegion?._sum.revenue || 0) / currentRevenue) * 100).toFixed(0);

    const result = {
      period,
      revenue: currentRevenue,
      revenueFormatted: `$${(currentRevenue / 1000000).toFixed(1)}M`,
      growth: parseFloat(growth),
      growthFormatted: `+${growth}%`,
      orders: totals._count,
      topCategory: topCategory[0]?.productCategory || 'N/A',
      topRegion: topRegion?.region || 'N/A',
      topRegionShare: `${topRegionPercentage}%`,
      insight: parseFloat(growth) > 30 
        ? `Record-breaking ${growth}% growth!`
        : parseFloat(growth) > 15
        ? `Massive ${growth}% revenue surge`
        : `Steady ${growth}% growth maintained`
    };

    // Cache result
    cache.set(period, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}
