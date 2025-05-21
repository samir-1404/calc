// backend/modules/admin/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');

router.get('/stats', adminController.getStats);
router.post('/pumps', adminController.addPump);
router.put('/pumps/:id', adminController.updatePump);
router.delete('/pumps/:id', adminController.deletePump);

module.exports = router;

// backend/modules/admin/admin.controller.js
const adminService = require('./admin.service');

exports.getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addPump = async (req, res) => {
    try {
        const { name, brand, flow_rate, head, power, price } = req.body;
        const pump = await adminService.addPump(name, brand, flow_rate, head, power, price);
        res.status(201).json(pump);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePump = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, flow_rate, head, power, price } = req.body;
        const pump = await adminService.updatePump(id, name, brand, flow_rate, head, power, price);
        res.json(pump);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePump = async (req, res) => {
    try {
        const { id } = req.params;
        const pump = await adminService.deletePump(id);
        res.json(pump);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// backend/modules/admin/admin.service.js
const db = require('../db');

exports.getStats = async () => {
    const pumpCount = (await db.getPumps()).length;
    const dailyCalculations = 300; // Placeholder (باید از لاگ‌ها بیاد)
    const activeUsers = 150; // Placeholder (باید از جدول کاربران بیاد)
    return { pumpCount, dailyCalculations, activeUsers };
};

exports.addPump = async (name, brand, flow_rate, head, power, price) => {
    return await db.addPump(name, brand, flow_rate, head, power, price);
};

exports.updatePump = async (id, name, brand, flow_rate, head, power, price) => {
    return await db.updatePump(id, name, brand, flow_rate, head, power, price);
};

exports.deletePump = async (id) => {
    return await db.deletePump(id);
};

// backend/modules/routes.js (به‌روزرسانی)
const express = require('express');
const router = express.Router();
const irrigationRoutes = require('./irrigation-pump/calculate');
const greenhouseRoutes = require('./greenhouse/calculate');
const residentialRoutes = require('./residential/calculate');
const adminRoutes = require('./admin/admin.routes');

router.use('/irrigation-pump', irrigationRoutes);
router.use('/greenhouse', greenhouseRoutes);
router.use('/residential', residentialRoutes);
router.use('/admin', adminRoutes);

module.exports = router;