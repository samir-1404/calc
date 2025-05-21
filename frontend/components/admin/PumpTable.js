import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { addPump, updatePump, deletePump } from '/api/adminApi.js';

const PumpTable = ({ pumps }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editPump, setEditPump] = useState(null);
  const [formData, setFormData] = useState({ name: '', brand: '', flow_rate: '', head: '', power: '', price: '' });
  const [error, setError] = useState(null);

  const columns = [
    { field: 'name', headerName: t('pumpTable.name'), width: 150 },
    { field: 'brand', headerName: t('pumpTable.brand'), width: 150 },
    { field: 'flow_rate', headerName: t('pumpTable.flowRate'), width: 120 },
    { field: 'head', headerName: t('pumpTable.head'), width: 100 },
    { field: 'power', headerName: t('pumpTable.power'), width: 100 },
    { field: 'price', headerName: t('pumpTable.price'), width: 120 },
    {
      field: 'actions',
      headerName: t('pumpTable.actions'),
      width: 200,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleEdit(params.row)}>{t('pumpTable.edit')}</Button>
          <Button onClick={() => handleDelete(params.row.id)} color="error">{t('pumpTable.delete')}</Button>
        </>
      ),
    },
  ];

  const handleEdit = (pump) => {
    setEditPump(pump);
    setFormData(pump);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePump(id);
      setError(null);
    } catch (err) {
      setError(t('pumpTable.deleteError'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editPump) {
        await updatePump(editPump.id, formData);
      } else {
        await addPump(formData);
      }
      setOpen(false);
      setFormData({ name: '', brand: '', flow_rate: '', head: '', power: '', price: '' });
      setError(null);
    } catch (err) {
      setError(t('pumpTable.submitError'));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditPump(null);
    setFormData({ name: '', brand: '', flow_rate: '', head: '', power: '', price: '' });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        {t('pumpTable.addPump')}
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataGrid rows={pumps} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editPump ? t('pumpTable.editPump') : t('pumpTable.addPump')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('pumpTable.name')}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('pumpTable.brand')}
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('pumpTable.flowRate')}
            name="flow_rate"
            type="number"
            value={formData.flow_rate}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('pumpTable.head')}
            name="head"
            type="number"
            value={formData.head}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('pumpTable.power')}
            name="power"
            type="number"
            value={formData.power}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('pumpTable.price')}
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('pumpTable.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t('pumpTable.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PumpTable;