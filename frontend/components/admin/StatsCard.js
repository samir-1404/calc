import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { Card, CardContent } from '@chakra-ui/react';

const StatsCard = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Card>
        <CardContent>
          <Typography variant="h6">{t('stats.pumpCount')}</Typography>
          <Typography variant="body1">{stats.pumpCount || 0}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">{t('stats.dailyCalculations')}</Typography>
          <Typography variant="body1">{stats.dailyCalculations || 0}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">{t('stats.activeUsers')}</Typography>
          <Typography variant="body1">{stats.activeUsers || 0}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StatsCard;