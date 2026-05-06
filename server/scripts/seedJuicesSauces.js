const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  // Juices & Cold Drinks
  {
    name: "Packaged Fruit Juices",
    category: "Juices & cold drinks",
    pricePerUnit: 120,
    unit: "1L",
    images: ["/mixed_juice.png"],
    inStock: true,
    sustainabilityScore: 70
  },
  {
    name: "Soft Drinks (Cola, Soda)",
    category: "Juices & cold drinks",
    pricePerUnit: 40,
    unit: "600ml",
    images: ["/juice.png"],
    inStock: true,
    sustainabilityScore: 65
  },
  {
    name: "Flavored Water",
    category: "Juices & cold drinks",
    pricePerUnit: 50,
    unit: "500ml",
    images: ["/juice.png"],
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Energy Drinks",
    category: "Juices & cold drinks",
    pricePerUnit: 110,
    unit: "250ml",
    images: ["/juice.png"],
    inStock: true,
    sustainabilityScore: 68
  },
  {
    name: "Coconut Water (Packaged)",
    category: "Juices & cold drinks",
    pricePerUnit: 60,
    unit: "200ml",
    images: ["/juice.png"],
    inStock: true,
    sustainabilityScore: 85
  },

  // Sauces & Spreads
  {
    name: "Tomato Ketchup",
    category: "Sauces & spreads",
    pricePerUnit: 150,
    unit: "1kg",
    images: ["/tomato.png"],
    inStock: true,
    sustainabilityScore: 78
  },
  {
    name: "Mayonnaise",
    category: "Sauces & spreads",
    pricePerUnit: 120,
    unit: "250g",
    images: ["/butter.png"],
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Soy Sauce",
    category: "Sauces & spreads",
    pricePerUnit: 80,
    unit: "200ml",
    images: ["/oil.png"],
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Chili Sauce",
    category: "Sauces & spreads",
    pricePerUnit: 90,
    unit: "200g",
    images: ["/tomato.png"],
    inStock: true,
    sustainabilityScore: 79
  },
  {
    name: "Peanut Butter",
    category: "Sauces & spreads",
    pricePerUnit: 250,
    unit: "500g",
    images: ["/butter.png"],
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Jam",
    category: "Sauces & spreads",
    pricePerUnit: 180,
    unit: "500g",
    images: ["/apple.png"],
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Honey",
    category: "Sauces & spreads",
    pricePerUnit: 350,
    unit: "500g",
    images: ["/butter.png"],
    inStock: true,
    sustainabilityScore: 95
  },
  {
    name: "Butter",
    category: "Sauces & spreads",
    pricePerUnit: 280,
    unit: "500g",
    images: ["/butter.png"],
    inStock: true,
    sustainabilityScore: 85
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
