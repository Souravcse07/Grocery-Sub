const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const walletController = require('../controllers/wallet.controller');

const router = express.Router();

router.get('/', verifyToken, walletController.getWallet);

module.exports = router;
