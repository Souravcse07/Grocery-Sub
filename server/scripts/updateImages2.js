const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const fallbackImages = [
  "/oil.png", "/butter.png", "/rock_salt.png", "/dal.png", "/cookie.png", 
  "/muffin.png", "/bun.png", "/bread.png", "/produce.png", "/potato.png", 
  "/mixed_juice.png", "/juice.png", "/tomato.png", "/tea.png", "/milk.png", 
  "/yogurt.png", "/apple.png", "/categories/oats.png", "/categories/basmati_rice.png"
];

const updateAllImages = async () => {
  try {
    await connectDB();
    console.log("Connected to DB, updating all fallback images...");
    
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const currentImage = product.images[0];
        // Generate new filename based on product name
        const formattedName = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, '');
          
        const newImagePath = `/categories/${formattedName}.png`;
        
        // Always update if it's currently a fallback image
        if (fallbackImages.includes(currentImage) || currentImage === newImagePath) {
           if (currentImage !== newImagePath) {
              product.images = [newImagePath];
              await product.save();
              console.log(`Updated ${product.name}: ${currentImage} -> ${newImagePath}`);
              updatedCount++;
           }
        } else {
           console.log(`Skipped ${product.name} (has custom image: ${currentImage})`);
        }
      }
    }
    
    console.log(`Update complete. ${updatedCount} products updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1);
  }
};

updateAllImages();
