// src/routes/fertilizer.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/fertilizer.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/',         requireAuth, ctrl.recommend);
router.get('/history',   requireAuth, ctrl.getHistory);
router.delete('/:id',    requireAuth, ctrl.deleteRecommendation);

module.exports = router;
