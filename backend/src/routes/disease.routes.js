// src/routes/disease.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/disease.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/',        requireAuth, ctrl.detectDisease);
router.get('/history',  requireAuth, ctrl.getHistory);
router.delete('/:id',   requireAuth, ctrl.deleteScan);

module.exports = router;
