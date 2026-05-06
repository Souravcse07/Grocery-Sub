const Product = require('../models/Product');
const { uploadBuffer } = require('../config/cloudinary');

const normalizeBodyKeys = (body = {}) => {
  const normalized = {};
  for (const [key, value] of Object.entries(body)) {
    normalized[key.trim().replace(/:$/, '')] = value;
  }
  return normalized;
};

exports.getProducts = async (req, res, next) => {
  try {
    const { category, season, inStock, q } = req.query;
    const filter = { isDeleted: false };

    if (category) filter.category = category;
    if (season) filter.season = season;
    if (typeof inStock !== 'undefined') filter.inStock = inStock === 'true';
    if (q) filter.$text = { $search: q };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const payload = normalizeBodyKeys(req.body);
    const { name, category, pricePerUnit, unit, inStock, season, sustainabilityScore } = payload;

    if (!name || !category || !pricePerUnit || !unit) {
      return res.status(400).json({
        message: 'name, category, pricePerUnit and unit are required'
      });
    }

    let vendorInfo = {};
    if (payload.vendorInfo) {
      try {
        vendorInfo =
          typeof payload.vendorInfo === 'string' ? JSON.parse(payload.vendorInfo) : payload.vendorInfo;
      } catch (err) {
        return res.status(400).json({ message: 'vendorInfo must be valid JSON' });
      }
    }

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadBuffer(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    const product = await Product.create({
      name,
      category,
      pricePerUnit,
      unit,
      images: imageUrls,
      inStock: typeof inStock === 'undefined' ? true : inStock === 'true' || inStock === true,
      season,
      vendorInfo,
      sustainabilityScore: typeof sustainabilityScore === 'undefined' ? 0 : Number(sustainabilityScore)
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const updates = normalizeBodyKeys(req.body);
    if (typeof updates.vendorInfo === 'string') {
      updates.vendorInfo = JSON.parse(updates.vendorInfo);
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), inStock: false },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product soft deleted successfully' });
  } catch (err) {
    next(err);
  }
};
