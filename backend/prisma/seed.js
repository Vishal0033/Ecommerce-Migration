import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RetailMax Database Seeding...');

  // Check if database is already seeded
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@retailmax.com' },
  });

  if (existingAdmin) {
    console.log('🌱 Database is already initialized. Skipping seed.');
    return;
  }

  // 1. Clean existing records if any
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'RetailMax Admin',
      email: 'admin@retailmax.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@retailmax.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log(`👤 Users seeded:`);
  console.log(`   - Admin: admin@retailmax.com (password: Admin@123)`);
  console.log(`   - Customer: user@retailmax.com (password: User@123)`);

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Cutting-edge gadgets, audio gear, and personal computing.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Apparel & Fashion',
      slug: 'apparel',
      description: 'Premium modern wear designed for style, comfort, and everyday durability.',
      imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Ergonomic performance sneakers and artisanal casual shoes.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Minimalist decor, smart ambient lighting, and workspace essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Smart watches, premium leather wallets, and travel gear.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`📁 ${Object.keys(categories).length} Categories seeded.`);

  // 4. Seed Products
  const productsData = [
    {
      name: 'Aura Studio Wireless Noise-Cancelling Headphones',
      slug: 'aura-studio-wireless-headphones',
      description: 'Engineered with 40mm beryllium drivers, 35-hour battery life, and adaptive active noise cancellation for pristine studio acoustic clarity.',
      price: 299.99,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['electronics'].id,
    },
    {
      name: 'Apex Pro Mechanical Gaming Keyboard',
      slug: 'apex-pro-mechanical-keyboard',
      description: 'Hot-swappable custom linear switches, aircraft-grade anodized aluminum frame, RGB backlighting, and magnetic wrist rest.',
      price: 149.50,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['electronics'].id,
    },
    {
      name: 'UltraWide Curved 34-Inch Display 144Hz',
      slug: 'ultrawide-curved-34-inch-display',
      description: 'IPS 3440x1440 WQHD panel with 99% sRGB color accuracy, 1ms response time, USB-C 90W power delivery hub, and HDR 400 support.',
      price: 649.00,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['electronics'].id,
    },
    {
      name: 'Horizon Minimalist Smart Watch Series 5',
      slug: 'horizon-smart-watch-series-5',
      description: 'Always-on AMOLED sapphire crystal display, ECG monitoring, heart-rate variability, multi-band GPS, and 14-day battery endurance.',
      price: 249.00,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['accessories'].id,
    },
    {
      name: 'Urban Technical Waterproof Rain Jacket',
      slug: 'urban-technical-waterproof-jacket',
      description: 'Breathable 3-layer GORE-TEX membrane, seam-sealed waterproof construction, YKK AquaGuard zippers, and packable hood design.',
      price: 189.00,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      featured: false,
      categoryId: categories['apparel'].id,
    },
    {
      name: 'Merino Wool Heavyweight Knit Crewneck',
      slug: 'merino-wool-heavyweight-crewneck',
      description: 'Spun from 100% extra-fine Australian Merino wool. Temperature-regulating, odor-resistant, and pill-resistant for years of luxury wear.',
      price: 125.00,
      stock: 55,
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
      featured: false,
      categoryId: categories['apparel'].id,
    },
    {
      name: 'Veloce Kinetic Carbon Running Shoes',
      slug: 'veloce-kinetic-carbon-running-shoes',
      description: 'Engineered carbon fiber propulsion plate with responsive supercritical nitrogen foam midsole for explosive energy return.',
      price: 179.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['footwear'].id,
    },
    {
      name: 'Classic White Court Leather Sneakers',
      slug: 'classic-white-court-leather-sneakers',
      description: 'Full-grain Italian calfskin leather upper, stitched Margom rubber cupsole, and antimicrobial cushioned cork insole.',
      price: 139.00,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      featured: false,
      categoryId: categories['footwear'].id,
    },
    {
      name: 'Nordic Ceramic Drip Coffee Carafe Set',
      slug: 'nordic-ceramic-drip-coffee-carafe',
      description: 'Hand-thrown matte stone ceramic dripper with dual-wall borosilicate glass carafe and precision stainless steel reusable mesh filter.',
      price: 68.00,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      featured: false,
      categoryId: categories['home-living'].id,
    },
    {
      name: 'Sculptural Minimalist Walnut Desk Lamp',
      slug: 'sculptural-walnut-desk-lamp',
      description: 'Crafted from solid American black walnut with integrated touch dimmer, 3000K warm LED light bar, and weighted brass base.',
      price: 110.00,
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['home-living'].id,
    },
    {
      name: 'Full-Grain Vegetable Tanned Leather Messenger Bag',
      slug: 'full-grain-leather-messenger-bag',
      description: 'Handcrafted with 2.2mm thick vegetable-tanned bridle leather, brass hardware, padded 16-inch laptop compartment, and lifetime warranty.',
      price: 260.00,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      featured: true,
      categoryId: categories['accessories'].id,
    },
    {
      name: 'Matte Black Stainless Steel Thermal Bottle 750ml',
      slug: 'matte-black-thermal-bottle',
      description: 'Double-wall vacuum insulation keeps liquids cold for 24 hours or steaming hot for 12 hours. Sweat-proof powder coat finish.',
      price: 34.00,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      featured: false,
      categoryId: categories['accessories'].id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }
  console.log(`📦 ${productsData.length} Products seeded successfully.`);

  // 5. Seed an initial sample order for the customer
  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'aura-studio-wireless-headphones' },
  });

  if (sampleProduct) {
    await prisma.order.create({
      data: {
        orderNumber: 'RMX-982104-5120',
        userId: customerUser.id,
        totalAmount: sampleProduct.price,
        shippingAddress: '42 Innovation Parkway, Tech District, San Francisco, CA 94105',
        status: 'DELIVERED',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        items: {
          create: [
            {
              productId: sampleProduct.id,
              quantity: 1,
              price: sampleProduct.price,
            },
          ],
        },
      },
    });
    console.log(`🛍️ Initial sample order seeded for John Doe.`);
  }

  console.log('✅ RetailMax Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

