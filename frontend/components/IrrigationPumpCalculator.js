import React, { useState } from 'react';
  import axios from 'axios';
  import { FaLeaf, FaWater, FaTractor, FaPipeSection, FaSprinkler, FaCloudSun, FaChevronDown, FaChevronUp } from 'react-icons/fa';

  console.log('Imported react-icons successfully');

  const IrrigationPumpCalculator = () => {
      const [formData, setFormData] = useState({
          areaRange: '۰.۵ تا ۱ هکتار',
          irrigationPattern: 'کل زمین هم‌زمان آبیاری می‌شود',
          slopeHeight: 'زمین کاملاً صاف است',
          waterSource: 'استخر ذخیره',
          distanceToSource: 'کمتر از ۲۰ متر',
          sourceElevation: 'پایین‌تر از زمین',
          cropType: 'غلات',
          irrigationTime: '۱ تا ۳ ساعت',
          irrigationFrequency: 'دو بار',
          pipeDiameter: '۲ اینچ (۵۰ میلی‌متر)',
          pipeLength: '۲۰ تا ۵۰ متر',
          pipeMaterial: 'PVC',
          irrigationSystem: 'قطره‌ای',
          dripperPressure: '۱.۵ بار',
          climateType: 'گرم و خشک',
          waterTemp: '۱۵ تا ۲۵'
      });
      const [result, setResult] = useState(null);
      const [loading, setLoading] = useState(false);
      const [openSection, setOpenSection] = useState(null);

      console.log('Component initialized with formData:', formData);

      const handleChange = (e) => {
          const { name, value } = e.target;
          console.log(`Form field changed - ${name}: ${value}`);
          setFormData({ ...formData, [name]: value });
      };

      const toggleSection = (section) => {
          console.log(`Toggling section: ${section}, current openSection: ${openSection}`);
          setOpenSection(openSection === section ? null : section);
      };

      const handleSubmit = async (e) => {
          e.preventDefault();
          console.log('Form submitted with data:', formData);
          setLoading(true);
          try {
              console.log('Sending request to backend...');
              const response = await axios.post('http://localhost:3099/irrigation-pump/calculate', formData);
              console.log('Backend response:', response.data);
              setResult(response.data);
          } catch (error) {
              console.error('Error during calculation:', error.message);
              setResult({ error: 'خطا در محاسبه، لطفاً دوباره امتحان کنید.' });
          } finally {
              setLoading(false);
              console.log('Loading state set to:', loading);
          }
      };

      const sections = [
          {
              title: 'مرحله ۱: اطلاعات زمین',
              icon: <FaLeaf className="text-green-600" />,
              fields: [
                  { label: '۱. مساحت زمین چقدر است؟', name: 'areaRange', options: ['کمتر از ۰.۵ هکتار', '۰.۵ تا ۱ هکتار', '۱ تا ۳ هکتار', '۳ تا ۵ هکتار', 'بیشتر از ۵ هکتار'] },
                  { label: '۲. شکل آبیاری شما به چه صورتی است؟', name: 'irrigationPattern', options: ['کل زمین هم‌زمان آبیاری می‌شود', 'زمین به دو بخش تقسیم شده', 'زمین به چند ناحیه آبیاری می‌شود'] },
                  { label: '۳. شیب زمین چگونه است؟', name: 'slopeHeight', options: ['زمین کاملاً صاف است', 'کمی شیب دارد', 'شیب‌دار یا پله‌ای'] },
              ],
          },
          {
              title: 'مرحله ۲: منبع آب',
              icon: <FaWater className="text-blue-600" />,
              fields: [
                  { label: '۴. منبع آب کجاست؟', name: 'waterSource', options: ['چاه آب', 'استخر ذخیره', 'کانال یا نهر عمومی', 'تانکر یا مخزن'] },
                  { label: '۵. فاصله منبع آب تا محل آبیاری چقدر است؟', name: 'distanceToSource', options: ['کمتر از ۲۰ متر', '۲۰ تا ۵۰ متر', 'بیشتر از ۵۰ متر'] },
                  { label: '۶. ارتفاع منبع آب نسبت به زمین کشاورزی:', name: 'sourceElevation', options: ['بالاتر از زمین', 'هم‌سطح', 'پایین‌تر از زمین'] },
              ],
          },
          {
              title: 'مرحله ۳: نوع محصول و زمان آبیاری',
              icon: <FaTractor className="text-yellow-600" />,
              fields: [
                  { label: '۷. محصول مورد کشت چیست؟', name: 'cropType', options: ['سبزیجات', 'درختی', 'غلات', 'علوفه‌ای', 'گلخانه‌ای', 'سایر'] },
                  { label: '۸. زمان آبیاری در هر نوبت چقدر است؟', name: 'irrigationTime', options: ['کمتر از ۱ ساعت', '۱ تا ۳ ساعت', '۳ تا ۵ ساعت', 'بیشتر از ۵ ساعت'] },
                  { label: '۹. چند نوبت آبیاری در هفته انجام می‌دهید؟', name: 'irrigationFrequency', options: ['یک‌بار', 'دو بار', 'سه بار', 'بیشتر'] },
              ],
          },
          {
              title: 'مرحله ۴: لوله‌کشی',
              icon: <FaPipeSection className="text-gray-600" />,
              fields: [
                  { label: '۱۰. قطر تقریبی لوله اصلی چقدر است؟', name: 'pipeDiameter', options: ['۱/۲ اینچ (۱۶ میلی‌متر)', '۱ اینچ (۲۵ میلی‌متر)', '۲ اینچ (۵۰ میلی‌متر)', '۳ اینچ (۷۵ میلی‌متر)'] },
                  { label: '۱۱. طول تقریبی لوله اصلی چقدر است?', name: 'pipeLength', options: ['کمتر از ۲۰ متر', '۲۰ تا ۵۰ متر', 'بیشتر از ۵۰ متر'] },
                  { label: '۱۲. جنس لوله چیست؟', name: 'pipeMaterial', options: ['PVC', 'پلی‌اتیلن', 'فلزی'] },
              ],
          },
          {
              title: 'مرحله ۵: سیستم آبیاری',
              icon: <FaSprinkler className="text-blue-400" />,
              fields: [
                  { label: '۱۳. نوع سیستم آبیاری مدنظرت چیه؟', name: 'irrigationSystem', options: ['قطره‌ای', 'بارانی', 'جوی و پشته‌ای'] },
                  ...(formData.irrigationSystem === 'قطره‌ای' ? [{ label: '۱۳.۱ فشار مورد نیاز دریپر (بار)؟', name: 'dripperPressure', options: ['۰.۵ بار', '۱ بار', '۱.۵ بار', '۲ بار'] }] : []),
              ],
          },
          {
              title: 'مرحله ۶: شرایط محیطی',
              icon: <FaCloudSun className="text-orange-500" />,
              fields: [
                  { label: '۱۴. نوع منطقه آب‌وهوایی چیه؟', name: 'climateType', options: ['گرم و خشک', 'گرم و مرطوب', 'معتدل'] },
                  { label: '۱۵. دمای آب (درجه سانتی‌گراد)؟', name: 'waterTemp', options: ['کمتر از ۱۵', '۱۵ تا ۲۵', 'بیشتر از ۲۵'] },
              ],
          },
      ];

      console.log('Sections initialized:', sections.map(s => s.title));

      return (
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center py-8 px-4">
              {/* هدر */}
              <header className="text-center mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-green-800 flex items-center justify-center gap-3">
                      <FaLeaf /> محاسبه‌گر پمپ آبیاری
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">بهترین پمپ را برای آبیاری مزرعه‌تان انتخاب کنید</p>
              </header>

              {/* فرم */}
              <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 space-y-4">
                  {sections.map((section, index) => (
                      <div key={index} className="border-b border-green-200">
                          <button
                              type="button"
                              onClick={() => toggleSection(index)}
                              className="w-full flex items-center justify-between p-4 text-lg font-semibold text-green-800 hover:bg-green-50 transition-colors duration-300"
                          >
                              <div className="flex items-center gap-3">
                                  {section.icon}
                                  {section.title}
                              </div>
                              {openSection === index ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                          {openSection === index && (
                              <div className="p-4 space-y-4 animate-fade-in">
                                  {section.fields.map((field, fieldIndex) => (
                                      <div key={fieldIndex} className="mb-4">
                                          <label className="block mb-2 text-gray-700 font-medium">{field.label}</label>
                                          <select
                                              name={field.name}
                                              value={formData[field.name]}
                                              onChange={handleChange}
                                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                                          >
                                              {field.options.map((option, optionIndex) => (
                                                  <option key={optionIndex} value={option}>{option}</option>
                                              ))}
                                          </select>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  ))}
                  <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 mt-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      } flex items-center justify-center gap-2`}
                  >
                      {loading ? (
                          <>
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              در حال محاسبه...
                          </>
                      ) : (
                          <>
                              <FaWater /> محاسبه
                          </>
                      )}
                  </button>
              </form>

              {/* نمایش نتیجه */}
              {result && (
                  <div className="w-full max-w-2xl mt-8 p-6 bg-white rounded-lg shadow-xl animate-fade-in">
                      <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center gap-3">
                          <FaLeaf /> نتیجه محاسبه
                      </h2>
                      {result.error ? (
                          <p className="text-red-500">{result.error}</p>
                      ) : (
                          <div className="space-y-3 text-gray-700">
                              <p className="flex items-center gap-2">
                                  <span className="font-medium text-green-700">دبی:</span>
                                  {result.flow_rate} متر مکعب بر ساعت
                              </p>
                              <p className="flex items-center gap-2">
                                  <span className="font-medium text-green-700">هد کل:</span>
                                  {result.total_head} متر
                              </p>
                              <p className="flex items-center gap-2">
                                  <span className="font-medium text-green-700">هد کل (بار):</span>
                                  {result.total_head_in_bar} بار
                              </p>
                              <p className="flex items-center gap-2">
                                  <span className="font-medium text-green-700">پمپ پیشنهادی:</span>
                                  {result.pump_name} ({result.brand})
                              </p>
                              <p className="flex items-center gap-2">
                                  <span className="font-medium text-green-700">قیمت:</span>
                                  {result.price.toLocaleString()} تومان
                              </p>
                              {result.warning && <p className="text-yellow-600 mt-2">{result.warning}</p>}
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  export default IrrigationPumpCalculator;