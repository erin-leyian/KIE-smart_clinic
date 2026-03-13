const express = require('express');
const router = express.Router();
const { handleIncomingSMS } = require('../controllers/sms.controller');

// POST /api/sms/webhook — receives incoming SMS from Africa's Talking
// No auth required — Africa's Talking calls this directly
router.post('/webhook', handleIncomingSMS);

module.exports = router;