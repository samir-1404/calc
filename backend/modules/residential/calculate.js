const { getPumps } = require('../db');

const STANDARDS = {
  WATER_PER_PERSON: 0.5,
  PEOPLE_PER_UNIT: 5,
  PEAK_HOURS: 5,
  PEAK_FACTORS: {
    LOW: { threshold: 10, factor: 1.2 },
    MEDIUM: { threshold: 20, factor: 1.1 },
    HIGH: { threshold: 50, factor: 1.0 },
    DEFAULT: 1.0
  },
  FLOOR_HEIGHT: 3.3,
  HAZEN_WILLIAMS_C: 140,
  SAFETY_FACTORS: {
    FLOW: 1.15,
    HEAD: 1.10
  },
  PRESSURE_CONVERSION: 0.0981
};

async function calculateResidentialPump({
  floors,
  parkingFloors,
  units,
  powerType,
  inletPipeSize
}) {
  try {
    const floorsNum = validateInput(floors, 'تعداد طبقات');
    const parkingFloorsNum = validateInput(parkingFloors, 'تعداد طبقات پارکینگ');
    const unitsNum = validateInput(units, 'تعداد واحدها');
    const inletPipeSizeNum = validateInput(inletPipeSize, 'سایز لوله ورودی');
    
    const peakFactor = calculatePeakFactor(unitsNum);
    const { flowRateM3H, flowRateLPS } = calculateFlowRate(unitsNum, peakFactor);
    
    const { staticHead, totalHead, pressureBar } = calculateHead(
      floorsNum,
      parkingFloorsNum,
      inletPipeSizeNum,
      flowRateLPS
    );
    
    const designFlowRate = flowRateM3H * STANDARDS.SAFETY_FACTORS.FLOW;
    const designHead = totalHead * STANDARDS.SAFETY_FACTORS.HEAD;
    
    const pumps = await getPumps(designFlowRate * 1000, designFlowRate * 1000 * 1.2, designHead, designHead * 1.2, powerType);
    const response = buildResponse(flowRateM3H, totalHead, pressureBar, pumps, designFlowRate, designHead);
    
    return response;
  } catch (error) {
    console.error('خطا در محاسبه پمپ مسکونی:', error.stack);
    throw new Error(`خطا در محاسبات: ${error.message}`);
  }
}

function validateInput(value, paramName) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    throw new Error(`${paramName} باید عددی مثبت باشد`);
  }
  return num;
}

function calculatePeakFactor(unitsNum) {
  const { LOW, MEDIUM, HIGH, DEFAULT } = STANDARDS.PEAK_FACTORS;
  
  if (unitsNum <= LOW.threshold) return LOW.factor;
  if (unitsNum <= MEDIUM.threshold) return MEDIUM.factor;
  if (unitsNum <= HIGH.threshold) return HIGH.factor;
  return DEFAULT;
}

function calculateFlowRate(unitsNum, peakFactor) {
  const totalWaterDaily = unitsNum * STANDARDS.PEOPLE_PER_UNIT * STANDARDS.WATER_PER_PERSON;
  const flowRateM3H = (totalWaterDaily * peakFactor) / STANDARDS.PEAK_HOURS;
  const flowRateLPS = (flowRateM3H * 1000) / 3600;
  
  return { flowRateM3H, flowRateLPS };
}

function calculateHead(floorsNum, parkingFloorsNum, inletPipeSizeNum, flowRateLPS) {
  const staticHead = (floorsNum + parkingFloorsNum) * STANDARDS.FLOOR_HEIGHT;
  
  const pipeLength = staticHead + 10;
  const { HAZEN_WILLIAMS_C: C } = STANDARDS;
  const frictionLossPer100m = (10400 * Math.pow(flowRateLPS, 1.85)) / 
                             (Math.pow(C, 1.85) * Math.pow(inletPipeSizeNum, 4.87));
  const frictionLoss = (frictionLossPer100m * pipeLength) / 100;
  
  const requiredPressureHead = 3 / STANDARDS.PRESSURE_CONVERSION;
  
  const totalHead = staticHead + frictionLoss + requiredPressureHead;
  const pressureBar = totalHead * STANDARDS.PRESSURE_CONVERSION;
  
  return { staticHead, totalHead, pressureBar };
}

function buildResponse(flowRate, totalHead, pressure, pumps, designFlowRate, designHead) {
  const response = {
    specifications: {
      flow_rate: flowRate.toFixed(2) + ' m³/h',
      total_head: totalHead.toFixed(2) + ' m',
      pressure: pressure.toFixed(2) + ' bar',
      standards_applied: ['EN 806-3', 'ISO 3822', 'AWWA C900', 'HI 9.6.7']
    },
    pump: null
  };
  
  const recommendedPump = pumps.find(p => 
    p.flow_rate >= designFlowRate * 1000 && 
    p.head >= designHead
  );
  
  if (recommendedPump) {
    response.pump = {
      name: recommendedPump.name,
      brand: recommendedPump.brand,
      model: recommendedPump.model,
      power: recommendedPump.power,
      price: recommendedPump.price
    };
  } else {
    response.warning = {
      message: 'پمپ مناسب با مشخصات دقیق یافت نشد',
      suggestion: 'مشخصات محاسبه شده را با مهندس مشاور بررسی نمایید',
      closest_match: findClosestPump(pumps, designFlowRate * 1000, designHead)
    };
  }
  
  return response;
}

function findClosestPump(pumps, requiredFlow, requiredHead) {
  if (!pumps.length) return null;
  
  return pumps.reduce((closest, pump) => {
    const currentDiff = Math.sqrt(
      Math.pow(pump.flow_rate - requiredFlow, 2) +
      Math.pow(pump.head - requiredHead, 2)
    );
    const closestDiff = Math.sqrt(
      Math.pow(closest.flow_rate - requiredFlow, 2) +
      Math.pow(closest.head - requiredHead, 2)
    );
    
    return currentDiff < closestDiff ? pump : closest;
  });
}

module.exports = { calculateResidentialPump };