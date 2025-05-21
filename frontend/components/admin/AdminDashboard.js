import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Tabs, Tab, Typography, Box } from '@mui/material';
import PumpTable from './PumpTable';
import ParameterForm from './ParameterForm';
import StatsCard from './StatsCard';
import { fetchAdminStats, fetchPumps } from '/api/adminApi.js';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ totalPumps: 0, dailyCalculations: 0, activeUsers: 0 });
  const [pumps, setPumps] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await fetchAdminStats();
        const pumpsData = await fetchPumps();
        setStats(statsData);
        setPumps(pumpsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('adminDashboard.title')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <StatsCard title={t('adminDashboard.totalPumps')} value={stats.totalPumps} />
        <StatsCard title={t('adminDashboard.dailyCalculations')} value={stats.dailyCalculations} />
        <StatsCard title={t('adminDashboard.activeUsers')} value={stats.activeUsers} />
      </Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label={t('adminDashboard.pumps')} />
        <Tab label={t('adminDashboard.parameters')} />
      </Tabs>
      {tabValue === 0 && <PumpTable pumps={pumps} />}
      {tabValue === 1 && <ParameterForm />}
    </Container>
  );
};

export default AdminDashboard;