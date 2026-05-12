const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

// Map of categories to fallback image names in public directory
const categoryToFallback = {
  "Oil & ghee": "oil.png",
  "Masala, sugar & spices": "rock_salt.png",
  "Cereals & breakfast": "cookie.png",
  "Tea, coffee & drink mixes": "tea.png",
  "Juices & cold drinks": "juice.png",
  "Sauces & spreads": "tomato.png",
  "Noodles & pasta": "produce.png",
  "Chips & biscuits": "cookie.png",
  "Chocolates & sweets": "cookie.png",
  "Indian snacks": "cookie.png",
  "Atta, rice & grains": "produce.png",
  "Dals & pulses": "dal.png"
};

// More specific name matching if needed
const getFallbackForName = (name, category) => {
  const n = name.toLowerCase();
  if (n.includes('ghee') || n.includes('butter') || n.includes('mayonnaise')) return 'butter.png';
  if (n.includes('milkshake')) return 'milk.png';
  if (n.includes('protein')) return 'yogurt.png';
  if (n.includes('jam')) return 'apple.png';
  if (n.includes('rusks') || n.includes('papad')) return 'bread.png';
  if (n.includes('potato')) return 'potato.png';
  if (n.includes('samosa') || n.includes('ladoo')) return 'bun.png';
  if (n.includes('cake') || n.includes('muffin')) return 'muffin.png';
  return categoryToFallback[category] || 'produce.png';
};

const createImages = async () => {
  try {
    await connectDB();
    const products = await Product.find({});
    
    const publicDir = path.join(__dirname, '../../client/public');
    const categoriesDir = path.join(publicDir, 'categories');
    
    if (!fs.existsSync(categoriesDir)) {
      fs.mkdirSync(categoriesDir, { recursive: true });
    }
    
    let createdCount = 0;
    
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const imagePath = product.images[0];
        // If it starts with /categories/
        if (imagePath.startsWith('/categories/')) {
          const absoluteDestPath = path.join(publicDir, imagePath);
          
          // If the file doesn't exist, copy a fallback
          if (!fs.existsSync(absoluteDestPath)) {
            const fallbackFile = getFallbackForName(product.name, product.category);
            const absoluteSrcPath = path.join(publicDir, fallbackFile);
            
            if (fs.existsSync(absoluteSrcPath)) {
              fs.copyFileSync(absoluteSrcPath, absoluteDestPath);
              console.log(`Created ${imagePath} by copying ${fallbackFile}`);
              createdCount++;
            } else {
              console.log(`Warning: Source fallback ${fallbackFile} not found for ${product.name}`);
            }
          }
        }
      }
    }
    
    console.log(`Created ${createdCount} placeholder images.`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating images:", error);
    process.exit(1);
  }
};

createImages();
