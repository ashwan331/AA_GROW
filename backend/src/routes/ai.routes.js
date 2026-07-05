// src/routes/ai.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/chat',                   requireAuth, ctrl.chat);
router.get('/chat/history',            requireAuth, ctrl.getChatHistory);
router.get('/notifications',           requireAuth, ctrl.getNotifications);
router.put('/notifications/:id/read',  requireAuth, ctrl.markNotificationRead);

module.exports = router;
