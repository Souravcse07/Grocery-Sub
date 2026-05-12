const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  // Chocolates & Sweets
  {
    name: "Chocolate Bars",
    category: "Chocolates & sweets",
    pricePerUnit: 80,
    unit: "100g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
  },
  {
    name: "Candy",
    category: "Chocolates & sweets",
    pricePerUnit: 50,
    unit: "Pack of 1",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 65
  },
  {
    name: "Toffees",
    category: "Chocolates & sweets",
    pricePerUnit: 60,
    unit: "Pack of 1",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 65
  },
  {
    name: "Indian Sweets (Ladoo, Barfi)",
    category: "Chocolates & sweets",
    pricePerUnit: 350,
    unit: "500g",
    images: ["/bun.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Cakes & Muffins",
    category: "Chocolates & sweets",
    pricePerUnit: 120,
    unit: "Pack of 6",
    images: ["/muffin.png"], // Existing match
    inStock: true,
    sustainabilityScore: 75
  },

  // Indian Snacks
  {
    name: "Mixture",
    category: "Indian snacks",
    pricePerUnit: 90,
    unit: "250g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 72
  },
  {
    name: "Bhujia",
    category: "Indian snacks",
    pricePerUnit: 85,
    unit: "250g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
  },
  {
    name: "Murukku",
    category: "Indian snacks",
    pricePerUnit: 110,
    unit: "250g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 78
  },
  {
    name: "Chakli",
    category: "Indian snacks",
    pricePerUnit: 100,
    unit: "250g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Samosa (Ready-to-eat/Frozen)",
    category: "Indian snacks",
    pricePerUnit: 150,
    unit: "Pack of 5",
    images: ["/bun.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 68
  },
  {
    name: "Papad",
    category: "Indian snacks",
    pricePerUnit: 60,
    unit: "100g",
    images: ["/bread.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 82
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
