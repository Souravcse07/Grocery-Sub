const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  // Oil & Ghee
  {
    name: "Sunflower Oil",
    category: "Oil & ghee",
    pricePerUnit: 180,
    unit: "1L",
    images: ["/categories/sunflower_oil.png"],
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Groundnut Oil",
    category: "Oil & ghee",
    pricePerUnit: 220,
    unit: "1L",
    images: ["/categories/groundnut_oil.png"],
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Mustard Oil",
    category: "Oil & ghee",
    pricePerUnit: 160,
    unit: "1L",
    images: ["/categories/mustard_oil.png"],
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Coconut Oil",
    category: "Oil & ghee",
    pricePerUnit: 250,
    unit: "500ml",
    images: ["/oil.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 90
  },
  {
    name: "Olive Oil",
    category: "Oil & ghee",
    pricePerUnit: 800,
    unit: "500ml",
    images: ["/oil.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Desi Ghee",
    category: "Oil & ghee",
    pricePerUnit: 550,
    unit: "500ml",
    images: ["/butter.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 78
  },
  {
    name: "Vanaspati",
    category: "Oil & ghee",
    pricePerUnit: 120,
    unit: "1L",
    images: ["/butter.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 70
  },
  
  // Masala, Sugar & Spices
  {
    name: "Turmeric Powder",
    category: "Masala, sugar & spices",
    pricePerUnit: 65,
    unit: "200g",
    images: ["/rock_salt.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Red Chili Powder",
    category: "Masala, sugar & spices",
    pricePerUnit: 80,
    unit: "200g",
    images: ["/rock_salt.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Coriander Powder",
    category: "Masala, sugar & spices",
    pricePerUnit: 70,
    unit: "200g",
    images: ["/rock_salt.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Garam Masala",
    category: "Masala, sugar & spices",
    pricePerUnit: 120,
    unit: "100g",
    images: ["/rock_salt.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Cumin Seeds (Jeera)",
    category: "Masala, sugar & spices",
    pricePerUnit: 150,
    unit: "100g",
    images: ["/dal.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 88
  },
  {
    name: "Mustard Seeds (Rai)",
    category: "Masala, sugar & spices",
    pricePerUnit: 50,
    unit: "100g",
    images: ["/dal.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 87
  },
  {
    name: "Salt",
    category: "Masala, sugar & spices",
    pricePerUnit: 25,
    unit: "1kg",
    images: ["/rock_salt.png"], // Existing exact match image
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Sugar",
    category: "Masala, sugar & spices",
    pricePerUnit: 50,
    unit: "1kg",
    images: ["/rock_salt.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Jaggery (Gur)",
    category: "Masala, sugar & spices",
    pricePerUnit: 80,
    unit: "1kg",
    images: ["/cookie.png"], // Fallback image
    inStock: true,
    sustainabilityScore: 89
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
