import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { fetchCoefficients, updateCoefficient } from '/api/adminApi.js';

const ParameterForm = () => {
  const { t } = useTranslation();
  const [coefficients, setCoefficients] = useState({});
  const [module, setModule] = useState('greenhouse');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadCoefficients = async () => {
      try {
        const data = await fetchCoefficients(module);
        setCoefficients(data);
        setError(null);
      } catch (err) {
        setError(t('parameterForm.fetchError'));
      }
    };
    loadCoefficients();
  }, [module]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCoefficients((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateCoefficient({ module, coefficients });
      setSuccess(t('parameterForm.updateSuccess'));
      setError(null);
    } catch (err) {
      setError(t('parameterForm.updateError'));
      setSuccess(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('parameterForm.module')}</InputLabel>
        <Select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          label={t('parameterForm.module')}
        >
          <MenuItem value="greenhouse">{t('parameterForm.greenhouse')}</MenuItem>
          <MenuItem value="irrigation">{t('parameterForm.irrigation')}</MenuItem>
        </Select>
      </FormControl>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        {Object.keys(coefficients).map((key) => (
          <TextField
            key={key}
            label={t(`parameterForm.${key}`)}
            name={key}
            type="number"
            value={coefficients[key] || ''}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        ))}
        <Button type="submit" variant="contained" fullWidth>
          {t('parameterForm.submit')}
        </Button>
      </Box>
    </Box>
  );
};

export default ParameterForm;