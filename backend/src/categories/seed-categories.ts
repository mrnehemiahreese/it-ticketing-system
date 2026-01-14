// Seed script for initial ticket categories
// Run with: npx ts-node src/categories/seed-categories.ts

import { DataSource } from 'typeorm';
import { TicketCategory } from './entities/ticket-category.entity';

const categories = [
  {
    name: 'Hardware',
    description: 'Hardware and equipment issues',
    icon: 'mdi-desktop-classic',
    color: '#1976D2',
    sortOrder: 1,
    children: [
      { name: 'Printer', icon: 'mdi-printer', sortOrder: 1 },
      { name: 'Scanner', icon: 'mdi-scanner', sortOrder: 2 },
      { name: 'Network', icon: 'mdi-lan', sortOrder: 3 },
      { name: 'USB/External Drive', icon: 'mdi-usb-flash-drive', sortOrder: 4 },
      { name: 'Password Reset', icon: 'mdi-lock-reset', sortOrder: 5 },
      { name: 'Email', icon: 'mdi-email', sortOrder: 6 },
      { name: 'Antivirus', icon: 'mdi-shield-check', sortOrder: 7 },
      { name: 'Backups', icon: 'mdi-backup-restore', sortOrder: 8 },
      { name: 'Other', icon: 'mdi-dots-horizontal', sortOrder: 99 },
    ],
  },
  {
    name: 'Tax',
    description: 'Tax-related inquiries and issues',
    icon: 'mdi-file-document',
    color: '#388E3C',
    sortOrder: 2,
    children: [
      { name: 'Tax Inquiry', icon: 'mdi-help-circle', sortOrder: 1 },
      { name: 'Payments', icon: 'mdi-cash', sortOrder: 2 },
      { name: 'Adjustments', icon: 'mdi-tune', sortOrder: 3 },
      { name: 'Mortgage Co', icon: 'mdi-home-city', sortOrder: 4 },
      { name: 'Special Tax Items', icon: 'mdi-star', sortOrder: 5 },
      { name: 'Delinquent Tax', icon: 'mdi-alert', sortOrder: 6 },
      { name: 'Other', icon: 'mdi-dots-horizontal', sortOrder: 99 },
    ],
  },
  {
    name: 'Bookkeeping',
    description: 'Bookkeeping and accounting issues',
    icon: 'mdi-book-open-variant',
    color: '#7B1FA2',
    sortOrder: 3,
    children: [
      { name: 'General Ledger', icon: 'mdi-book-account', sortOrder: 1 },
      { name: 'Misc Receipts', icon: 'mdi-receipt', sortOrder: 2 },
      { name: 'Mortgage Tax', icon: 'mdi-home-percent', sortOrder: 3 },
      { name: 'Official Depository', icon: 'mdi-bank', sortOrder: 4 },
      { name: 'Warrants', icon: 'mdi-file-certificate', sortOrder: 5 },
      { name: 'Other', icon: 'mdi-dots-horizontal', sortOrder: 99 },
    ],
  },
  {
    name: 'End of Month',
    description: 'End of month processing',
    icon: 'mdi-calendar-end',
    color: '#F57C00',
    sortOrder: 4,
    children: [
      { name: 'Apportionment', icon: 'mdi-chart-pie', sortOrder: 1 },
      { name: 'Posting Period', icon: 'mdi-calendar-check', sortOrder: 2 },
      { name: 'Balancing', icon: 'mdi-scale-balance', sortOrder: 3 },
      { name: 'SA&I', icon: 'mdi-file-chart', sortOrder: 4 },
      { name: 'Fiscal Year', icon: 'mdi-calendar-star', sortOrder: 5 },
    ],
  },
  {
    name: 'Forte / RenewGov',
    description: 'Payment processing systems',
    icon: 'mdi-credit-card',
    color: '#00897B',
    sortOrder: 5,
    children: [
      { name: 'Credit Cards', icon: 'mdi-credit-card-outline', sortOrder: 1 },
      { name: 'Online Payments', icon: 'mdi-web', sortOrder: 2 },
      { name: 'In-Office Payments', icon: 'mdi-store', sortOrder: 3 },
      { name: 'Other', icon: 'mdi-dots-horizontal', sortOrder: 99 },
    ],
  },
  {
    name: 'Bug Report',
    description: 'Software bug reports',
    icon: 'mdi-bug',
    color: '#D32F2F',
    sortOrder: 6,
    children: [],
  },
  {
    name: 'Billing Question',
    description: 'Billing and invoice questions',
    icon: 'mdi-receipt-text',
    color: '#5D4037',
    sortOrder: 7,
    children: [],
  },
];

async function seedCategories() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ticketing_system',
    entities: [TicketCategory],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const categoryRepo = dataSource.getRepository(TicketCategory);

  // Check if categories already exist
  const existingCount = await categoryRepo.count();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing categories. Skipping seed.`);
    await dataSource.destroy();
    return;
  }

  console.log('Seeding categories...');

  for (const cat of categories) {
    // Create parent category
    const parent = categoryRepo.create({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      sortOrder: cat.sortOrder,
      isActive: true,
    });
    const savedParent = await categoryRepo.save(parent);
    console.log(`Created parent category: ${savedParent.name}`);

    // Create child categories
    for (const child of cat.children) {
      const childCat = categoryRepo.create({
        name: child.name,
        icon: child.icon,
        sortOrder: child.sortOrder,
        parentId: savedParent.id,
        color: cat.color,
        isActive: true,
      });
      await categoryRepo.save(childCat);
      console.log(`  Created sub-category: ${child.name}`);
    }
  }

  console.log('Done seeding categories!');
  await dataSource.destroy();
}

seedCategories().catch(console.error);
