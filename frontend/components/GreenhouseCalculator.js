import React, { useState } from 'react';

const GreenhouseCalculator = () => {
    const [formData, setFormData] = useState({
        area: '',
        cropType: 'گوجه',
        irrigationType: 'مه‌پاش',
        irrigationTime: '',
        staticHead: '',
        pipeLength: '',
        pipeDiameter: '50',
        pipeMaterial: 'PVC',
        targetHumidity: '70',
        targetTemp: '25',
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3099/api/residential/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('سرور پاسخ نداد. لطفاً دوباره امتحان کنید.');
            const data = await response.json();
            console.log('پاسخ بک‌اند:', data);
            setResult(data);
        } catch (error) {
            console.error('خطا در درخواست:', error.message);
            setResult({ error: error.message || 'خطا در ارتباط با سرور. لطفاً مطمئن شوید سرور اجرا شده است.' });
        }
    };

    return (
        <div>
            <h2>محاسبه‌گر پمپ گلخانه</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>مساحت گلخانه (متر مربع): <span title="مساحت کل گلخانه">?</span></label>
                    <input type="number" name="area" value={formData.area} onChange={handleChange} required step="0.1" />
                </div>
                <div>
                    <label>نوع گیاه: <span title="تأثیر نیاز آبی گیاه">?</span></label>
                    <select name="cropType" value={formData.cropType} onChange={handleChange}>
                        <option value="گوجه">گوجه</option>
                        <option value="خیار">خیار</option>
                        <option value="گل">گل</option>
                    </select>
                </div>
                <div>
                    <label>نوع سیستم آبیاری: <span title="تأثیر راندمان و فشار">?</span></label>
                    <select name="irrigationType" value={formData.irrigationType} onChange={handleChange}>
                        <option value="مه‌پاش">مه‌پاش</option>
                        <option value="قطره‌ای">قطره‌ای</option>
                    </select>
                </div>
                <div>
                    <label>زمان آبیاری (ساعت): <span title="مدت زمان آبیاری در روز">?</span></label>
                    <input type="number" name="irrigationTime" value={formData.irrigationTime} onChange={handleChange} required min="1" max="24" step="0.1" />
                </div>
                <div>
                    <label>هد استاتیکی (متر): <span title="اختلاف ارتفاع منبع و زمین">?</span></label>
                    <input type="number" name="staticHead" value={formData.staticHead} onChange={handleChange} required step="0.1" />
                </div>
                <div>
                    <label>طول کل لوله‌ها (متر): <span title="طول کل مسیر لوله">?</span></label>
                    <input type="number" name="pipeLength" value={formData.pipeLength} onChange={handleChange} required step="1" />
                </div>
                <div>
                    <label>قطر لوله (mm): <span title="قطر داخلی لوله">?</span></label>
                    <input type="number" name="pipeDiameter" value={formData.pipeDiameter} onChange={handleChange} required step="1" />
                </div>
                <div>
                    <label>جنس لوله: <span title="تأثیر ضریب اصطکاک">?</span></label>
                    <select name="pipeMaterial" value={formData.pipeMaterial} onChange={handleChange}>
                        <option value="PVC">PVC</option>
                        <option value="PE">PE</option>
                        <option value="فلزی">فلزی</option>
                    </select>
                </div>
                <div>
                    <label>رطوبت هدف (٪): <span title="رطوبت نسبی گلخانه">?</span></label>
                    <input type="number" name="targetHumidity" value={formData.targetHumidity} onChange={handleChange} required step="1" min="0" max="100" />
                </div>
                <div>
                    <label>دمای هدف (°C): <span title="دمای ایده‌آل گلخانه">?</span></label>
                    <input type="number" name="targetTemp" value={formData.targetTemp} onChange={handleChange} required step="1" />
                </div>
                <button type="submit">محاسبه</button>
            </form>

            {result && (
                <div>
                    <h3>نتیجه محاسبه:</h3>
                    <p>دبی: {result.flow_rate} لیتر بر ساعت</p>
                    <p>هد کل: {result.total_head} متر</p>
                    {result.error ? (
                        <p style={{ color: 'red' }}>{result.error}</p>
                    ) : (
                        <div>
                            <p>
                                پمپ پیشنهادی: {result.pump_name} ({result.brand})
                            </p>
                            <p>قیمت: {result.price} تومان</p>
                            {result.warning && (
                                <p style={{ color: 'orange' }}>{result.warning}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GreenhouseCalculator;