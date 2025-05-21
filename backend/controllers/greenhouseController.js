const calculateFrictionLoss = require('../utils/calculateFrictionLoss');
const db = require('../db');

const calculateGreenhouse = async (req, res) => {
    try {
        const {
            area,
            cropType,
            irrigationType,
            irrigationTime,
            staticHead,
            pipeLength,
            pipeDiameter,
            pipeMaterial,
            targetHumidity,
            targetTemp,
            powerSource
        } = req.body;

        // محاسبات اولیه
        const areaInHectares = parseFloat(area) / 10000; // متر مربع به هکتار
        const systemDataBase = irrigationType === 'مه‌پاش' ? 5 : irrigationType === 'قطره‌ای' ? 3 : 2;
        const cropFactor = cropType === 'گوجه' ? 1.2 : cropType === 'خیار' ? 1.1 : 1.0;
        const timeFactor = 1 / parseFloat(irrigationTime);
        const humidityFactor = parseFloat(targetHumidity) > 70 ? 1.1 : 1.0;
        const tempFactor = parseFloat(targetTemp) > 25 ? 1.05 : 1.0;

        const flowRateM3H = areaInHectares * systemDataBase * cropFactor * timeFactor * humidityFactor * tempFactor;
        console.log('محاسبات اولیه:', {
            areaInHectares,
            systemDataBase,
            cropFactor,
            timeFactor,
            humidityFactor,
            tempFactor,
            flowRateM3H
        });

        // محاسبات هد
        const staticHeadValue = parseFloat(staticHead);
        const frictionLoss = calculateFrictionLoss(parseFloat(pipeLength), parseFloat(pipeDiameter) / 1000, flowRateM3H * 1000 / 3600, pipeMaterial);
        const requiredPressureHead = irrigationType === 'مه‌پاش' ? 20 : irrigationType === 'قطره‌ای' ? 15 : 10;
        const totalHead = staticHeadValue + frictionLoss + requiredPressureHead;
        console.log('محاسبات هد:', { staticHead: staticHeadValue, frictionLoss, requiredPressureHead, totalHead });

        // فشار نهایی
        const pressureBar = totalHead * 0.098;
        console.log('فشار نهایی:', { pressureBar });

        // جستجوی پمپ
        const lowerFlowRate = flowRateM3H * 1000 * 0.8;
        const upperFlowRate = flowRateM3H * 1000 * 1.2;
        const lowerHead = totalHead * 1.1;
        const query = `
            SELECT id, name, brand, CAST(flow_rate AS DECIMAL) AS flow_rate,
                   CAST(head AS DECIMAL) AS head, power, price
            FROM pumps
            WHERE (flow_rate IS NOT NULL AND CAST(flow_rate AS DECIMAL) BETWEEN $1 AND $2)
            AND (head IS NOT NULL AND CAST(head AS DECIMAL) BETWEEN $3 AND $4)
            AND (power IS NULL OR LOWER(power) = $5)
            ORDER BY ABS(CAST(flow_rate AS DECIMAL) - $6) ASC, ABS(CAST(head AS DECIMAL) - $7) ASC LIMIT 1
        `;
        const values = [
            lowerFlowRate,
            upperFlowRate,
            lowerHead,
            Infinity,
            powerSource.toLowerCase(),
            flowRateM3H * 1000,
            lowerHead
        ];
        console.log('Querying pumps with query:', query);
        console.log('Querying pumps with values:', values);

        const pumps = db.all(query, values);
        console.log('Pumps fetched from database:', pumps);

        const response = {
            specifications: {
                flow_rate: flowRateM3H.toFixed(2) + ' m³/h',
                total_head: totalHead.toFixed(2) + ' m',
                pressure: pressureBar.toFixed(2) + ' bar',
                standards_applied: ['EN 806-3', 'ISO 3822']
            },
            pump: pumps.length > 0 ? {
                name: pumps[0].name,
                brand: pumps[0].brand,
                flow_rate: (pumps[0].flow_rate / 1000).toFixed(2) + ' m³/h',
                head: pumps[0].head.toFixed(2) + ' m',
                power: pumps[0].power,
                price: pumps[0].price.toString()
            } : null
        };

        if (!response.pump) {
            response.warning = {
                message: 'پمپ مناسب با مشخصات دقیق یافت نشد',
                suggestion: 'مشخصات محاسبه شده را با مهندس مشاور بررسی نمایید',
                closest_match: null
            };
        }

        console.log('Sending response for greenhouse:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error in calculateGreenhouse:', error);
        res.status(500).json({ error: error.message || 'خطای سرور' });
    }
};

module.exports = { calculateGreenhouse };