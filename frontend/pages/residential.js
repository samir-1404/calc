import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/Residential.module.css';
import api from '../api/api';
import Link from 'next/link';

export default function Residential() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    floors: '5',
    parkingFloors: '2',
    units: '20',
    powerType: 'electric',
    inletPipeSize: '50',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedResult = localStorage.getItem('residentialResult');
    if (cachedResult) {
      try {
        setResult(JSON.parse(cachedResult));
      } catch (err) {
        console.error('Error parsing cached result:', err);
        localStorage.removeItem('residentialResult');
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

  const validateAndTransformData = () => {
    const floors = parseInt(formData.floors);
    const parkingFloors = parseInt(formData.parkingFloors);
    const units = parseInt(formData.units);
    const inletPipeSize = parseFloat(formData.inletPipeSize);

    if (isNaN(floors) || floors <= 0) {
      throw new Error(t('floors_must_be_positive'));
    }
    if (isNaN(parkingFloors) || parkingFloors < 0) {
      throw new Error(t('parking_floors_cannot_be_negative'));
    }
    if (isNaN(units) || units <= 0) {
      throw new Error(t('units_must_be_positive'));
    }
    if (isNaN(inletPipeSize) || inletPipeSize <= 0) {
      throw new Error(t('inlet_pipe_size_must_be_positive'));
    }

    return {
      floors: floors.toString(),
      parkingFloors: parkingFloors.toString(),
      units: units.toString(),
      powerType: formData.powerType,
      inletPipeSize: inletPipeSize.toString(),
    };
  };

  const handleCalculate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const transformedData = validateAndTransformData();
      const response = await api.post('/api/residential/calculate', transformedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setResult(response.data);
      localStorage.setItem('residentialResult', JSON.stringify(response.data));
    } catch (error) {
      console.error('Calculation error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
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
        <h1 className={styles.title}>{t('residential_title')}</h1>
        <Link href="/signup">
          <button className={styles.signupButton}>{t('signup')}</button>
        </Link>
      </header>
      <div className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('floors_label')}</label>
          <input
            type="number"
            name="floors"
            value={formData.floors}
            onChange={handleChange}
            className={styles.input}
            min="1"
            disabled={loading}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('parking_floors_label')}</label>
          <input
            type="number"
            name="parkingFloors"
            value={formData.parkingFloors}
            onChange={handleChange}
            className={styles.input}
            min="0"
            disabled={loading}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('units_label')}</label>
          <input
            type="number"
            name="units"
            value={formData.units}
            onChange={handleChange}
            className={styles.input}
            min="1"
            disabled={loading}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('power_type')}</label>
          <select
            name="powerType"
            value={formData.powerType}
            onChange={handleChange}
            className={styles.select}
            disabled={loading}
          >
            <option value="electric">{t('electric')}</option>
            <option value="diesel">{t('diesel')}</option>
            <option value="solar">{t('solar')}</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('inlet_pipe_size')}</label>
          <input
            type="number"
            name="inletPipeSize"
            value={formData.inletPipeSize}
            onChange={handleChange}
            className={styles.input}
            min="10"
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