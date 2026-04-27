const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user
  });
});

module.exports = router;
