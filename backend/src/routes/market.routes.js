// src/routes/market.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/marketplace.controller');
const { requireAuth } = require('../middleware/auth');

// Crop marketplace
router.get('/crops',          ctrl.getAllListings);          // Public – browse all
router.get('/crops/mine',     requireAuth, ctrl.getMyListings);
router.get('/crops/:id',      ctrl.getListing);              // Public
router.post('/crops',         requireAuth, ctrl.createListing);
router.put('/crops/:id',      requireAuth, ctrl.updateListing);
router.delete('/crops/:id',   requireAuth, ctrl.deleteListing);

// Equipment rentals
router.get('/rentals',        ctrl.getRentals);              // Public
router.post('/rentals',       requireAuth, ctrl.createRental);

module.exports = router;
