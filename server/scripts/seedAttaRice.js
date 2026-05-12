const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const newProducts = [
  {
    name: "Wheat flour (Atta)",
    category: "Atta, rice & grains",
    pricePerUnit: 250,
    unit: "5kg",
    images: ["/categories/atta.png"],
    inStock: true,
    sustainabilityScore: 85
  },
  {
    name: "Basmati Rice",
    category: "Atta, rice & grains",
    pricePerUnit: 180,
    unit: "1kg",
    images: ["/categories/basmati_rice.png"],
    inStock: true,
    sustainabilityScore: 80
  },
  {
    name: "Sona Masoori Rice",
    category: "Atta, rice & grains",
    pricePerUnit: 65,
    unit: "1kg",
    images: ["/categories/basmati_rice.png"],
    inStock: true,
    sustainabilityScore: 78
  },
  {
    name: "Rava / Sooji",
    category: "Atta, rice & grains",
    pricePerUnit: 45,
    unit: "500g",
    images: ["/categories/rava.png"],
    inStock: true,
    sustainabilityScore: 82
  },
  {
    name: "Maida (Refined Flour)",
    category: "Atta, rice & grains",
    pricePerUnit: 40,
    unit: "500g",
    images: ["/categories/maida.png"],
    inStock: true,
    sustainabilityScore: 75
  },
  {
    name: "Poha (Flattened Rice)",
    category: "Atta, rice & grains",
    pricePerUnit: 55,
    unit: "500g",
    images: ["/categories/poha.png"],
    inStock: true,
    sustainabilityScore: 90
  },
  {
    name: "Mixed Millets (Ragi, Jowar, Bajra)",
    category: "Atta, rice & grains",
    pricePerUnit: 120,
    unit: "1kg",
    images: ["/categories/millets.png"],
    inStock: true,
    sustainabilityScore: 95
  },
  {
    name: "Rolled Oats",
    category: "Atta, rice & grains",
    pricePerUnit: 150,
    unit: "1kg",
    images: ["/categories/oats.png"],
    inStock: true,
    sustainabilityScore: 88
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
