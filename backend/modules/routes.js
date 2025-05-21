const express = require('express');
const router = express.Router();
const { calculateResidentialPump } = require('./residential/calculate');
const { calculateIrrigationPump } = require('./irrigation-pump/calculate');
const PDFDocument = require('pdfkit');

router.post('/irrigation/calculate', async (req, res) => {
  try {
    const result = await calculateIrrigationPump(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/residential/calculate', async (req, res) => {
  try {
    const { floors, parkingFloors, units, powerType, inletPipeSize } = req.body;
    const result = await calculateResidentialPump({
      floors,
      parkingFloors,
      units,
      powerType: powerType || 'electric',
      inletPipeSize,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    res.json({ message: 'User registered successfully', user: { username, email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
      res.json({ token: 'mock-token-123' });
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/pdf/generate-pdf', async (req, res) => {
  try {
    const { result } = req.body;
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=irrigation_report.pdf');
    doc.pipe(res);
    doc.fontSize(16).text('Irrigation Calculation Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Flow Rate: ${result.specifications?.flow_rate || 'N/A'} m³/h`);
    doc.text(`Total Head: ${result.specifications?.total_head || 'N/A'} m`);
    doc.text(`Pressure: ${result.specifications?.pressure || 'N/A'} bar`);
    if (result.pump) {
      doc.moveDown();
      doc.text(`Pump Name: ${result.pump.name || 'N/A'}`);
      doc.text(`Brand: ${result.pump.brand || 'N/A'}`);
      doc.text(`Price: ${result.pump.price ? result.pump.price.toLocaleString() : 'N/A'}`);
      doc.text(`Power: ${result.pump.power || 'N/A'}`);
    }
    if (result.warning) {
      doc.moveDown();
      doc.text(`Warning: ${result.warning.message || 'N/A'}`);
      if (result.warning.suggestion) {
        doc.text(`Suggestion: ${result.warning.suggestion}`);
      }
      if (result.warning.closest_match) {
        doc.text(`Closest Match: ${result.warning.closest_match}`);
      }
    }
    doc.end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;