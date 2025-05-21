import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/Greenhouse.module.css';
import api from '../api/api';
import Link from 'next/link';

export default function Greenhouse() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    area: '5000', // متر مربع
    irrigationSystem: 'قطره‌ای',
    irrigationPattern: 'کل زمین هم‌زمان آبیاری می‌شود',
    cropType: 'گلخانه‌ای',
    irrigationTime: '2',
    slopeHeight: 'زمین کاملاً صاف است',
    distanceToSource: 'کمتر از ۲۰ متر',
    sourceElevation: 'پایین‌تر از زمین',
    pipeLength: '20',
    pipeDiameter: '50',
    dripperPressure: '1.5',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedResult = localStorage.getItem('greenhouseResult');
    if (cachedResult) {
      try {
        setResult(JSON.parse(cachedResult));
      } catch (err) {
        console.error('Error parsing cached result:', err);
        localStorage.removeItem('greenhouseResult');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const area = parseFloat(formData.area);
    const irrigationTime = parseFloat(formData.irrigationTime);
    const pipeLength = parseFloat(formData.pipeLength);
    const pipeDiameter = parseFloat(formData.pipeDiameter);
    const dripperPressure = parseFloat(formData.dripperPressure);

    if (isNaN(area) || area <= 0) {
      throw new Error(t('area_must_be_positive'));
    }
    if (isNaN(irrigationTime) || irrigationTime <= 0) {
      throw new Error(t('irrigation_time_must_be_positive'));
    }
    if (isNaN(pipeLength) || pipeLength <= 0) {
      throw new Error(t('pipe_length_must_be_positive'));
    }
    if (isNaN(pipeDiameter) || pipeDiameter <= 0) {
      throw new Error(t('pipe_diameter_must_be_positive'));
    }
    if (isNaN(dripperPressure) || dripperPressure <= 0) {
      throw new Error(t('dripper_pressure_must_be_positive'));
    }
  };

  const handleCalculate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      validateForm();
      const response = await api.post('/irrigation/calculate', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setResult(response.data);
      localStorage.setItem('greenhouseResult', JSON.stringify(response.data));
    } catch (error) {
      console.error('Calculation error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/admin';
        setError(t('please_login_again'));
      } else {
        const errorMessage = error.response?.data?.error || error.message || t('unknown_error');
        setError(t('server_error') + ': ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('greenhouse_title')}</h1>
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
            step="1"
            min="1"
            disabled={loading}
            required
          />
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
            <option value="سطحی">{t('surface')}</option>
          </select>
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
          <label className={styles.label}>{t('crop_type')}</label>
          <select
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            className={styles.select}
            disabled={loading}
          >
            <option value="گلخانه‌ای">{t('greenhouse')}</option>
            <option value="سبزیجات">{t('vegetables')}</option>
            <option value="درختی">{t('trees')}</option>
            <option value="غلات">{t('cereals')}</option>
            <option value="علوفه‌ای">{t('forage')}</option>
            <option value="سایر">{t('other')}</option>
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
            step="0.1"
            min="0.1"
            disabled={loading}
            required
          />
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
          <label className={styles.label}>{t('pipe_length')}</label>
          <input
            type="number"
            name="pipeLength"
            value={formData.pipeLength}
            onChange={handleChange}
            className={styles.input}
            min="1"
            disabled={loading}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('pipe_diameter')}</label>
          <input
            type="number"
            name="pipeDiameter"
            value={formData.pipeDiameter}
            onChange={handleChange}
            className={styles.input}
            min="10"
            disabled={loading}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('dripper_pressure')}</label>
          <input
            type="number"
            name="dripperPressure"
            value={formData.dripperPressure}
            onChange={handleChange}
            className={styles.input}
            step="0.1"
            min="0.1"
            disabled={loading}
            required
          />
        </div>
        <button
          type="button"
          onClick={handleCalculate}
          className={styles.button}
          disabled={loading}
        >
          {loading ? t('calculating') : t('calculate')}
        </button>
      </div>
      {(result || error) && (
        <div className={styles.resultContainer}>
          <h2 className={styles.resultTitle}>{t('result')}</h2>
          <div className={styles.resultBox}>
            {error ? (
              <p className={styles.warning}>{error}</p>
            ) : (
              <>
                <p>
                  <strong>{t('flow_rate')}:</strong>{' '}
                  {result.specifications?.flow_rate || t('unavailable')}
                </p>
                <p>
                  <strong>{t('total_head')}:</strong>{' '}
                  {result.specifications?.total_head || t('unavailable')}
                </p>
                <p>
                  <strong>{t('pressure')}:</strong>{' '}
                  {result.specifications?.pressure || t('unavailable')}
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
                      <strong>{t('pump_flow_rate')}:</strong>{' '}
                      {result.pump.flow_rate || t('unavailable')}
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
                    <p>{t('warning')}: {result.warning.message}</p>
                    {result.warning.suggestion && (
                      <p>{t('suggestion')}: {result.warning.suggestion}</p>
                    )}
                    {result.warning.closest_match && (
                      <p>{t('closest_match')}: {result.warning.closest_match}</p>
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