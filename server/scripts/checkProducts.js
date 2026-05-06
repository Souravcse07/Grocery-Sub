const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const check = async () => {
  await connectDB();
  const p = await Product.find({});
  console.log('Total:', p.length);
  p.forEach(x => console.log(x.name, x.images));
  process.exit(0);
};

check();
