const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const productController = require('../controllers/product.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', verifyToken, isAdmin, upload.array('images', 5), productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.softDeleteProduct);

module.exports = router;
