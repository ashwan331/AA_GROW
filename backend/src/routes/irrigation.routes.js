// src/routes/irrigation.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/irrigation.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/soil',               requireAuth, ctrl.getSoilData);
router.post('/soil',              requireAuth, ctrl.addSoilData);
router.post('/trigger',           requireAuth, ctrl.triggerIrrigation);
router.get('/logs',               requireAuth, ctrl.getLogs);
router.get('/weather-advisory',   requireAuth, ctrl.getWeatherAdvisory);

module.exports = router;
