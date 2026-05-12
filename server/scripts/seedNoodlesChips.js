const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  // Noodles & Pasta
  {
    name: "Instant Noodles (Maggi, etc.)",
    category: "Noodles & pasta",
    pricePerUnit: 60,
    unit: "280g",
    images: ["/produce.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 60
  },
  {
    name: "Hakka Noodles",
    category: "Noodles & pasta",
    pricePerUnit: 55,
    unit: "150g",
    images: ["/produce.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 65
  },
  {
    name: "Pasta (Macaroni, Spaghetti)",
    category: "Noodles & pasta",
    pricePerUnit: 80,
    unit: "500g",
    images: ["/produce.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Vermicelli (Seviyan)",
    category: "Noodles & pasta",
    pricePerUnit: 45,
    unit: "200g",
    images: ["/produce.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
  },

  // Chips & Biscuits
  {
    name: "Potato Chips",
    category: "Chips & biscuits",
    pricePerUnit: 20,
    unit: "50g",
    images: ["/potato.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 50
  },
  {
    name: "Namkeen Mixtures",
    category: "Chips & biscuits",
    pricePerUnit: 120,
    unit: "400g",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 60
  },
  {
    name: "Cream Biscuits",
    category: "Chips & biscuits",
    pricePerUnit: 30,
    unit: "150g",
    images: ["/cookie.png"], // Existing match
    inStock: true,
    sustainabilityScore: 55
  },
  {
    name: "Marie Biscuits",
    category: "Chips & biscuits",
    pricePerUnit: 40,
    unit: "250g",
    images: ["/cookie.png"], // Existing match
    inStock: true,
    sustainabilityScore: 65
  },
  {
    name: "Crackers",
    category: "Chips & biscuits",
    pricePerUnit: 50,
    unit: "200g",
    images: ["/cookie.png"], // Existing match
    inStock: true,
    sustainabilityScore: 60
  },
  {
    name: "Rusks",
    category: "Chips & biscuits",
    pricePerUnit: 60,
    unit: "300g",
    images: ["/bread.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
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
