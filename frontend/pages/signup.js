// frontend/pages/signup.js
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/Signup.module.css';
import api from '../api/api';
import Link from 'next/link';

export default function Signup() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/api/auth/signup', formData);
      setSuccess(t('signup_success'));
    } catch (error) {
      setError(t('signup_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('signup_title')}</h1>
        <Link href="/login">
          <button className={styles.loginButton}>{t('login')}</button>
        </Link>
      </header>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('username')}</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('password')}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? t('submitting') : t('signup')}
        </button>
        {error && <p className={styles.warning}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </form>
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