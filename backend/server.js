// server.js
const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
require('dotenv').config(); // برای خوندن متغیرهای محیطی

const app = express();

// لاگ برای بررسی مراحل
console.log('Loading db.js...');
const db = require('./modules/db');

// بررسی اتصال به دیتابیس
db.connect()
    .then(() => console.log('Successfully connected to database'))
    .catch(err => {
        console.error('Failed to connect to database:', err.message);
        process.exit(1); // اگه دیتابیس وصل نشد، سرور متوقف بشه
    });

console.log('Loading routes.js...');
const routes = require('./modules/routes');
console.log('Exporting router...');

// میدلور CORS برای اجازه دادن به فرانت‌اند
app.use(cors({
    origin: 'http://localhost:3000',
}));

// میدلور برای پارس کردن درخواست‌های JSON
app.use(express.json());

// میدلور احراز هویت با JWT برای روترهای ادمین
app.use('/api/admin', jwt({
    secret: process.env.JWT_SECRET, // کلید از .env خونده می‌شه
    algorithms: ['HS256'],
    credentialsRequired: false
}));

// اتصال روترها با پیشوند /api
app.use('/api', routes);

// میان‌افزار خطای سراسری
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ error: 'خطای سرور داخلی' });
});

// راه‌اندازی سرور
const port = process.env.PORT || 3099; // پورت از .env خونده می‌شه
console.log('Starting server...');
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});