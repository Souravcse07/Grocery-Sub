const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', 
  verifyToken, 
  isAdmin, 
  upload.array('images', 5), 
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('pricePerUnit').isNumeric().withMessage('Price must be a number'),
    body('unit').notEmpty().withMessage('Unit is required')
  ],
  validate,
  productController.createProduct
);

router.put('/:id', 
  verifyToken, 
  isAdmin, 
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('pricePerUnit').optional().isNumeric().withMessage('Price must be a number')
  ],
  validate,
  productController.updateProduct
);

router.delete('/:id', verifyToken, isAdmin, productController.softDeleteProduct);

module.exports = router;
