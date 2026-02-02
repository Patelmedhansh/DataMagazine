import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const regions = ['North', 'South', 'East', 'West'];
const categories = ['Electronics', 'Clothing', 'Food', 'Home'];
const products = {
  Electronics: ['Laptop', 'Phone', 'Tablet', 'Headphones'],
  Clothing: ['Shirt', 'Pants', 'Shoes', 'Jacket'],
  Food: ['Snacks', 'Beverages', 'Frozen', 'Fresh'],
  Home: ['Furniture', 'Decor', 'Kitchen', 'Bedding']
};

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Seeding database...');

  // Generate 1200 realistic sales records
  const salesData = [];
  
  for (let i = 0; i < 1200; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const productName = products[category as keyof typeof products][Math.floor(Math.random() * products[category as keyof typeof products].length)];
    
    // Realistic patterns: 2022-2025 data
    const year = 2022 + Math.floor(i / 300);
    const month = Math.floor(Math.random() * 12);
    
    // Q4 spike for Electronics (holiday season)
    const isQ4 = month >= 9;
    const isElectronics = category === 'Electronics';
    const baseRevenue = isElectronics && isQ4 ? 3000 : 1500;
    
    // North region dominates (52% market share)
    const regionMultiplier = region === 'North' ? 1.5 : 1.0;
    
    const quantity = Math.floor(Math.random() * 50) + 1;
    const revenue = (baseRevenue + Math.random() * 1000) * regionMultiplier;
    const cost = revenue * 0.6; // 40% margin
    
    salesData.push({
      date: new Date(year, month, Math.floor(Math.random() * 28) + 1),
      region,
      productCategory: category,
      productName,
      quantity,
      revenue,
      cost
    });
  }

  // Insert in batches
  await prisma.sale.createMany({
    data: salesData,
  });

  console.log('✅ Seeded 1200 sales records!');
  
  // Verify and show sample
  const count = await prisma.sale.count();
  console.log(`📊 Total records in database: ${count}`);
  
  // Show FY 2024-25 summary
  const fy2024Sales = await prisma.sale.aggregate({
    where: {
      date: {
        gte: new Date(2024, 3, 1), // April 1, 2024
        lte: new Date(2025, 2, 31), // March 31, 2025
      }
    },
    _sum: {
      revenue: true,
    },
    _count: true,
  });
  
  console.log('\n📈 FY 2024-25 Preview:');
  console.log(`   Revenue: $${fy2024Sales._sum.revenue?.toFixed(2)}`);
  console.log(`   Orders: ${fy2024Sales._count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
