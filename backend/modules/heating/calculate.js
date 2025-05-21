const { getPumps } = require('../db');

async function calculateHeatingPump({ roomArea, tempDiff, pipeLength }) {
    try {
        const heatLoad = roomArea * 50; // وات بر متر مربع
        const flowRate = heatLoad / 1000; // تقریب ساده
        const frictionLoss = 0.025 * (parseFloat(pipeLength) / 0.05) * (1.5 * 1.5) / (2 * 9.81);
        const totalHead = tempDiff * 0.1 + frictionLoss;

        const pumps = await getPumps(flowRate * 3600, totalHead);
        const response = {
            flow_rate: (flowRate * 3600).toFixed(2),
            total_head: totalHead.toFixed(2),
        };

        const recommendedPump = pumps.find(p => p.flow_rate >= flowRate * 3600 && p.head >= totalHead);
        if (recommendedPump) {
            response.pump_name = recommendedPump.name;
            response.brand = recommendedPump.brand;
            response.price = recommendedPump.price;
        } else {
            response.pump_name = 'در این رنج پمپی موجود نیست';
            response.brand = 'لطفاً با پشتیبانی تماس بگیرید';
            response.price = 0;
        }

        return response;
    } catch (error) {
        console.error('خطا در محاسبه پمپ گرمایش:', error);
        throw error;
    }
}

module.exports = { calculateHeatingPump };