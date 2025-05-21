// backend/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/login', authController.login);

module.exports = router;

// backend/modules/auth/auth.controller.js
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        // برای تست ساده، فقط یه نقش admin تولید می‌کنیم
        // تو پروژه واقعی، باید احراز هویت واقعی (مثلاً با نام کاربری و رمز) داشته باشیم
        const user = { role: 'admin' };
        const token = jwt.sign(user, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};