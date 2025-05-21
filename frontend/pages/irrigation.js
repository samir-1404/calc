import { useState, useEffect } from 'react';
import api from '../api/api';
import styles from '../styles/Irrigation.module.css';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export default function Irrigation() {
    const { t } = useTranslation('common');
    const [formData, setFormData] = useState({
        area: '2',
        irrigationPattern: 'کل زمین هم‌زمان آبیاری می‌شود',
        slopeHeight: 'زمین کاملاً صاف است',
        waterSource: 'استخر ذخیره',
        distanceToSource: 'کمتر از ۲۰ متر',
        sourceElevation: 'پایین‌تر از زمین',
        cropType: 'غلات',
        irrigationTime: '1',
        irrigationFrequency: 'دو بار',
        pipeDiameter: '۲ اینچ (۵۰ میلی‌متر)',
        pipeLength: '20',
        pipeMaterial: 'PVC',
        irrigationSystem: 'قطره‌ای',
        dripperPressure: '۱.۵ بار',
        climateType: 'گرم و خشک',
        waterTemp: '۱۵ تا ۲۵',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cachedResult = localStorage.getItem('irrigationResult');
        if (cachedResult) {
            try {
                setResult(JSON.parse(cachedResult));
            } catch (err) {
                console.error('Error parsing cached result:', err);
                localStorage.removeItem('irrigationResult');
            }
        }
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? e.target.value : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const validateAndTransformData = () => {
        const transformedData = { ...formData };

        // تبدیل مقادیر رشته به عدد
        transformedData.area = parseFloat(formData.area);
        transformedData.irrigationTime = parseFloat(formData.irrigationTime);
        transformedData.pipeLength = parseFloat(formData.pipeLength);

        // اعتبارسنجی
        if (isNaN(transformedData.area) || transformedData.area <= 0) {
            throw new Error(t('area_must_be_positive'));
        }
        if (isNaN(transformedData.irrigationTime) || transformedData.irrigationTime <= 0) {
            throw new Error(t('irrigation_time_must_be_positive'));
        }
        if (isNaN(transformedData.pipeLength) || transformedData.pipeLength <= 0) {
            throw new Error(t('pipe_length_must_be_positive'));
        }

        // تبدیل pipeDiameter به میلی‌متر
        const pipeDiameterMap = {
            '۲ اینچ (۵۰ میلی‌متر)': 50,
        };
        transformedData.pipeDiameter = pipeDiameterMap[formData.pipeDiameter] || 50;

        // تبدیل dripperPressure به عدد
        const dripperPressureMap = {
            '۱.۵ بار': 1.5,
        };
        transformedData.dripperPressure = dripperPressureMap[formData.dripperPressure] || 1.5;

        // تنظیم مقادیر برای بک‌اند
        transformedData.area = (transformedData.area * 10000).toString(); // هکتار به متر مربع
        transformedData.pipeLength = transformedData.pipeLength.toString();
        transformedData.irrigationTime = transformedData.irrigationTime.toString();

        return transformedData;
    };

// فقط بخش اصلاح‌شده handleCalculate
const handleCalculate = async () => {
  if (loading) return;
  setLoading(true);
  setError(null);
  setResult(null);
  try {
    const transformedData = validateAndTransformData();
    console.log('Sending request with data:', transformedData);
    const response = await api.post('/irrigation/calculate', transformedData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    });
    console.log('Response from backend:', response.data);
    setResult(response.data);
    localStorage.setItem('irrigationResult', JSON.stringify(response.data));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // تغییر از /admin به /login
      setError(t('please_login_again'));
    } else {
      const errorMessage = error.message || (error.response ? error.response.data.error : 'خطای ناشناخته');
      setError(t('server_error') + ': ' + errorMessage);
    }
  } finally {
    setLoading(false);
  }
};

    const handleExportPDF = async () => {
        if (!result || loading) return;
        setLoading(true);
        setError(null);
        try {
            const pdfResponse = await api.post('/pdf/generate-pdf', { result }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'irrigation_report.pdf');
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/admin';
                setError(t('please_login_again'));
            } else {
                setError(t('pdf_generation_error') + ': ' + (error.response?.data?.error || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('title')}</h1>
                <Link href="/signup">
                    <button className={styles.signupButton}>{t('signup')}</button>
                </Link>
            </header>
            <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('area_label')}</label>
                    <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className={styles.input}
                        min="0.1"
                        step="0.1"
                        disabled={loading}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('irrigation_pattern')}</label>
                    <select
                        name="irrigationPattern"
                        value={formData.irrigationPattern}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="کل زمین هم‌زمان آبیاری می‌شود">{t('entire_field_at_once')}</option>
                        <option value="زمین به دو بخش تقسیم شده">{t('field_divided_two')}</option>
                        <option value="زمین به چند ناحیه آبیاری می‌شود">{t('field_multiple_zones')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('slope_height')}</label>
                    <select
                        name="slopeHeight"
                        value={formData.slopeHeight}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="زمین کاملاً صاف است">{t('completely_flat')}</option>
                        <option value="کمی شیب دارد">{t('slightly_sloped')}</option>
                        <option value="شیب‌دار یا پله‌ای">{t('steep_or_terraced')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('water_source')}</label>
                    <select
                        name="waterSource"
                        value={formData.waterSource}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="استخر ذخیره">{t('storage_pool')}</option>
                        <option value="رودخانه">{t('river')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('distance_to_source')}</label>
                    <select
                        name="distanceToSource"
                        value={formData.distanceToSource}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="کمتر از ۲۰ متر">{t('less_than_20m')}</option>
                        <option value="بیشتر از ۲۰ متر">{t('more_than_20m')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('source_elevation')}</label>
                    <select
                        name="sourceElevation"
                        value={formData.sourceElevation}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="پایین‌تر از زمین">{t('below_ground')}</option>
                        <option value="بالاتر از زمین">{t('above_ground')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('crop_type')}</label>
                    <select
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="غلات">{t('cereals')}</option>
                        <option value="سبزیجات">{t('vegetables')}</option>
                        <option value="درختی">{t('trees')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('irrigation_time')}</label>
                    <input
                        type="number"
                        name="irrigationTime"
                        value={formData.irrigationTime}
                        onChange={handleChange}
                        className={styles.input}
                        min="0.1"
                        step="0.1"
                        disabled={loading}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('irrigation_frequency')}</label>
                    <select
                        name="irrigationFrequency"
                        value={formData.irrigationFrequency}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="یک بار">{t('once')}</option>
                        <option value="دو بار">{t('twice')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('pipe_diameter')}</label>
                    <select
                        name="pipeDiameter"
                        value={formData.pipeDiameter}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="۲ اینچ (۵۰ میلی‌متر)">{t('2_inch_50mm')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('pipe_length')}</label>
                    <input
                        type="number"
                        name="pipeLength"
                        value={formData.pipeLength}
                        onChange={handleChange}
                        className={styles.input}
                        min="1"
                        step="1"
                        disabled={loading}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('pipe_material')}</label>
                    <select
                        name="pipeMaterial"
                        value={formData.pipeMaterial}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="PVC">{t('pvc')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('irrigation_system')}</label>
                    <select
                        name="irrigationSystem"
                        value={formData.irrigationSystem}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="قطره‌ای">{t('drip')}</option>
                        <option value="بارانی">{t('sprinkler')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('dripper_pressure')}</label>
                    <select
                        name="dripperPressure"
                        value={formData.dripperPressure}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="۱.۵ بار">{t('1_5_bar')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('climate_type')}</label>
                    <select
                        name="climateType"
                        value={formData.climateType}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="گرم و خشک">{t('hot_dry')}</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('water_temp')}</label>
                    <select
                        name="waterTemp"
                        value={formData.waterTemp}
                        onChange={handleChange}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="۱۵ تا ۲۵">{t('15_25')}</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={handleCalculate}
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? t('calculating') : t('calculate')}
                </button>
                {result && (
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? t('generating_pdf') : t('export_pdf')}
                    </button>
                )}
            </div>
            {(result || error) && (
                <div className={styles.resultContainer}>
                    <h2 className={styles.resultTitle}>{t('result')}</h2>
                    <div className={styles.resultBox}>
                        {error ? (
                            <p className={styles.warning}>{error}</p>
                        ) : result.error ? (
                            <p className={styles.warning}>{result.error}</p>
                        ) : (
                            <>
                                <p>
                                    <strong>{t('flow_rate')}:</strong>{' '}
                                    {result.specifications?.flow_rate || t('unavailable')} {t('cubic_meters_per_hour')}
                                </p>
                                <p>
                                    <strong>{t('total_head')}:</strong>{' '}
                                    {result.specifications?.total_head || t('unavailable')} {t('meters')}
                                </p>
                                <p>
                                    <strong>{t('pressure')}:</strong>{' '}
                                    {result.specifications?.pressure || t('unavailable')} {t('bar')}
                                </p>
                                {result.pump ? (
                                    <>
                                        <p>
                                            <strong>{t('pump_name')}:</strong>{' '}
                                            {result.pump.name || t('unavailable')}
                                        </p>
                                        <p>
                                            <strong>{t('brand')}:</strong>{' '}
                                            {result.pump.brand || t('unavailable')}
                                        </p>
                                        <p>
                                            <strong>{t('price')}:</strong>{' '}
                                            {result.pump.price
                                                ? result.pump.price.toLocaleString() + ' ' + t('currency')
                                                : t('unavailable')}
                                        </p>
                                        <p>
                                            <strong>{t('power')}:</strong>{' '}
                                            {result.pump.power || t('unavailable')}
                                        </p>
                                    </>
                                ) : (
                                    <p className={styles.warning}>{t('no_pump_warning')}</p>
                                )}
                                {result.warning && (
                                    <div className={styles.warning}>
                                        {typeof result.warning === 'string' ? (
                                            <p>{t('warning')}: {result.warning}</p>
                                        ) : (
                                            <>
                                                <p>{t('warning')}: {result.warning.message}</p>
                                                {result.warning.suggestion && (
                                                    <p>{t('suggestion')}: {result.warning.suggestion}</p>
                                                )}
                                                {result.warning.closest_match && (
                                                    <p>{t('closest_match')}: {result.warning.closest_match}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export async function getServerSideProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}