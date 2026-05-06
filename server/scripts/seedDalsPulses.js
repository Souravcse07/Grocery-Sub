const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  {
    name: "Toor Dal (Arhar)",
    category: "Dals & pulses",
    pricePerUnit: 160,
    unit: "1kg",
    images: ["/categories/toor_dal.png"],
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Moong Dal (Yellow/Green)",
    category: "Dals & pulses",
    pricePerUnit: 145,
    unit: "1kg",
    images: ["/categories/moong_dal.png"],
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Masoor Dal",
    category: "Dals & pulses",
    pricePerUnit: 110,
    unit: "1kg",
    images: ["/categories/masoor_dal.png"],
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Chana Dal",
    category: "Dals & pulses",
    pricePerUnit: 95,
    unit: "1kg",
    images: ["/categories/chana_dal.png"],
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Urad Dal",
    category: "Dals & pulses",
    pricePerUnit: 155,
    unit: "1kg",
    images: ["/categories/urad_dal.png"],
    inStock: true,
    sustainabilityScore: 81
  },
  {
    name: "Rajma (Kidney Beans)",
    category: "Dals & pulses",
    pricePerUnit: 180,
    unit: "1kg",
    images: ["/categories/rajma.png"],
    inStock: true,
    sustainabilityScore: 84
  },
  {
    name: "Kabuli Chana (Chickpeas)",
    category: "Dals & pulses",
    pricePerUnit: 165,
    unit: "1kg",
    images: ["/categories/kabuli_chana.png"],
    inStock: true,
    sustainabilityScore: 83
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    console.log("Connected to DB, inserting products...");
    
    for (const product of newProducts) {
      const existing = await Product.findOne({ name: product.name });
      if (!existing) {
        await Product.create(product);
        console.log(`Inserted: ${product.name}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }
    
    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
