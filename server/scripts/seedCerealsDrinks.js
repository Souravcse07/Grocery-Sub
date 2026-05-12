const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  // Cereals & Breakfast
  {
    name: "Cornflakes",
    category: "Cereals & breakfast",
    pricePerUnit: 150,
    unit: "500g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Muesli",
    category: "Cereals & breakfast",
    pricePerUnit: 250,
    unit: "500g",
    images: ["/categories/oats.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Oats (Breakfast)",
    category: "Cereals & breakfast",
    pricePerUnit: 180,
    unit: "1kg",
    images: ["/categories/oats.png"], // Reuse generated oats image
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Chocos / Flavored Cereals",
    category: "Cereals & breakfast",
    pricePerUnit: 160,
    unit: "500g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
  },
  {
    name: "Instant Porridge",
    category: "Cereals & breakfast",
    pricePerUnit: 120,
    unit: "400g",
    images: ["/categories/oats.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Breakfast Bars",
    category: "Cereals & breakfast",
    pricePerUnit: 200,
    unit: "Box of 6",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 78
  },

  // Tea, Coffee & Drink Mixes
  {
    name: "Tea Powder / Tea Bags",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 250,
    unit: "500g",
    images: ["/tea.png"], // Existing match
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Coffee (Instant/Ground)",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 350,
    unit: "200g",
    images: ["/tea.png"], // Fallback
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Green Tea",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 300,
    unit: "Box of 25",
    images: ["/tea.png"], // Fallback
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Health Drink Powders (Boost, Horlicks)",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 400,
    unit: "500g",
    images: ["/milk.png"], // Fallback
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Milkshake Mixes",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 280,
    unit: "500g",
    images: ["/milk.png"], // Fallback
    inStock: true,
    sustainabilityScore: 70
  },
  {
    name: "Protein Powders",
    category: "Tea, coffee & drink mixes",
    pricePerUnit: 1200,
    unit: "1kg",
    images: ["/yogurt.png"], // Fallback
    inStock: true,
    sustainabilityScore: 80
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
