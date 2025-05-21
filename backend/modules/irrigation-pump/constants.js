const CROP_WATER_DEMAND = {
    "گندم": 4.5,
    "جو": 4.0,
    "ذرت": 6.0,
    "برنج": 10.0,
    "سیب‌زمینی": 5.0,
    "گوجه‌فرنگی": 5.5,
    "خیار": 5.0,
    "پسته": 8.0,
    "زعفران": 3.5,
    "سیب": 7.0,
    "انگور": 6.5
};
const IRRIGATION_EFFICIENCY = {
    "قطره‌ای": 0.9,
    "بارانی": 0.8,
    "سطحی": 0.6
};
const SYSTEM_PRESSURE = {
    "قطره‌ای": 20,
    "بارانی": 35,
    "سطحی": 7
};
const CLIMATE_FACTOR = {
    "گرم و خشک": 1.3,
    "معتدل": 1.0,
    "سرد": 0.8
};
module.exports = { CROP_WATER_DEMAND, IRRIGATION_EFFICIENCY, SYSTEM_PRESSURE, CLIMATE_FACTOR };