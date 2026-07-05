// src/routes/dashboard.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, ctrl.getSummary);
router.get('/export',  requireAuth, ctrl.exportPDF);

module.exports = router;
