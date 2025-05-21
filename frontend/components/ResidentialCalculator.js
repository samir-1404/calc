import React, { useState } from 'react';

const ResidentialCalculator = () => {
    const [formData, setFormData] = useState({
        occupants: '',
        fixtures: '',
        staticPressure: '',
        pipeLength: '',
        pipeDiameter: '25',
        pipeMaterial: 'PVC',
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
            if (!response.ok) throw new Error('خطا در پاسخ سرور');
            const data = await response.json();
            console.log('پاسخ بک‌اند:', data);
            setResult(data);
        } catch (error) {
            console.error('خطا در درخواست:', error);
            setResult({ error: 'خطا در ارتباط با سرور' });
        }
    };

    return (
        <div>
            <h2>محاسبه‌گر پمپ مسکونی</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>تعداد ساکنان: <span title="تعداد افراد خانه">?</span></label>
                    <input type="number" name="occupants" value={formData.occupants} onChange={handleChange} required step="1" />
                </div>
                <div>
                    <label>تعداد شیرآلات: <span title="تعداد شیرهای آب (آشپزخانه، حمام)">?</span></label>
                    <input type="number" name="fixtures" value={formData.fixtures} onChange={handleChange} required step="1" />
                </div>
                <div>
                    <label>فشار استاتیکی (bar): <span title="فشار اولیه سیستم">?</span></label>
                    <input type="number" name="staticPressure" value={formData.staticPressure} onChange={handleChange} required step="0.1" />
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
                <button type="submit">محاسبه</button>
            </form>

            {result && (
                <div>
                    <h3>نتیجه محاسبه:</h3>
                    <p>دبی: {result.flow_rate} لیتر بر ثانیه</p>
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

export default ResidentialCalculator;