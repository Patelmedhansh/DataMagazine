import { MagazineCover } from '@/components/magazine/MagazineCover';
import { FeatureArticle } from '@/components/magazine/FeatureArticle';
import { MagazineChart } from '@/components/magazine/MagazineChart';

export default function TestPage() {
  // Sample chart data
  const regionalData = [
    { name: 'North', value: 847000 },
    { name: 'South', value: 423000 },
    { name: 'East', value: 512000 },
    { name: 'West', value: 318000 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 1240000 },
    { name: 'Clothing', value: 520000 },
    { name: 'Food', value: 180000 },
    { name: 'Home', value: 460000 }
  ];

  const growthData = [
    { name: '2022', value: 800000 },
    { name: '2023', value: 1200000 },
    { name: '2024', value: 1850000 },
    { name: '2025', value: 2400000 }
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>
        Complete Magazine - FY 2024-25
      </h2>

      {/* Magazine Cover */}
      <MagazineCover
        title="FY 2024-25: REVENUE EXPLOSION!"
        tagline="Record-breaking 35% growth shatters all previous benchmarks"
        period="2024-25"
        heroMetric="$2.4M"
        growth="+35%"
        theme="business"
      />

      <div style={{ height: '60px' }} />

      {/* Feature Article */}
      <FeatureArticle
        title="The Year That Changed Everything"
        subtitle="How strategic decisions led to unprecedented growth in FY 2024-25"
        content="The fiscal year 2024-25 will be remembered as a watershed moment in our company's history. Revenue surged to an impressive $2.4 million, representing a staggering 35% increase from the previous year. This remarkable growth wasn't accidental—it was the result of strategic planning, market insight, and flawless execution. The Electronics category emerged as our strongest performer, capturing 52% of total revenue. Laptops, in particular, dominated Q4 sales as holiday shoppers sought premium devices. Our North region continued its impressive performance, accounting for over half of all sales. The team's ability to identify emerging trends and respond with agility set us apart from competitors. Looking ahead, these insights will guide our strategy as we aim to maintain this momentum and explore new growth opportunities in untapped markets."
        author="DataZine Analytics Team"
        date="March 2025"
        theme="business"
      />

      <div style={{ height: '60px' }} />

      {/* Regional Bar Chart */}
      <MagazineChart
        title="Regional Performance Breakdown"
        subtitle="Revenue distribution across regions in FY 2024-25"
        data={regionalData}
        type="bar"
        theme="business"
      />

      <div style={{ height: '60px' }} />

      {/* Category Pie Chart */}
      <MagazineChart
        title="Category Revenue Share"
        subtitle="Electronics leads with dominant market position"
        data={categoryData}
        type="pie"
        theme="business"
      />

      <div style={{ height: '60px' }} />

      {/* Growth Line Chart */}
      <MagazineChart
        title="Year-over-Year Growth Trajectory"
        subtitle="Consistent upward trend demonstrates strong momentum"
        data={growthData}
        type="line"
        dataKey="value"
        xAxisKey="name"
        theme="business"
      />

      <div style={{ height: '60px' }} />

      {/* Tech Theme Article */}
      <FeatureArticle
        title="Tech Domination: The Q4 Story"
        subtitle="Breaking down the electronics revolution"
        content="Quarter four of 2024 marked a technological revolution in our sales performance. Electronics didn't just lead—they dominated, capturing an unprecedented market share that redefined our business trajectory. The surge was driven by strategic pricing, perfect timing with holiday shopping patterns, and a product lineup that resonated with tech-savvy consumers. Our data reveals fascinating patterns: laptop sales peaked during Black Friday week, tablet purchases spiked as gift-giving season approached, and accessories maintained steady momentum throughout the quarter. The North region's performance was particularly noteworthy, with urban centers driving significant volume. This success story offers valuable lessons for future quarters and demonstrates the power of data-driven decision making in competitive markets."
        author="Tech Analytics Division"
        date="January 2025"
        theme="tech"
      />
    </div>
  );
}
