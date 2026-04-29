const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret';

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, stripeCustomerId, addressBook } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });
        const user = new User({
            name,
            email,
            passwordHash: password,
            role,
            stripeCustomerId,
            addressBook
        });
        await user.save();
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const accessToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });
    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
        const accessToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};