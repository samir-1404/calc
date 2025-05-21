const { getPumps } = require('../db');

const STANDARDS = {
  FLOW_RATES: { 'قطره‌ای': { base: 7.5, adjustment: 1.0 }, 'بارانی': { base: 12.0, adjustment: 1.5 }, 'سطحی': { base: 15.0, adjustment: 2.0 } },
  CROP_FACTORS: { 'سبزیجات': 1.0, 'درختی': 1.2, 'غلات': 0.8, 'علوفه‌ای': 1.1, 'گلخانه‌ای': 1.5, 'سایر': 1.0 },
  IRRIGATION_TIME_FACTOR: 1.0,
  IRRIGATION_PATTERN_FACTORS: { 'کل زمین هم‌زمان آبیاری می‌شود': 1.0, 'زمین به دو بخش تقسیم شده': 0.5, 'زمین به چند ناحیه آبیاری می‌شود': 0.33 },
  FLOOR_HEIGHT_CONVERSION: 3.3,
  PRESSURE_CONVERSION: 0.0981,
  SAFETY_FACTORS: { FLOW: 1.15, HEAD: 1.10 }
};

function persianToEnglishNumber(str) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, (match) => persianNumbers.indexOf(match));
}

async function calculateIrrigationPump(data) {
  try {
    const areaInSquareMeters = parseFloat(data.area || 1);
    const areaInHectares = areaInSquareMeters / 10000;
    const irrigationSystem = data.irrigationSystem || 'قطره‌ای';
    const irrigationPattern = data.irrigationPattern || 'کل زمین هم‌زمان آبیاری می‌شود';
    const cropType = data.cropType || 'غلات';
    const irrigationTime = parseFloat(data.irrigationTime || 1);
    const slopeHeight = data.slopeHeight || 'زمین کاملاً صاف است';
    const distanceToSource = data.distanceToSource || 'کمتر از ۲۰ متر';
    const sourceElevation = data.sourceElevation || 'پایین‌تر از زمین';
    const pipeLength = parseFloat(data.pipeLength || 20);
    const pipeDiameter = parseFloat(data.pipeDiameter || 50);
    const dripperPressureInput = data.dripperPressure || '1.5';

    let dripperPressureStr = typeof dripperPressureInput === 'number' ? dripperPressureInput.toString() : dripperPressureInput;
    const dripperPressureClean = persianToEnglishNumber(dripperPressureStr.replace(' بار', ''));
    const dripperPressure = parseFloat(dripperPressureClean);

    if (isNaN(areaInSquareMeters) || areaInSquareMeters <= 0) throw new Error('مساحت معتبر نیست');
    if (isNaN(irrigationTime) || irrigationTime <= 0) throw new Error('زمان آبیاری معتبر نیست');
    if (isNaN(pipeLength) || pipeLength <= 0) throw new Error('طول لوله معتبر نیست');
    if (isNaN(pipeDiameter) || pipeDiameter <= 0) throw new Error('قطر لوله معتبر نیست');
    if (isNaN(dripperPressure)) throw new Error('فشار قطره‌چکان معتبر نیست');

    const systemData = STANDARDS.FLOW_RATES[irrigationSystem] || STANDARDS.FLOW_RATES['قطره‌ای'];
    const cropFactor = STANDARDS.CROP_FACTORS[cropType] || 1.0;
    const timeFactor = STANDARDS.IRRIGATION_TIME_FACTOR;
    const patternFactor = STANDARDS.IRRIGATION_PATTERN_FACTORS[irrigationPattern] || 1.0;
    let flowRateM3H = systemData.base * areaInHectares * cropFactor * timeFactor * systemData.adjustment * patternFactor;

    console.log('محاسبات اولیه:', {
      areaInHectares,
      systemDataBase: systemData.base,
      cropFactor,
      timeFactor,
      adjustment: systemData.adjustment,
      patternFactor,
      flowRateM3H
    });

    const staticHead = calculateStaticHead(slopeHeight, sourceElevation);
    const frictionLoss = calculateFrictionLoss(flowRateM3H, pipeLength, pipeDiameter);
    const requiredPressureHead = dripperPressure / STANDARDS.PRESSURE_CONVERSION;
    const totalHead = staticHead + frictionLoss + requiredPressureHead;

    console.log('محاسبات هد:', {
      staticHead,
      frictionLoss,
      requiredPressureHead,
      totalHead
    });

    const pressureBar = totalHead * STANDARDS.PRESSURE_CONVERSION;
    console.log('فشار نهایی:', { pressureBar });

    if (pressureBar > 10) throw new Error('فشار محاسبه‌شده بیش از حد مجاز است.');

    const designFlowRate = flowRateM3H * STANDARDS.SAFETY_FACTORS.FLOW; // m³/h
    const designHead = totalHead * STANDARDS.SAFETY_FACTORS.HEAD; // متر
    const lowerFlowRate = designFlowRate * 1000 * 0.8; // لیتر بر ساعت
    const upperFlowRate = designFlowRate * 1000 * 1.2; // لیتر بر ساعت
    const lowerHead = designHead * 0.9; // متر
    const pumps = await getPumps(lowerFlowRate, upperFlowRate, lowerHead, Infinity, 'electric', 1);

    console.log('Querying pumps with range:', { lowerFlowRate, upperFlowRate, lowerHead });

    const response = {
      specifications: {
        flow_rate: flowRateM3H.toFixed(2) + ' m³/h',
        total_head: totalHead.toFixed(2) + ' m',
        pressure: pressureBar.toFixed(2) + ' bar',
        standards_applied: ['EN 806-3', 'ISO 3822']
      },
      pump: null
    };

    if (pumps.length > 0) {
      response.pump = {
        name: pumps[0].name,
        brand: pumps[0].brand,
        power: pumps[0].power || 'electric',
        price: pumps[0].price.toString(),
        flow_rate: (parseFloat(pumps[0].flow_rate) / 1000).toFixed(2) + ' m³/h',
        head: parseFloat(pumps[0].head).toFixed(2) + ' m'
      };
    } else {
      response.warning = {
        message: 'پمپ مناسب با مشخصات دقیق یافت نشد',
        suggestion: 'مشخصات محاسبه شده را با مهندس مشاور بررسی کنید یا پمپ مناسب اضافه کنید',
        closest_match: null
      };
    }

    return response;
  } catch (error) {
    console.error('خطا در محاسبه پمپ آبیاری:', error.stack);
    throw new Error(`خطا در محاسبات: ${error.message}`);
  }
}

function calculateStaticHead(slopeHeight, sourceElevation) {
  let height = 0;
  if (slopeHeight === 'کمی شیب دارد') height += 5;
  if (slopeHeight === 'شیب‌دار یا پله‌ای') height += 10;
  if (sourceElevation === 'بالاتر از زمین') height -= 5;
  if (sourceElevation === 'پایین‌تر از زمین') height += 5;
  return height;
}

function calculateFrictionLoss(flowRateM3H, pipeLength, pipeDiameter) {
  const flowRateLPS = (flowRateM3H * 1000) / 3600; // لیتر بر ثانیه
  const flowRateM3S = flowRateLPS / 1000; // متر مکعب بر ثانیه
  const diameterInMeters = pipeDiameter / 1000; // میلی‌متر به متر
  const c = 140; // ضریب Hazen-Williams برای PVC
  const frictionLossPer100m = (10.67 * Math.pow(flowRateM3S, 1.852)) / (Math.pow(c, 1.852) * Math.pow(diameterInMeters, 4.87));
  return (frictionLossPer100m * pipeLength) / 100;
}

module.exports = { calculateIrrigationPump };