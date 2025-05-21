const { getPumps } = require('../db');

async function calculateGreenhousePump({ area, cropType, irrigationType, irrigationTime, staticHead, pipeLength, pipeDiameter = 50, pipeMaterial = 'PVC', targetHumidity = 70, targetTemp = 25 }) {
    try {
        const areaNum = parseFloat(area);
        const irrigationTimeNum = parseFloat(irrigationTime) * 3600;
        const staticHeadNum = parseFloat(staticHead);
        const pipeLengthNum = parseFloat(pipeLength);
        const pipeDiameterNum = parseFloat(pipeDiameter) / 1000;

        const ETo = 5; // mm/day (تقریبی برای گلخانه)
        const Kc = cropType === 'گوجه' ? 0.8 : cropType === 'خیار' ? 0.7 : 0.9;
        const waterNeed = (ETo * Kc * (1 - targetHumidity / 100) * areaNum * 10) / 1000; // m³
        const efficiency = irrigationType === 'مه‌پاش' ? 0.95 : 0.9;
        const flowRate = (waterNeed * 1000) / irrigationTimeNum; // m³/s

        const frictionFactor = pipeMaterial === 'PVC' ? 0.02 : 0.025;
        const velocity = 1.5;
        const frictionLoss = frictionFactor * (pipeLengthNum / pipeDiameterNum) * (Math.pow(velocity, 2) / (2 * 9.81));
        const mistLoss = irrigationType === 'مه‌پاش' ? 0.2 : 0; // bar به متر
        const totalHead = staticHeadNum + frictionLoss + (mistLoss * 10.2);

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
            response.warning = 'هیچ پمپ جایگزینی در دیتابیس موجود نیست.';
        }

        return response;
    } catch (error) {
        console.error('خطا در محاسبه گلخانه:', error.stack);
        throw error;
    }
}

module.exports = { calculateGreenhousePump };