const Wallet = require('../models/Wallet');

exports.getWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0, transactions: [] });
    }
    
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};
