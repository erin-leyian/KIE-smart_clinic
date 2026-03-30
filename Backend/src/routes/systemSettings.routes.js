const express = require('express');
const router = express.Router();
const {
  // Hospitals
  getAllHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  // Insurance
  getAllInsurance,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  // Conditions
  getAllConditions,
  createCondition,
  updateCondition,
  deleteCondition,
} = require('../controllers/systemSettings.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All system settings endpoints require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// ============= HOSPITALS =============
router.get('/hospitals', getAllHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);

// ============= INSURANCE =============
router.get('/insurance', getAllInsurance);
router.post('/insurance', createInsurance);
router.put('/insurance/:id', updateInsurance);
router.delete('/insurance/:id', deleteInsurance);

// ============= CONDITIONS =============
router.get('/conditions', getAllConditions);
router.post('/conditions', createCondition);
router.put('/conditions/:id', updateCondition);
router.delete('/conditions/:id', deleteCondition);

module.exports = router;
