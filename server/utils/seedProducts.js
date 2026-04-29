const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const sampleProducts = [
  { name: 'Fresh Tomato', category: 'Vegetables', pricePerUnit: 40, unit: 'kg', season: 'Summer', inStock: true, sustainabilityScore: 82, vendorInfo: { vendorName: 'Green Valley Farms', source: 'local' } },
  { name: 'Organic Potato', category: 'Vegetables', pricePerUnit: 30, unit: 'kg', season: 'Winter', inStock: true, sustainabilityScore: 77, vendorInfo: { vendorName: 'Hilltop Agro', source: 'regional' } },
  { name: 'Baby Spinach', category: 'Vegetables', pricePerUnit: 55, unit: 'bundle', season: 'Monsoon', inStock: true, sustainabilityScore: 88, vendorInfo: { vendorName: 'Leaf & Root', source: 'local' } },
  { name: 'Crisp Carrot', category: 'Vegetables', pricePerUnit: 45, unit: 'kg', season: 'Winter', inStock: true, sustainabilityScore: 80, vendorInfo: { vendorName: 'Nandi Produce', source: 'regional' } },

  { name: 'Alphonso Mango', category: 'Fruits', pricePerUnit: 180, unit: 'kg', season: 'Summer', inStock: true, sustainabilityScore: 75, vendorInfo: { vendorName: 'Coastal Orchards', source: 'regional' } },
  { name: 'Red Banana', category: 'Fruits', pricePerUnit: 70, unit: 'dozen', season: 'All Season', inStock: true, sustainabilityScore: 83, vendorInfo: { vendorName: 'Riverbank Farms', source: 'local' } },
  { name: 'Washington Apple', category: 'Fruits', pricePerUnit: 220, unit: 'kg', season: 'Autumn', inStock: true, sustainabilityScore: 68, vendorInfo: { vendorName: 'North Star Imports', source: 'imported' } },
  { name: 'Sweet Papaya', category: 'Fruits', pricePerUnit: 60, unit: 'piece', season: 'All Season', inStock: true, sustainabilityScore: 86, vendorInfo: { vendorName: 'Tropic Harvest', source: 'regional' } },

  { name: 'A2 Cow Milk', category: 'Dairy', pricePerUnit: 68, unit: 'liter', season: 'All Season', inStock: true, sustainabilityScore: 79, vendorInfo: { vendorName: 'Pure Meadow Dairy', source: 'local' } },
  { name: 'Farm Fresh Paneer', category: 'Dairy', pricePerUnit: 95, unit: '200g', season: 'All Season', inStock: true, sustainabilityScore: 74, vendorInfo: { vendorName: 'Morning Milk Co.', source: 'local' } },
  { name: 'Greek Yogurt', category: 'Dairy', pricePerUnit: 120, unit: '400g', season: 'All Season', inStock: true, sustainabilityScore: 71, vendorInfo: { vendorName: 'Cultured Foods', source: 'regional' } },
  { name: 'Salted Butter', category: 'Dairy', pricePerUnit: 110, unit: '500g', season: 'All Season', inStock: true, sustainabilityScore: 69, vendorInfo: { vendorName: 'Creamline', source: 'regional' } },

  { name: 'Brown Bread Loaf', category: 'Bakery', pricePerUnit: 45, unit: 'loaf', season: 'All Season', inStock: true, sustainabilityScore: 66, vendorInfo: { vendorName: 'Urban Oven', source: 'local' } },
  { name: 'Whole Wheat Bun', category: 'Bakery', pricePerUnit: 35, unit: 'pack', season: 'All Season', inStock: true, sustainabilityScore: 70, vendorInfo: { vendorName: 'Bake & Bite', source: 'local' } },
  { name: 'Multigrain Cookies', category: 'Bakery', pricePerUnit: 85, unit: 'box', season: 'All Season', inStock: true, sustainabilityScore: 73, vendorInfo: { vendorName: 'Crumb House', source: 'regional' } },
  { name: 'Ragi Muffin', category: 'Bakery', pricePerUnit: 65, unit: 'pack', season: 'All Season', inStock: true, sustainabilityScore: 78, vendorInfo: { vendorName: 'Healthy Bakes', source: 'local' } },

  { name: 'Cold Pressed Sunflower Oil', category: 'Pantry', pricePerUnit: 230, unit: 'liter', season: 'All Season', inStock: true, sustainabilityScore: 64, vendorInfo: { vendorName: 'Golden Seeds', source: 'regional' } },
  { name: 'Basmati Rice', category: 'Pantry', pricePerUnit: 120, unit: 'kg', season: 'All Season', inStock: true, sustainabilityScore: 72, vendorInfo: { vendorName: 'Harvest Grains', source: 'regional' } },
  { name: 'Toor Dal', category: 'Pantry', pricePerUnit: 150, unit: 'kg', season: 'All Season', inStock: true, sustainabilityScore: 76, vendorInfo: { vendorName: 'Pulse Point', source: 'regional' } },
  { name: 'Rock Salt', category: 'Pantry', pricePerUnit: 55, unit: 'kg', season: 'All Season', inStock: true, sustainabilityScore: 67, vendorInfo: { vendorName: 'Mineral Foods', source: 'regional' } }
];

const seedProducts = async () => {
  try {
    await connectDB();

    const names = sampleProducts.map((product) => product.name);
    const existing = await Product.find({ name: { $in: names }, isDeleted: false }).select('name');
    const existingNames = new Set(existing.map((product) => product.name));

    const toInsert = sampleProducts.filter((product) => !existingNames.has(product.name));

    if (toInsert.length > 0) {
      await Product.insertMany(toInsert, { ordered: false });
    }

    const totalCount = await Product.countDocuments({ isDeleted: false });
    const categoryCounts = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`✅ Seed complete. Inserted ${toInsert.length} new products.`);
    console.log(`✅ Total active products in DB: ${totalCount}`);
    console.log('✅ Category split:', categoryCounts);
  } catch (error) {
    console.error(`❌ Product seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedProducts();
